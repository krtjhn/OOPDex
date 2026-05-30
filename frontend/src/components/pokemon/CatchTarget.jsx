// Import React library
import React from 'react';

// Define catch target image path
const catchTargetImage = '/assets/images/catch.png';

// Forward ref component for catch target
const CatchTarget = React.forwardRef(({ visible, proximity = 0, isActive = false, isBusy = false }, ref) => {
  // Return null if not visible
  if (!visible) return null;

  // Calculate dynamic scale based on proximity and active state
  const scale = 1 + proximity * 0.22 + (isActive ? 0.08 : 0);
  // Calculate dynamic opacity based on busy state and proximity
  const opacity = isBusy ? 1 : 0.9 + proximity * 0.1;
  // Convert proximity to integer percentage
  const proximityPercent = Math.round(proximity * 100);

  return (
    // Main catch target container
    <div
      ref={ref}
      className={`catch-target ${isActive ? 'is-active' : ''} ${isBusy ? 'is-busy' : ''}`.trim()}
      style={{
        // Set base transform
        transform: `translateX(-50%) scale(${scale})`,
        // Set dynamic opacity
        opacity,
        // Set custom CSS variables for animations
        '--catch-proximity': proximity.toFixed(2),
        '--catch-proximity-percent': `${proximityPercent}%`,
        '--catch-glow-size': `${0.55 + proximity * 1.2}rem`,
        '--catch-ring-glow-size': `${1 + proximity * 2}rem`,
        '--catch-ring-opacity-low': 0.35 + proximity * 0.45,
        '--catch-ring-opacity-high': 0.55 + proximity * 0.45,
        '--catch-beam-opacity': 0.25 + proximity * 0.65,
        '--catch-beam-scale': 0.85 + proximity * 0.25
      }}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <span
        className="catch-target__ring catch-target__ring--outer" // Outer animation ring
      />
      <span
        className="catch-target__ring catch-target__ring--inner" // Inner animation ring
      />
      <span
        className="catch-target__beam" // Target beam effect
      />
      <img
        src={catchTargetImage} // Target image
        alt="Catch target"
      />
      <span
        className="catch-target__label" // Status label text
      >
        {isBusy ? 'Catching...' : isActive ? 'Release!' : 'Drag here'}
      </span>
    </div>
  );
});

// Set display name for debugging
CatchTarget.displayName = 'CatchTarget';

// Export component
export default CatchTarget;
