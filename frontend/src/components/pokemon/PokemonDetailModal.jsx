// Import React hooks
import React, { useEffect, useMemo, useState } from 'react';
// Import utility functions
import { getPokemonTypes, getPrimaryPokemonType, padPokemonCode } from '../../utils/pokemonCatalog';
// Import audio utility
import { playPokemonCry } from '../../utils/pokemonAudio';

// Helper to capitalize strings
const capitalize = (value) => {
  // Return empty if falsy
  if (!value) return '';
  // Return capitalized string
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// PokemonDetailModal Component
const PokemonDetailModal = ({ pokemon, onClose, showAdminActions = false, viewMode = 'active', onEdit, onDelete, onRestore, onPermanentDelete }) => {
  // State for pokemon weaknesses
  const [weaknesses, setWeaknesses] = useState([]);

  // Memoized primary type
  const primaryType = useMemo(() => getPrimaryPokemonType(pokemon), [pokemon]);
  // Memoized all types
  const types = useMemo(() => getPokemonTypes(pokemon), [pokemon]);

  // Effect to play pokemon cry when modal opens
  useEffect(() => {
    // Check if pokemon data exists
    if (pokemon) {
      // Play sound effect at 50% volume
      playPokemonCry(pokemon.id, 0.5); 
    }
  }, [pokemon]);

  // Effect to handle keyboard navigation
  useEffect(() => {
    // Guard check for pokemon
    if (!pokemon) return undefined;

    // Handle keydown events
    const handleKeyDown = (event) => {
      // Check if escape key was pressed
      if (event.key === 'Escape') {
        // Call onClose handler
        onClose?.();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup event listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, pokemon]);

  // Effect to fetch type weaknesses from PokeAPI
  useEffect(() => {
    // Guard check for pokemon
    if (!pokemon) return;

    // Fetch type details
    fetch(`https://pokeapi.co/api/v2/type/${primaryType}`)
      // Parse JSON response
      .then((response) => response.json())
      // Handle data
      .then((data) => {
        // Extract double damage relations
        const doubleDamageFrom = data?.damage_relations?.double_damage_from || [];
        // Map to names and set state
        setWeaknesses(doubleDamageFrom.map((entry) => entry.name));
      })
      // Catch errors and clear state
      .catch(() => setWeaknesses([]));
  }, [pokemon, primaryType]);

  // Return null if no pokemon data
  if (!pokemon) return null;

  // Formatted stats array
  const stats = [
    { label: 'HP', value: pokemon.hp },
    { label: 'Attack', value: pokemon.attack },
    { label: 'Defense', value: pokemon.defense },
    { label: 'Sp. attack', value: pokemon.specialAttack },
    { label: 'Sp. defense', value: pokemon.specialDefense },
    { label: 'Speed', value: pokemon.speed },
  ];

  return (
    // Main modal container
    <div
      className="modal pokemon-detail-modal pokemon-detail-modal--open"
      type-pokemon-modal={primaryType}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokemon-detail-title"
    >
      <div
        className="overlay" // Background overlay
        onClick={onClose}
      />
      <div
        className="box pokemon-detail-modal__box" // Modal content box
      >
        <button
          className="close" // Close button
          onClick={onClose}
        >
          <img
            src="/assets/images/close.svg" // Close icon
            alt="close"
          />
        </button>

        {
          // Conditional rendering for admin actions
          showAdminActions ? (
            <div
              className="pokemon-detail-modal__admin-actions" // Admin actions container
              aria-label="Admin actions"
            >
              {
                // Conditional rendering based on view mode
                viewMode === 'active' ? (
                  // Active mode actions fragment
                  <>
                    <button
                      type="button"
                      className="pokemon-detail-modal__admin-action" // Edit button
                      title="Edit Pokemon"
                      onClick={() => onEdit?.(pokemon)}
                    >
                      <img
                        src="/assets/images/icon-edit.svg" // Edit icon
                        alt="Edit Pokemon"
                      />
                    </button>
                    <button
                      type="button"
                      className="pokemon-detail-modal__admin-action" // Delete button
                      title="Move to Recycle Bin"
                      onClick={() => onDelete?.(pokemon)}
                    >
                      <img
                        src="/assets/images/icon-delete.svg" // Delete icon
                        alt="Delete Pokemon"
                      />
                    </button>
                  </>
                ) : (
                  // Deleted mode actions fragment
                  <>
                    <button
                      type="button"
                      className="pokemon-detail-modal__admin-action bg-green-500 rounded-full" // Restore button
                      title="Restore Pokemon"
                      onClick={() => onRestore?.(pokemon)}
                      style={{ backgroundColor: '#22c55e', padding: '8px' }}
                    >
                      <svg
                        width="24" // Restore icon
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="pokemon-detail-modal__admin-action bg-red-500 rounded-full" // Permanent delete button
                      title="Permanently Delete"
                      onClick={() => onPermanentDelete?.(pokemon)}
                      style={{ backgroundColor: '#ef4444', padding: '8px' }}
                    >
                      <svg
                        width="24" // Permanent delete icon
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </>
                )
              }
            </div>
          ) : null
        }

        <div
          className="left-container" // Left container layout
        >
          <div
            className="icon" // Main type icon container
          >
            <img
              src={`/assets/images/${primaryType}_1.svg`} // Primary type SVG
              alt={primaryType}
            />
          </div>
          <div
            className="image" // Main pokemon image container
          >
            <img
              src={`/assets/pokemon-gifs/${pokemon.id}.gif`} // Animated pokemon gif
              alt={pokemon.name}
            />
          </div>
        </div>

        <div
          className="right-container" // Right container layout
        >
          <div
            className="name" // Name block
          >
            <h2
              id="pokemon-detail-title" // Pokemon display name
            >
              {capitalize(pokemon.name)}
            </h2>
            <span
              // Padded pokemon code
            >
              {padPokemonCode(pokemon.id)}
            </span>
          </div>

          <ul
            className="type" // Types list
          >
            {
              // Map over pokemon types
              types.map((type, index) => (
                <li
                  key={type} // Type list item with animation delay
                  style={{ '--reveal-delay': `${180 + index * 55}ms` }}
                >
                  <span
                    className={`tag-type ${type}`} // Styled type tag
                  >
                    {capitalize(type)}
                  </span>
                </li>
              ))
            }
          </ul>

          <ul
            className="info" // General info list
          >
            <li>
              <span>Height:</span>
              <strong
                // Height info
              >
                {pokemon.height || 0}m
              </strong>
            </li>
            <li>
              <span>Weight:</span>
              <strong
                // Weight info
              >
                {pokemon.weight || 0}kg
              </strong>
            </li>
            <li>
              <span>Abilities:</span>
              <strong
                // Abilities info
              >
                {pokemon.abilities || ''}
              </strong>
            </li>
          </ul>

          <div
            className="weak" // Weaknesses section
          >
            <h4
              // Weaknesses header
            >
              Weaknesses
            </h4>
            <ul>
              {
                // Map over weaknesses
                weaknesses.map((weakness, index) => (
                  <li
                    key={weakness} // Weakness list item with animation delay
                    style={{ '--reveal-delay': `${310 + index * 45}ms` }}
                  >
                    <span
                      className={`tag-type ${weakness}`} // Styled weakness tag
                    >
                      {capitalize(weakness)}
                    </span>
                  </li>
                ))
              }
            </ul>
          </div>

          <div
            className="stats" // Stats section
          >
            <h5
              // Stats header
            >
              Stats
            </h5>
            <div
              className="all" // Stats list container
            >
              {
                // Map over stats data
                stats.map((stat, index) => (
                  <div
                    className="item" // Stat item with calculated width and animation delay
                    key={stat.label}
                    style={{
                      '--stat-width': `${Math.min(((stat.value || 0) / 255) * 100, 100)}%`,
                      '--reveal-delay': `${390 + index * 55}ms`
                    }}
                  >
                    <span
                      // Stat label
                    >
                      {stat.label}
                    </span>
                    <div
                      className="bar-status" // Stat bar container
                    >
                      <div
                        className="bar" // Active bar element
                      />
                      <ul
                        className="separator" // Visual separators list
                      >
                        <li />
                        <li />
                        <li />
                        <li />
                      </ul>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export PokemonDetailModal Component
export default PokemonDetailModal;
