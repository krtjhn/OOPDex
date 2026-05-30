// Import React hooks: useEffect for side effects, useRef for DOM references, useState for local state
import React, { useEffect, useRef, useState } from 'react';
// Import the createPortal utility from react-dom to render the modal at the document root
import { createPortal } from 'react-dom';
// Import the X icon from lucide-react for the close button
import { X } from 'lucide-react';
// Import the configured axios API client
import apiClient from '../../api/axios';
// Import the GlassCard styled component
import GlassCard from '../../components/GlassCard';
// Import the custom useToast hook for notifications
import { useToast } from '../../components/Toast';
// Import the utility function to get the animated GIF path for a Pokemon
import { getPokemonGifPath } from '../../utils/pokemonMedia';
// Import the utility function to play sound effects
import { playPogoSound } from '../../utils/pogoAudio';
// Import the utility function to get the primary type of a Pokemon
import { getPrimaryPokemonType } from '../../utils/pokemonCatalog';
// Store the path to the release pokeball image
const releaseBallImage = '/assets/images/catch.png';
// Import the specific stylesheet for the collection page
import '../../styles/my-collection.css';

// Define the different phases of the release animation sequence
const RELEASE_PHASES = {
  // Initial phase where user aims the ball
  AIMING: 'aiming',
  // Phase if the user misses the target
  MISSED: 'missed',
  // Phase when the vacuum animation is running
  CAPTURING: 'capturing',
  // Final phase indicating successful release
  SUCCESS: 'success'
};

// Define the MyCollection functional component
const MyCollection = () => {
  // State to hold the array of Pokemon in the user's collection
  const [collection, setCollection] = useState([]);
  // State to hold all pokemon catalog data as a map for fast lookup
  const [pokemonMap, setPokemonMap] = useState({});
  // State to track if the initial data load is in progress
  const [loading, setLoading] = useState(true);
  // State to hold the specific caught Pokemon currently selected for release
  const [releaseEncounter, setReleaseEncounter] = useState(null);
  // State to track the current phase of the release interaction
  const [releasePhase, setReleasePhase] = useState(RELEASE_PHASES.AIMING);
  // State to track the XY offset of the dragged release ball
  const [releaseBallOffset, setReleaseBallOffset] = useState({ x: 0, y: 0 });
  // State to track the calculated offset for the vacuum animation
  const [releaseVacuumOffset, setReleaseVacuumOffset] = useState({ x: 0, y: 180 });
  // State to track coordinates for rendering the throwing trail
  const [releaseTrail, setReleaseTrail] = useState(null);
  // State to track whether the user is actively dragging the ball
  const [isDraggingReleaseBall, setIsDraggingReleaseBall] = useState(false);
  // Ref to hold the DOM element of the release drop target
  const releaseTargetRef = useRef(null);
  // Ref to hold the DOM element of the throwable ball
  const releaseBallRef = useRef(null);
  // Ref to temporarily store dragging session data (start coords, etc.)
  const releaseDragRef = useRef(null);
  // Extract the showToast function from the useToast hook
  const { showToast } = useToast();

  // Effect hook to fetch the collection data when the component mounts
  useEffect(() => {
    // Call the fetch function
    fetchCollection();
  // Empty dependency array ensures this only runs once
  }, []);

  // Define the asynchronous function to fetch the user's collection and the global catalog
  const fetchCollection = async () => {
    // Try block to handle potential API errors
    try {
      // Fetch both collection and all pokemon in parallel
      const [collectionRes, pokemonRes] = await Promise.all([
        apiClient.get('/pokemon/my-collection'),
        apiClient.get('/pokemon', { meta: { suppressGlobalErrorToast: true } })
      ]);
      // Initialize temp map
      const map = {};
      // Populate map if response is an array
      if (Array.isArray(pokemonRes.data)) {
        // Iterate through catalog
        pokemonRes.data.forEach((p) => {
          // Store in map
          map[p.id] = p;
        });
      }
      // Save map to state
      setPokemonMap(map);
      // Update the collection state with the received data
      setCollection(collectionRes.data);
    // Catch block for handling fetch failures
    } catch {
      // Show an error toast to the user
      showToast('Failed to load collection', 'error');
    // Finally block executes regardless of outcome
    } finally {
      // Set loading state to false to reveal the UI
      setLoading(false);
    }
  };

  // Helper function to determine the display name, prioritizing custom nicknames
  const getDisplayName = (caughtPokemon) => {
    // Return nickname if set
    if (caughtPokemon?.nickname) return caughtPokemon.nickname;
    // Resolve name from map
    const p = pokemonMap[caughtPokemon?.pokemonId];
    // Return resolved name or fallback
    return p?.name ? p.name : 'Pokemon';
  };

  // Function to initialize the release interaction modal for a specific Pokemon
  const openReleaseEncounter = (caughtPokemon) => {
    // Set the selected Pokemon into state
    setReleaseEncounter(caughtPokemon);
    // Reset the release phase to aiming
    setReleasePhase(RELEASE_PHASES.AIMING);
    // Reset the draggable ball's position
    setReleaseBallOffset({ x: 0, y: 0 });
    // Reset the vacuum animation offset to its default starting position
    setReleaseVacuumOffset({ x: 0, y: 180 });
    // Clear any existing drag trail
    setReleaseTrail(null);
    // Play the throw sound effect to indicate readiness
    playPogoSound('pokeball-throw.wav', 0.3);
  };

  // Function to close the release interaction modal
  const closeReleaseEncounter = () => {
    // Prevent closing if the capture animation is currently running to avoid breaking state
    if (releasePhase === RELEASE_PHASES.CAPTURING) return;
    // Clear the selected Pokemon, which unmounts the modal
    setReleaseEncounter(null);
    // Clear the visual drag trail
    setReleaseTrail(null);
    // Reset the dragging flag
    setIsDraggingReleaseBall(false);
  };

  // Asynchronous function to handle the successful drop of the ball on the target
  const completeRelease = async (ballCenter) => {
    // Guard clause to ensure a Pokemon is actually selected
    if (!releaseEncounter) return;

    // Try block to handle the release API call and animation sequencing
    try {
      // Get the current dimensions and position of the drop target
      const targetRect = releaseTargetRef.current?.getBoundingClientRect();
      // If target exists and ball coordinates were provided
      if (targetRect && ballCenter) {
        // Calculate and set the offset for the vacuum effect based on drop location relative to target center
        setReleaseVacuumOffset({
          // Calculate X offset
          x: ballCenter.x - (targetRect.left + targetRect.width / 2),
          // Calculate Y offset
          y: ballCenter.y - (targetRect.top + targetRect.height / 2)
        });
      }

      // Advance the phase to start the vacuum capturing animation
      setReleasePhase(RELEASE_PHASES.CAPTURING);
      // Play the take-in sound effect
      playPogoSound('pokeball-take-in.wav', 0.7);
      // Play the first wobble sound at 1200ms
      setTimeout(() => playPogoSound('catch-wobble.wav', 0.6), 1200);
      // Play the second wobble sound at 1800ms
      setTimeout(() => playPogoSound('catch-wobble.wav', 0.6), 1800);
      // Play the third wobble sound at 2400ms
      setTimeout(() => playPogoSound('catch-wobble.wav', 0.6), 2400);
      // Wait for the visual animations (wobbles) to complete (2900ms) before making the API call
      await new Promise((resolve) => setTimeout(resolve, 2900));
      // Make the DELETE request to release the Pokemon by its unique capture ID
      await apiClient.delete(`/pokemon/release/${releaseEncounter.id}`);
      // Advance the phase to indicate successful network response
      setReleasePhase(RELEASE_PHASES.SUCCESS);
      // Play the success sound effect
      playPogoSound('pokeball-gotcha.wav', 0.75);
      // Optimistically remove the released Pokemon from the local collection state
      setCollection((previous) => previous.filter((entry) => entry.id !== releaseEncounter.id));
      // Show a success notification with the Pokemon's name
      showToast(`${getDisplayName(releaseEncounter)} has been released into the wild.`, 'success');
      // Set a timeout to automatically close the modal after showing success state
      setTimeout(() => {
        // Clear the encounter state
        setReleaseEncounter(null);
        // Reset ball offset
        setReleaseBallOffset({ x: 0, y: 0 });
        // Reset vacuum offset
        setReleaseVacuumOffset({ x: 0, y: 180 });
        // Clear trail
        setReleaseTrail(null);
      // Timeout duration
      }, 1200);
    // Catch block to handle API errors during release
    } catch {
      // Revert the phase back to aiming so the user can try again
      setReleasePhase(RELEASE_PHASES.AIMING);
      // Show an error notification
      showToast('Could not release Pokemon', 'error');
    }
  };

  // Pointer down event handler to start the drag interaction
  const handleReleaseBallPointerDown = (event) => {
    // Guard clauses: exit if no encounter, or if an animation is playing
    if (!releaseEncounter || releasePhase === RELEASE_PHASES.CAPTURING || releasePhase === RELEASE_PHASES.SUCCESS) return;
    // Only allow left clicks (button 0) or touch events
    if (typeof event.button === 'number' && event.button !== 0) return;

    // Prevent default browser behaviors like text selection
    event.preventDefault();
    // Stop event bubbling
    event.stopPropagation();
    // Capture the pointer so events continue firing even if cursor leaves the element
    event.currentTarget.setPointerCapture?.(event.pointerId);
    // Store initial drag coordinates and offsets in a mutable ref to avoid state churn
    releaseDragRef.current = {
      // Store starting client X
      startX: event.clientX,
      // Store starting client Y
      startY: event.clientY,
      // Store current visual X offset
      initialX: releaseBallOffset.x,
      // Store current visual Y offset
      initialY: releaseBallOffset.y
    };
    // Ensure the phase is set to aiming
    setReleasePhase(RELEASE_PHASES.AIMING);
    // Set flag indicating drag is active
    setIsDraggingReleaseBall(true);
    // Initialize the trail coordinates at the pointer location
    setReleaseTrail({ x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
    // Play throwing sound on pickup
    playPogoSound('pokeball-throw.wav', 0.38);
  };

  // Pointer move event handler to update position during drag
  const handleReleaseBallPointerMove = (event) => {
    // Retrieve the active drag session data from the ref
    const dragSession = releaseDragRef.current;
    // Exit early if no drag session is active
    if (!dragSession) return;

    // Prevent default behaviors (e.g., scrolling on touch devices)
    event.preventDefault();
    // Calculate and set the new visual offset based on distance moved from start
    setReleaseBallOffset({
      // Calculate new X: Initial offset + (Current Pointer X - Start Pointer X)
      x: dragSession.initialX + event.clientX - dragSession.startX,
      // Calculate new Y: Initial offset + (Current Pointer Y - Start Pointer Y)
      y: dragSession.initialY + event.clientY - dragSession.startY
    });
    // Update the trail end coordinates while preserving the original start point
    setReleaseTrail({
      // Current X
      x: event.clientX,
      // Current Y
      y: event.clientY,
      // Original start X
      startX: dragSession.startX,
      // Original start Y
      startY: dragSession.startY
    });
  };

  // Pointer up event handler to process the drop action
  const handleReleaseBallPointerUp = (event) => {
    // Retrieve the active drag session data
    const dragSession = releaseDragRef.current;
    // Exit early if no drag was active
    if (!dragSession) return;

    // Prevent default browser behavior
    event.preventDefault();
    // Stop event bubbling
    event.stopPropagation();
    // Release the pointer capture now that interaction is complete
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    // Clear the drag session reference
    releaseDragRef.current = null;
    // Set dragging flag to false
    setIsDraggingReleaseBall(false);

    // Get the bounding rectangle of the drop target element
    const targetRect = releaseTargetRef.current?.getBoundingClientRect();
    // Calculate if the pointer coordinates fall within the target's bounding box plus a 28px buffer margin
    const didHitTarget = targetRect
      // Check left boundary
      && event.clientX >= targetRect.left - 28
      // Check right boundary
      && event.clientX <= targetRect.right + 28
      // Check top boundary
      && event.clientY >= targetRect.top - 28
      // Check bottom boundary
      && event.clientY <= targetRect.bottom + 28;

    // If the drop was a successful hit
    if (didHitTarget) {
      // Call completeRelease, passing the final coordinates, and ignore the returned promise
      void completeRelease({ x: event.clientX, y: event.clientY });
      // Exit early
      return;
    }

    // If it missed the target, update the phase state to trigger the miss animation
    setReleasePhase(RELEASE_PHASES.MISSED);
    // Play a dull thud sound for the miss
    playPogoSound('pokeball-throw.wav', 0.2);
    // Set a timeout to reset the state after the miss animation finishes
    setTimeout(() => {
      // Snap the ball back to origin
      setReleaseBallOffset({ x: 0, y: 0 });
      // Clear the trail
      setReleaseTrail(null);
      // Reset phase back to aiming
      setReleasePhase(RELEASE_PHASES.AIMING);
    // Timeout duration of 360ms
    }, 360);
  };

  // Pointer cancel event handler for edge cases (e.g. system dialog interrupts drag)
  const handleReleaseBallPointerCancel = (event) => {
    // Clear drag session reference
    releaseDragRef.current = null;
    // Clear dragging flag
    setIsDraggingReleaseBall(false);
    // Clear the visual trail
    setReleaseTrail(null);
    // Snap ball back to origin
    setReleaseBallOffset({ x: 0, y: 0 });
    // Release pointer capture
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  // Conditional render if data is still loading
  if (loading) {
    // Return the loading skeleton UI
    return (
      <section
        // Container with loading modifier class
        className="collection-scene collection-scene--loading"
      >
        <div
          // Decorative mist element
          className="collection-scene__mist"
        />
        <p
          // Loading text indicator
        >
          Loading your Pokedex...
        </p>
      </section>
    );
  }

  // Main render block for the MyCollection component
  return (
    <section
      // Main wrapper section with scene styling
      className="collection-scene"
    >
      <div
        // Render decorative background mist
        className="collection-scene__mist"
      />
      <div
        // Render decorative left sunbeam
        className="collection-scene__sunbeam collection-scene__sunbeam--left"
      />
      <div
        // Render decorative right sunbeam
        className="collection-scene__sunbeam collection-scene__sunbeam--right"
      />

      <div
        // Header container for title and count
        className="collection-header"
      >
        <div
          // Title container
        >
          <p
            // Eyebrow sub-heading
            className="collection-header__eyebrow"
          >
            Pokemon GO Storage
          </p>
          <h2
            // Main heading
          >
            My Collection
          </h2>
        </div>
        <span
          // Display the total number of Pokemon in the collection
          className="collection-total"
        >
          Total: {collection.length}
        </span>
      </div>

      {
        // Conditional rendering based on collection emptiness
        collection.length === 0 ? (
          <GlassCard
            // Render empty state utilizing the GlassCard component
            className="collection-empty"
          >
            <p
              // Empty state messaging
            >
              Your collection is empty. Go catch some Pokemon!
            </p>
          </GlassCard>
        ) : (
          <div
            // Render the grid layout for collected Pokemon if not empty
            className="collection-grid"
          >
            {
              // Iterate over the collection array
              collection.map((caughtPokemon) => {
                // Extract the display name for the current item
                const displayName = getDisplayName(caughtPokemon);
                // Resolve the primary type of the Pokemon
                const primaryType = getPrimaryPokemonType(pokemonMap[caughtPokemon.pokemonId]);

                return (
                  <article
                    // Card container with unique key
                    key={caughtPokemon.id}
                    // Apply primary type class to the card container
                    className={`collection-pokemon ${primaryType}`}
                  >
                    <div
                      // Decorative spotlight effect behind the Pokemon
                      className="collection-pokemon__spotlight"
                    />
                    <div
                      // Decorative drop shadow effect under the Pokemon
                      className="collection-pokemon__shadow"
                    />

                    <img
                      // Render the animated GIF sprite of the Pokemon
                      // Construct image source URL using utility
                      src={getPokemonGifPath(caughtPokemon.pokemonId)}
                      // Add descriptive alt text
                      alt={displayName}
                      // Apply styling class
                      className="collection-pokemon__image"
                      // Prevent native browser drag behavior
                      draggable={false}
                    />

                    <div
                      // Container for card interactions (the release button)
                      className="collection-pokemon__actions"
                    >
                      <button
                        // Button triggering the release modal
                        // Explicit type
                        type="button"
                        // Attach click handler to open the encounter for this specific Pokemon
                        onClick={() => openReleaseEncounter(caughtPokemon)}
                        // Play hover sound effect on mouse enter
                        onMouseEnter={() => playPogoSound('pokeball-throw.wav', 0.28)}
                        // Apply styling class
                        className="collection-release-btn"
                        // Screen reader accessible label
                        aria-label={`Release ${displayName}`}
                      >
                        <img
                          // Render the catch image icon
                          src="/assets/images/catch.png"
                          alt="Release"
                          className="collection-release-btn__image"
                          draggable={false}
                        />
                      </button>
                    </div>
                  </article>
                );
              })
            }
          </div>
        )
      }

      {
        // Conditionally render the interactive release encounter modal using React Portal if selected
        releaseEncounter && createPortal(
          <div
            // Modal wrapper with accessibility attributes and type-colored background glows
            className={`release-encounter ${getPrimaryPokemonType(pokemonMap[releaseEncounter.pokemonId])}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Release ${getDisplayName(releaseEncounter)}`}
          >
            <button
              // Close button for the modal
              // Explicit type
              type="button"
              // Apply close button styling
              className="release-encounter__close"
              // Attach close handler
              onClick={closeReleaseEncounter}
              // Screen reader label
              aria-label="Close release encounter"
              // Disable closing while the irreversible capture animation is running
              disabled={releasePhase === RELEASE_PHASES.CAPTURING}
            >
              <X
                // Render Lucide X icon
                size={22}
              />
            </button>

            <div
              // Main interactive field area, applying classes based on current phase and type
              className={`release-encounter__field is-${releasePhase}`}
              // Inject CSS variables for the vacuum animation offsets and coordinates
              style={{
                // Final X offset
                '--release-vacuum-x': `${releaseVacuumOffset.x}px`,
                // Final Y offset
                '--release-vacuum-y': `${releaseVacuumOffset.y}px`,
                // Intermediate 34% X offset for animation easing
                '--release-vacuum-x-34': `${releaseVacuumOffset.x * 0.34}px`,
                // Intermediate 34% Y offset for animation easing
                '--release-vacuum-y-34': `${releaseVacuumOffset.y * 0.34}px`
              }}
            >
              <div
                // Outer HUD corner border element top-left
                className="release-encounter__hud-bracket release-encounter__hud-bracket--tl"
              />
              <div
                // Outer HUD corner border element top-right
                className="release-encounter__hud-bracket release-encounter__hud-bracket--tr"
              />
              <div
                // Outer HUD corner border element bottom-left
                className="release-encounter__hud-bracket release-encounter__hud-bracket--bl"
              />
              <div
                // Outer HUD corner border element bottom-right
                className="release-encounter__hud-bracket release-encounter__hud-bracket--br"
              />
              <div
                // Cyberpunk overlay scanning bar moving vertically
                className="release-encounter__hud-scanline"
              />
              <div
                // Interactive HUD header display panel
                className="release-encounter__hud-readout"
              >
                <div
                  // Spinning digital tech graphic indicator
                  className="release-encounter__hud-icon"
                />
                <span
                  // Text line indicating transfer scan state
                  className="release-encounter__hud-text"
                >
                  SYSTEM: TRANSFER RETICLE ACTIVE | READY TO CONVERT
                </span>
              </div>
              <div
                // Ambient particle vortex showing elemental type colors
                className="release-encounter__portal"
              />
              <div
                // Shockwave ripple animation 1 timing helper
                className="release-encounter__wobble-ring release-encounter__wobble-ring--1"
              />
              <div
                // Shockwave ripple animation 2 timing helper
                className="release-encounter__wobble-ring release-encounter__wobble-ring--2"
              />
              <div
                // Shockwave ripple animation 3 timing helper
                className="release-encounter__wobble-ring release-encounter__wobble-ring--3"
              />
              <div
                // Dynamic screen flare blast on success confirmation
                className="release-encounter__success-blast"
              />
              <div
                // Render background sky gradient
                className="release-encounter__sky"
              />
              <div
                // Render decorative concentric rings in sky
                className="release-encounter__rings"
              />

              {
                // Animated dust particles
                // Generate an array of 8 empty slots to map over for rendering particles
                [...Array(8)].map((_, i) => (
                  <span
                    // Render individual dust particle span
                    // Key using index
                    key={i}
                    // Apply dust styling class
                    className="release-encounter__dust"
                    // Inject randomized animation parameters via CSS variables
                    style={{
                      // Calculate horizontal drift distance
                      '--dx': `${(i % 2 === 0 ? 1 : -1) * (12 + i * 7)}px`,
                      // Stagger animation start times
                      '--delay': `${i * 0.65}s`,
                      // Vary animation durations
                      '--dur': `${2.8 + i * 0.4}s`,
                      // Distribute horizontally
                      left: `${10 + i * 11}%`,
                      // Distribute vertically near the bottom
                      bottom: `${8 + (i % 3) * 8}%`,
                    }}
                  />
                ))
              }

              <div
                // Grass foreground strip
                // Render foreground element
                className="release-encounter__grass"
              />

              <div
                // Render the drop target area wrapping the Pokemon image
                ref={releaseTargetRef}
                className="release-encounter__pokemon-target"
              >
                <div
                  // Outer cybernetic targeting ring rotating clockwise
                  className="release-encounter__target-reticle-outer"
                />
                <div
                  // Inner cybernetic targeting ring rotating counter-clockwise
                  className="release-encounter__target-reticle-inner"
                />
                <span
                  // Render the glowing target ring
                  className="release-encounter__lock-ring"
                />
                <img
                  // Render the Pokemon GIF at the target location
                  // Construct GIF path
                  src={getPokemonGifPath(releaseEncounter.pokemonId)}
                  // Alt text for accessibility
                  alt={getDisplayName(releaseEncounter)}
                  // Prevent browser dragging
                  draggable={false}
                />
              </div>

              <div
                // Status text overlay displaying instructions or feedback
                className="release-encounter__status"
                aria-live="polite"
              >
                <strong>
                  {
                    // Dynamically determine heading text based on current phase
                    // Text while vacuuming
                    // Check if success phase
                    // Text on completion
                    // Check if missed phase
                    // Text on miss
                    // Default aiming text
                    releasePhase === RELEASE_PHASES.CAPTURING
                      ? 'Opening ball...'
                      : releasePhase === RELEASE_PHASES.SUCCESS
                        ? 'Released!'
                        : releasePhase === RELEASE_PHASES.MISSED
                          ? 'Almost!'
                          : `Release ${getDisplayName(releaseEncounter)}`
                  }
                </strong>
                <span>
                  {
                    // Dynamically determine subtitle based on phase
                    // Instruction if missed
                    // Default instruction
                    releasePhase === RELEASE_PHASES.MISSED
                      ? 'Aim closer to the glowing ring.'
                      : 'Drag the Pokeball into the Pokemon to set it free.'
                  }
                </span>
              </div>

              {
                // Conditionally render the drag trail line behind the ball
                releaseTrail && (
                  <div
                    // Container for the visual trail
                    // Apply base class and conditional live class if dragging
                    className={`release-throw-trail ${isDraggingReleaseBall ? 'is-live' : ''}`}
                    // Inject mathematical geometry into CSS variables for rendering the line
                    style={{
                      // Left position matches current pointer X
                      left: `${releaseTrail.x}px`,
                      // Top position matches current pointer Y
                      top: `${releaseTrail.y}px`,
                      // Calculate rotation angle based on start and current points
                      '--trail-angle': `${Math.atan2(
                        releaseTrail.startY - releaseTrail.y,
                        releaseTrail.startX - releaseTrail.x
                      )}rad`,
                      // Calculate length based on distance, clamped to min/max values
                      // Max length
                      // Calculated length with minimum bound
                      '--trail-length': `${Math.min(
                        150,
                        Math.max(48, Math.hypot(releaseTrail.startX - releaseTrail.x, releaseTrail.startY - releaseTrail.y) * 0.45)
                      )}px`
                    }}
                  >
                    <span
                      // Element serving as the actual rendered line in CSS
                    />
                  </div>
                )
              }

              <button
                // The draggable Pokeball element
                // Ref required to track DOM node
                ref={releaseBallRef}
                // Explicit button type
                type="button"
                // Apply base class and conditional dragging class
                className={`release-pokeball ${isDraggingReleaseBall ? 'is-dragging' : ''}`}
                // Attach pointer down listener
                onPointerDown={handleReleaseBallPointerDown}
                // Attach pointer move listener
                onPointerMove={handleReleaseBallPointerMove}
                // Attach pointer up listener
                onPointerUp={handleReleaseBallPointerUp}
                // Attach pointer cancel listener
                onPointerCancel={handleReleaseBallPointerCancel}
                // Inject dynamic X/Y offsets to position the ball
                style={{
                  // X offset variable
                  '--release-ball-x': `${releaseBallOffset.x}px`,
                  // Y offset variable
                  '--release-ball-y': `${releaseBallOffset.y}px`
                }}
                // Accessibility label
                aria-label="Throw Pokeball to release Pokemon"
              >
                {
                  // Render the expanding wobble rings if in capturing phase
                  releasePhase === RELEASE_PHASES.CAPTURING && (
                    <>
                      <span
                        // First expanding wobble shockwave ring
                        className="release-pokeball__wobble-ring release-pokeball__wobble-ring--1"
                      />
                      <span
                        // Second expanding wobble shockwave ring
                        className="release-pokeball__wobble-ring release-pokeball__wobble-ring--2"
                      />
                      <span
                        // Third expanding wobble shockwave ring
                        className="release-pokeball__wobble-ring release-pokeball__wobble-ring--3"
                      />
                    </>
                  )
                }
                {
                  // Render the particle sparks explosion if release is successful
                  releasePhase === RELEASE_PHASES.SUCCESS && (
                    <div
                      // Container for the explosion sparks
                      className="release-pokeball__explosion"
                    >
                      {
                        // Generate 12 radial spark elements mapped outward
                        [...Array(12)].map((_, i) => (
                          <span
                            // Individual spark element with index key
                            key={i}
                            // Apply styling class
                            className="release-pokeball__spark"
                            // Inject speed, delay and angle via CSS variables
                            style={{
                              // Split angle evenly across 360 degrees
                              '--angle': `${(i * 360) / 12}deg`,
                              // Speed variation for realistic delay
                              '--speed': `${0.65 + (i % 3) * 0.12}s`,
                              // Delay stagger offset
                              '--delay': `${(i % 2) * 0.04}s`
                            }}
                          />
                        ))
                      }
                    </div>
                  )
                }
                <img
                  // Render the visual image of the ball
                  src={releaseBallImage}
                  alt=""
                  className="release-pokeball__image"
                  draggable={false}
                />
              </button>
            </div>
          </div>,
          // Render the modal element as a direct child of document.body
          document.body
        )
      }
    </section>
  );
};

// Export the component as default
export default MyCollection;
