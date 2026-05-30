// Import React hooks
import React, { useEffect, useState } from 'react';
// Import useLocation hook from react-router-dom
import { useLocation } from 'react-router-dom';

// PokeballTransition component
const PokeballTransition = ({ children }) => {
  // Get current location
  const location = useLocation();
  // State for the location to display
  const [displayLocation, setDisplayLocation] = useState(location);
  // State for transition active status (starts true on mount)
  const [isActive, setIsActive] = useState(true);

  // Function to play pokeball sound effect
  const playPokeballSound = () => {
    // Try block to handle potential audio errors
    try {
      // Create new Audio object
      const audio = new Audio('/assets/pokemon-audio/pokeball.mp3');
      // Set volume to 100%
      audio.volume = 1.0;
      // Play audio and catch promise rejection
      audio.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch (error) {
      // Catch any other errors
    }
  };

  // Effect to handle initial page load transition
  useEffect(() => {
    // Set timeout to open the pokeball
    const timer = setTimeout(() => {
      // Deactivate transition
      setIsActive(false);
    }, 400);
    // Cleanup timeout
    return () => clearTimeout(timer);
  }, []);

  // Effect to handle route changes
  useEffect(() => {
    // Check if location path has changed
    if (location.pathname !== displayLocation.pathname) {
      // Activate transition to close pokeball
      setIsActive(true);
      // Play sound effect
      playPokeballSound();
      
      // Set timeout to wait for close animation
      const timer = setTimeout(() => {
        // Update displayed location to match current
        setDisplayLocation(location);
        // Deactivate transition to open pokeball
        setIsActive(false);
      }, 600); 

      // Cleanup timeout
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname]);

  return (
    // Fragment wrapper
    <>
      <div
        // Transition container div
        className={`pokeball-anim-container ${isActive ? 'pokeball-anim-active' : ''}`}
      >
        <div
          // Top half of pokeball
          className="pokeball-top"
        ></div>
        <div
          // Bottom half of pokeball
          className="pokeball-bottom"
        ></div>
        <div
          // Center circle of pokeball
          className="pokeball-center"
        >
          <div
            // Inner center circle
            className="pokeball-center-inner"
          ></div>
        </div>
      </div>
      
      {
        // Clone children with delayed location
        React.cloneElement(children, { location: displayLocation })
      }
    </>
  );
};

// Export PokeballTransition component
export default PokeballTransition;
