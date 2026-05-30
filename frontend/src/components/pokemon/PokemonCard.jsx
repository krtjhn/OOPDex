// Import React hooks
import React, { useCallback, useRef } from 'react'; // Import React, useCallback, and useRef from react
// Import utility functions
import { getPrimaryPokemonType, getPokemonName, padPokemonCode } from '../../utils/pokemonCatalog'; // Import helper functions from catalog utilities
// Import audio utility
import { playPokemonCry } from '../../utils/pokemonAudio'; // Import playPokemonCry function from audio utilities

// Helper to capitalize strings
const capitalize = (value) => { // Define capitalisation helper function receiving value
  // Return empty if falsy
  if (!value) return ''; // If value is falsy, return empty string
  // Return capitalized string
  return value.charAt(0).toUpperCase() + value.slice(1); // Capitalize first letter and append the rest of the string
}; // Close capitalization helper function block

// Helper to reset hover effects
const resetHoverPosition = (node) => { // Define resetHoverPosition function taking a DOM node
  // Guard check node
  if (!node) return; // If node is falsy, exit function

  // Remove tilt X variable
  node.style.removeProperty('--card-tilt-x'); // Remove card-tilt-x custom style property
  // Remove tilt Y variable
  node.style.removeProperty('--card-tilt-y'); // Remove card-tilt-y custom style property
  // Remove glare X variable
  node.style.removeProperty('--card-glare-x'); // Remove card-glare-x custom style property
  // Remove glare Y variable
  node.style.removeProperty('--card-glare-y'); // Remove card-glare-y custom style property
}; // Close resetHoverPosition function block

// Helper to calculate and apply hover transforms
const updateHoverPosition = (node, event) => { // Define updateHoverPosition function taking a node and an event
  // Guard check node and pointer type
  if (!node || event.pointerType === 'touch') return; // Exit if node is falsy or event is touch-triggered

  // Get node boundaries
  const rect = node.getBoundingClientRect(); // Get boundary dimensions of the node
  // Calculate relative X coordinate
  const x = (event.clientX - rect.left) / rect.width; // Calculate horizontal cursor ratio
  // Calculate relative Y coordinate
  const y = (event.clientY - rect.top) / rect.height; // Calculate vertical cursor ratio
  // Clamp X value
  const safeX = Math.min(Math.max(x, 0), 1); // Clamp horizontal ratio between 0 and 1
  // Clamp Y value
  const safeY = Math.min(Math.max(y, 0), 1); // Clamp vertical ratio between 0 and 1

  // Set CSS variable for X tilt
  node.style.setProperty('--card-tilt-x', `${((0.5 - safeY) * 3.2).toFixed(2)}deg`); // Set custom tilt-x property based on vertical cursor ratio
  // Set CSS variable for Y tilt
  node.style.setProperty('--card-tilt-y', `${((safeX - 0.5) * 4).toFixed(2)}deg`); // Set custom tilt-y property based on horizontal cursor ratio
  // Set CSS variable for X glare
  node.style.setProperty('--card-glare-x', `${(safeX * 100).toFixed(0)}%`); // Set custom glare-x property based on horizontal cursor ratio
  // Set CSS variable for Y glare
  node.style.setProperty('--card-glare-y', `${(safeY * 100).toFixed(0)}%`); // Set custom glare-y property based on vertical cursor ratio
}; // Close updateHoverPosition function block

// PokemonCard Component
const PokemonCard = ({ // Define functional PokemonCard component
  pokemon, // Destructure pokemon prop
  imageSrc, // Destructure imageSrc prop
  onClick, // Destructure onClick callback prop
  onDoubleClick, // Destructure onDoubleClick callback prop
  onPointerDown, // Destructure onPointerDown callback prop
  onPointerUp, // Destructure onPointerUp callback prop
  onPointerMove, // Destructure onPointerMove callback prop
  onPointerCancel, // Destructure onPointerCancel callback prop
  onMouseEnter, // Destructure onMouseEnter callback prop
  onMouseLeave, // Destructure onMouseLeave callback prop
  footer, // Destructure footer element prop
  className = '', // Destructure className prop defaulting to empty string
  overlay = null, // Destructure overlay element prop defaulting to null
  renderImage, // Destructure custom renderImage function prop
  ariaLabel, // Destructure ariaLabel string prop
  titleClassName = '', // Destructure titleClassName prop defaulting to empty string
  style, // Destructure style object prop
  articleRef, // Destructure articleRef callback/object prop
}) => { // Start component body
  // Internal ref for the card node
  const cardRef = useRef(null); // Declare internal reference for the card element

  // Callback to handle passing ref to parent
  const setArticleRef = useCallback( // Define callback to register component reference
    (node) => { // Accept the DOM node reference
      // Update internal ref
      cardRef.current = node; // Save the node to the internal cardRef

      // Check if parent ref is function
      if (typeof articleRef === 'function') { // Check if the parent ref is a callback function
        // Call parent ref function
        articleRef(node); // Invoke callback function with the DOM node
      } else if (articleRef) { // Else check if parent ref exists as a mutable object ref
        // Assign to parent ref object
        articleRef.current = node; // Assign node directly to parent ref object current field
      } // Close ref assignment conditional block
    }, // Close callback function body
    [articleRef] // Declare dependency array containing parent ref
  ); // Close useCallback hook

  // Return null if no pokemon data
  if (!pokemon) return null; // If pokemon object is undefined or null, return null to render nothing

  // Extract primary type
  const primaryType = getPrimaryPokemonType(pokemon); // Retrieve primary pokemon type using helper function
  // Extract pokemon name
  const pokemonName = getPokemonName(pokemon); // Retrieve name of the pokemon using helper function
  // Capitalize display name
  const displayName = capitalize(pokemonName); // Capitalize the retrieved pokemon name for UI display
  // Format ID with padding
  const pokemonCode = padPokemonCode(pokemon.id); // Format and pad the pokemon ID (e.g. 001) using helper function
  // Determine aria label
  const label = ariaLabel || `View details for ${displayName || 'Pokémon'}`; // Set accessibility label with fallback text

  // Handle card click event
  const handleClick = (event) => { // Define handleClick function taking click event
    // Play pokemon sound effect
    playPokemonCry(pokemon.id, 0.5); // Play at 50% volume // Play pokemon sound effect using utility function
    // Check if onClick is provided
    if (onClick) { // Check if parent passed an onClick handler callback
      // Trigger onClick callback
      onClick(event); // Invoke onClick handler passing the event object
    } // Close click callback conditional block
  }; // Close handleClick function block

  // Handle pointer move event
  const handlePointerMove = (event) => { // Define handlePointerMove function taking event
    // Update 3D hover effect variables
    updateHoverPosition(cardRef.current, event); // Calculate and apply custom hover styles to the card
    // Trigger optional callback
    onPointerMove?.(event); // Invoke onPointerMove callback if defined
  }; // Close handlePointerMove function block

  // Handle pointer cancel event
  const handlePointerCancel = (event) => { // Define handlePointerCancel function taking event
    // Reset hover effects
    resetHoverPosition(cardRef.current); // Reset hover transform variables on the card element
    // Trigger optional callback
    onPointerCancel?.(event); // Invoke onPointerCancel callback if defined
  }; // Close handlePointerCancel function block

  // Handle mouse leave event
  const handleMouseLeave = (event) => { // Define handleMouseLeave function taking event
    // Reset hover effects
    resetHoverPosition(cardRef.current); // Reset hover transform variables on the card element
    // Trigger optional callback
    onMouseLeave?.(event); // Invoke onMouseLeave callback if defined
  }; // Close handleMouseLeave function block

  return ( // Start JSX template rendering
    <article // Render the main card element
      // Close article opening tag
      // Close main card article element
      ref={setArticleRef} // Bind the ref callback to save the DOM node
      className={`card-pokemon ${primaryType} ${className}`.trim()} // Dynamically set type and custom styling classes
      draggable={false} // Disable native browser element dragging
      role={onClick ? 'button' : undefined} // Add accessibility button role if card is clickable
      tabIndex={onClick ? 0 : undefined} // Enable tab focus if card is clickable
      aria-label={label} // Set the accessibility labels for screen readers
      onClick={handleClick} // Set click event handler function
      onDoubleClick={onDoubleClick} // Set double click event handler function
      onPointerDown={onPointerDown} // Set pointer down event handler function
      onPointerUp={onPointerUp} // Set pointer up event handler function
      onPointerMove={handlePointerMove} // Set pointer move event handler function
      onPointerCancel={handlePointerCancel} // Set pointer cancel event handler function
      onMouseEnter={onMouseEnter} // Set mouse enter event handler function
      onMouseLeave={handleMouseLeave} // Set mouse leave event handler function
      onDragStart={(event) => event.preventDefault()} // Prevent default drag start behaviors
      style={style} // Apply custom inline style definitions
      onKeyDown={(event) => { // Set keyboard event handler for key press events
        // Abort if not clickable
        if (!onClick) return; // Exit if card does not have click behavior
        // Check for enter or space key
        if (event.key === 'Enter' || event.key === ' ') { // Check if either Enter or Space was pressed
          // Prevent default scrolling
          event.preventDefault(); // Prevent page scroll action on Space key press
          // Trigger click handler
          handleClick(event); // Execute the handleClick function
        } // Close keyboard verification conditional block
      }} // Close onKeyDown inline function body
    >
      <div
        // Image container
        // Render wrapper div for the image element
        className="image"
      >
        {
          // Conditional image rendering
          renderImage ? ( // Check if custom image renderer prop is provided
            // Custom image renderer
            renderImage({ pokemon, primaryType, imageSrc }) // Invoke parent's custom image renderer function
          ) : ( // Else render default image tag
            // Default image tag
            <img src={imageSrc} alt={pokemonName} className="thumb-img" draggable={false} /> // Render default sprite image element
          ) // Close conditional image rendering block
        }
        {
          // Optional overlay content
          overlay // Render overlay element if provided
        }
      </div>
      { // Close image wrapper div element
      }

      <div
        // Info container
        // Render wrapper div for text and icon details
        className="info"
      >
        <div
          // Text details container
          // Render container for name and code
          className="text"
        >
          <span
            // Pokemon code // Render padded pokemon code
          >
            {pokemonCode}
          </span>
          <h3
            className={titleClassName} // Pokemon display name // Render capitalized pokemon display name heading
          >
            {displayName}
          </h3>
        </div>
        { // Close text details container div element
        }
        <div
          // Type icon container
          // Render container for type icon image
          className="icon"
        >
          <img
            src={`/assets/images/${primaryType}_1.svg`} // Type icon image // Render primary type SVG icon image
            alt={primaryType}
          />
        </div>
        { // Close icon container div element
        }
      </div>
      { // Close info container div element
      }

      {
        // Conditional footer rendering
        footer ? ( // Check if footer react element is provided
          <div
            // Footer wrapper
            // Render footer wrapper and prevent event bubbling
            // Close footer wrapper div element
            className="card-pokemon-footer"
            onClick={(event) => event.stopPropagation()}
          >
            {
              // Footer content
              footer // Render footer child elements
            }
          </div>
        ) : null // Close conditional footer rendering block
      }
    </article>
  ); // Close return statement
}; // Close component definition block

// Export PokemonCard component
export default PokemonCard; // Export PokemonCard as the default module export
