import { useCallback, useEffect, useRef, useState } from 'react';

const HOLD_TO_DRAG_MS = 750;
const OPEN_DETAIL_DELAY_MS = 220;
const SNAP_BACK_DURATION_MS = 300;
const VACUUM_DURATION_MS = 620;

const buildDroppedState = (session, targetElement, offsetX, offsetY) => {
  if (!session || !targetElement) {
    return { proximity: 0, isOverTarget: false };
  }

  const targetRect = targetElement.getBoundingClientRect();
  const movedCardRect = {
    left: session.baseRect.left + offsetX,
    top: session.baseRect.top + offsetY,
    right: session.baseRect.right + offsetX,
    bottom: session.baseRect.bottom + offsetY
  };

  const cardCenterX = session.baseRect.left + offsetX + session.baseRect.width / 2;
  const cardCenterY = session.baseRect.top + offsetY + session.baseRect.height / 2;

  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  const distance = Math.hypot(cardCenterX - targetCenterX, cardCenterY - targetCenterY);
  const activationDistance = Math.max(260, targetRect.width * 1.9);
  const proximity = Math.max(0, 1 - distance / activationDistance);
  const overlapsTarget =
    movedCardRect.left < targetRect.right &&
    movedCardRect.right > targetRect.left &&
    movedCardRect.top < targetRect.bottom &&
    movedCardRect.bottom > targetRect.top;
  const isOverTarget = overlapsTarget || distance <= targetRect.width * 0.9;

  return {
    proximity,
    isOverTarget,
    cardCenterX,
    cardCenterY,
    targetCenterX,
    targetCenterY,
    cardWidth: session.baseRect.width,
    cardHeight: session.baseRect.height
  };
};

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const usePokemonDragCatch = ({ onCatch, onDragStart, initialCaughtPokemonIds = [] }) => {
  const [readyPokemonId, setReadyPokemonId] = useState(null);
  const [draggingPokemonId, setDraggingPokemonId] = useState(null);
  const [hoveredPokemonId, setHoveredPokemonId] = useState(null);
  const [caughtPokemonIds, setCaughtPokemonIds] = useState(() => new Set());
  const [snapBackPokemonId, setSnapBackPokemonId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [proximity, setProximity] = useState(0);
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [isCatching, setIsCatching] = useState(false);
  const [dragTrail, setDragTrail] = useState(null);
  const [vacuumEffect, setVacuumEffect] = useState(null);

  const targetRef = useRef(null);
  const cardRefs = useRef(new Map());
  const dragSessionRef = useRef(null);
  const holdSessionRef = useRef(null);
  const holdTimerRef = useRef(null);
  const clickTimerRef = useRef(null);
  const snapBackTimerRef = useRef(null);
  const blockClickUntilRef = useRef(0);

  const clearHoldSession = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdSessionRef.current = null;
  }, []);

  const isCaught = useCallback(
    (pokemonId) => {
      return caughtPokemonIds.has(pokemonId);
    },
    [caughtPokemonIds]
  );

  useEffect(() => {
    const normalizedIds = (initialCaughtPokemonIds || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    setCaughtPokemonIds(new Set(normalizedIds));
  }, [initialCaughtPokemonIds]);

  const registerCardRef = useCallback((pokemonId, node) => {
    if (!pokemonId) return;
    if (node) {
      cardRefs.current.set(pokemonId, node);
    } else {
      cardRefs.current.delete(pokemonId);
    }
  }, []);

  const beginDrag = useCallback((pokemonId, clientX, clientY) => {
    const cardNode = cardRefs.current.get(pokemonId);
    if (!cardNode) return false;

    dragSessionRef.current = {
      pokemonId,
      startX: clientX,
      startY: clientY,
      lastX: clientX,
      lastY: clientY,
      baseRect: cardNode.getBoundingClientRect()
    };

    setDraggingPokemonId(pokemonId);
    setDragOffset({ x: 0, y: 0 });
    setDragTrail({
      x: clientX,
      y: clientY,
      startX: clientX,
      startY: clientY
    });
    setProximity(0);
    setIsTargetActive(false);
    blockClickUntilRef.current = Date.now() + 350;
    onDragStart?.(pokemonId);
    return true;
  }, [onDragStart]);

  const armCatchMode = useCallback((pokemonId) => {
    setReadyPokemonId((previous) => (previous === pokemonId ? null : pokemonId));
    setHoveredPokemonId(pokemonId);
    blockClickUntilRef.current = Date.now() + 350;
  }, []);

  const startSnapBack = useCallback((pokemonId) => {
    setSnapBackPokemonId(pokemonId);
    if (snapBackTimerRef.current) {
      clearTimeout(snapBackTimerRef.current);
    }

    snapBackTimerRef.current = setTimeout(() => {
      setSnapBackPokemonId(null);
    }, SNAP_BACK_DURATION_MS);
  }, []);

  const finishDrag = useCallback(
    async (event) => {
      const session = dragSessionRef.current;
      if (!session) return;

      const pointerX = typeof event?.clientX === 'number' ? event.clientX : session.lastX;
      const pointerY = typeof event?.clientY === 'number' ? event.clientY : session.lastY;
      const offsetX = pointerX - session.startX;
      const offsetY = pointerY - session.startY;
      const dropState = buildDroppedState(session, targetRef.current, offsetX, offsetY);
      const draggedPokemonId = session.pokemonId;

      dragSessionRef.current = null;
      setDraggingPokemonId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragTrail(null);
      setProximity(0);
      setIsTargetActive(false);

      if (!dropState.isOverTarget || isCatching) {
        startSnapBack(draggedPokemonId);
        return;
      }

      setIsCatching(true);
      setVacuumEffect({
        pokemonId: draggedPokemonId,
        startX: dropState.cardCenterX,
        startY: dropState.cardCenterY,
        endX: dropState.targetCenterX,
        endY: dropState.targetCenterY,
        width: dropState.cardWidth,
        height: dropState.cardHeight,
        key: Date.now()
      });

      try {
        await wait(VACUUM_DURATION_MS);
        const didCatch = await Promise.resolve(onCatch?.(draggedPokemonId));
        if (didCatch) {
          setCaughtPokemonIds((previous) => {
            const next = new Set(previous);
            next.add(draggedPokemonId);
            return next;
          });
          setReadyPokemonId(null);
        }
      } finally {
        setIsCatching(false);
        setVacuumEffect(null);
      }
    },
    [isCatching, onCatch, startSnapBack]
  );

  useEffect(() => {
    if (!draggingPokemonId) return undefined;

    const handlePointerMove = (event) => {
      const session = dragSessionRef.current;
      if (!session) return;

      event.preventDefault();
      session.lastX = event.clientX;
      session.lastY = event.clientY;

      const offsetX = event.clientX - session.startX;
      const offsetY = event.clientY - session.startY;
      const dropState = buildDroppedState(session, targetRef.current, offsetX, offsetY);

      setDragOffset({ x: offsetX, y: offsetY });
      setDragTrail({
        x: event.clientX,
        y: event.clientY,
        startX: session.startX,
        startY: session.startY
      });
      setProximity(dropState.proximity);
      setIsTargetActive(dropState.isOverTarget);
    };

    const handlePointerUp = (event) => {
      void finishDrag(event);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingPokemonId, finishDrag]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      if (snapBackTimerRef.current) {
        clearTimeout(snapBackTimerRef.current);
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const handleCardClick = useCallback(
    (pokemon, event, onOpenDetails) => {
      if (!pokemon?.id) return;

      if (Date.now() < blockClickUntilRef.current || draggingPokemonId || readyPokemonId === pokemon.id) {
        event.preventDefault();
        return;
      }

      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = setTimeout(() => {
        onOpenDetails?.(pokemon);
      }, OPEN_DETAIL_DELAY_MS);
    },
    [draggingPokemonId, readyPokemonId]
  );

  const handleCardDoubleClick = useCallback((event) => {
    // Double-click is intentionally disabled in favor of press-and-hold.
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleCardPointerDown = useCallback(
    (pokemonId, event) => {
      if (!pokemonId || isCaught(pokemonId) || isCatching) return;
      if (typeof event.button === 'number' && event.button !== 0) return;

      if (event.currentTarget?.setPointerCapture && typeof event.pointerId === 'number') {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // ignore pointer capture failure
        }
      }

      if (readyPokemonId === pokemonId) {
        event.preventDefault();
        event.stopPropagation();
        clearHoldSession();
        beginDrag(pokemonId, event.clientX, event.clientY);
        return;
      }

      clearHoldSession();
      setHoveredPokemonId(pokemonId);

      holdSessionRef.current = {
        pokemonId,
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        activated: false
      };

      holdTimerRef.current = setTimeout(() => {
        const holdSession = holdSessionRef.current;
        if (!holdSession || holdSession.pokemonId !== pokemonId) return;
        if (isCaught(pokemonId) || isCatching) return;

        holdSession.activated = true;
        armCatchMode(pokemonId);
        beginDrag(pokemonId, holdSession.lastX, holdSession.lastY);
      }, HOLD_TO_DRAG_MS);
    },
    [armCatchMode, beginDrag, clearHoldSession, isCaught, isCatching, readyPokemonId]
  );

  const handleCardPointerMove = useCallback((pokemonId, event) => {
    const holdSession = holdSessionRef.current;
    if (!holdSession || holdSession.pokemonId !== pokemonId) return;
    holdSession.lastX = event.clientX;
    holdSession.lastY = event.clientY;
  }, []);

  const handleCardPointerUp = useCallback(
    (pokemonId, event) => {
      const holdSession = holdSessionRef.current;
      const isSamePointer = holdSession && holdSession.pokemonId === pokemonId && holdSession.pointerId === event.pointerId;

      if (isSamePointer) {
        clearHoldSession();
      }

      if (event.currentTarget?.releasePointerCapture && typeof event.pointerId === 'number') {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // ignore pointer release failure
        }
      }

      if (dragSessionRef.current?.pokemonId === pokemonId) {
        void finishDrag(event);
      }
    },
    [clearHoldSession, finishDrag]
  );

  const handleCardPointerCancel = useCallback(
    (pokemonId, event) => {
      clearHoldSession();
      if (dragSessionRef.current?.pokemonId === pokemonId) {
        void finishDrag(event);
      }
    },
    [clearHoldSession, finishDrag]
  );

  const handleCardMouseEnter = useCallback(
    (pokemonId) => {
      if (!pokemonId || isCaught(pokemonId)) return;
      setHoveredPokemonId(pokemonId);
    },
    [isCaught]
  );

  const handleCardMouseLeave = useCallback((pokemonId) => {
    setHoveredPokemonId((previous) => (previous === pokemonId ? null : previous));
  }, []);

  const getCardClassName = useCallback(
    (pokemonId) => {
      if (!pokemonId) return '';

      const classes = [];
      if (caughtPokemonIds.has(pokemonId)) classes.push('catch-card--caught');
      if (readyPokemonId === pokemonId) classes.push('catch-card--ready');
      if (draggingPokemonId === pokemonId) classes.push('catch-card--dragging');
      if (vacuumEffect?.pokemonId === pokemonId) classes.push('catch-card--vacuuming');
      if (snapBackPokemonId === pokemonId) classes.push('catch-card--snapback');
      return classes.join(' ');
    },
    [caughtPokemonIds, draggingPokemonId, readyPokemonId, snapBackPokemonId, vacuumEffect]
  );

  const getCardStyle = useCallback(
    (pokemonId) => {
      if (vacuumEffect?.pokemonId === pokemonId) {
        return {
          opacity: 0,
          pointerEvents: 'none',
          transform: 'scale(0.82)',
          transition: 'opacity 0.12s ease, transform 0.12s ease'
        };
      }

      if (draggingPokemonId === pokemonId) {
        const pull = Math.min(Math.max(proximity, 0), 1);
        const suctionScale = 1 - pull * 0.18;
        const suctionRotate = (dragOffset.x >= 0 ? 1 : -1) * pull * 5;

        return {
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${suctionScale}) rotate(${suctionRotate}deg)`,
          zIndex: 70,
          cursor: 'grabbing',
          touchAction: 'none',
          userSelect: 'none',
          '--catch-suction': pull.toFixed(2)
        };
      }

      if (readyPokemonId === pokemonId && !caughtPokemonIds.has(pokemonId)) {
        return { touchAction: 'none', userSelect: 'none' };
      }

      return undefined;
    },
    [caughtPokemonIds, dragOffset.x, dragOffset.y, draggingPokemonId, proximity, readyPokemonId, vacuumEffect]
  );

  const isTargetVisible = Boolean(hoveredPokemonId || readyPokemonId || draggingPokemonId);

  return {
    targetRef,
    readyPokemonId,
    draggingPokemonId,
    proximity,
    dragTrail,
    isTargetActive,
    isTargetVisible,
    isCatching,
    vacuumEffect,
    isCaught,
    registerCardRef,
    handleCardClick,
    handleCardDoubleClick,
    handleCardPointerDown,
    handleCardPointerMove,
    handleCardPointerUp,
    handleCardPointerCancel,
    handleCardMouseEnter,
    handleCardMouseLeave,
    getCardClassName,
    getCardStyle
  };
};

export default usePokemonDragCatch;
