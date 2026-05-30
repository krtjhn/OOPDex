// Import React library
import React from 'react';

// PokemonFilters Component
const PokemonFilters = ({
  title,
  count,
  searchTerm,
  onSearchTermChange,
  searchPlaceholder = 'Search name or code',
  selectedType,
  onSelectedTypeChange,
  types = [],
  countLabel = 'Pokémons',
  className = '',
  typeListClassName = '',
}) => {
  // Handle title node which can be string or react element
  const titleNode = typeof title === 'string'
    ? <h2>{title}</h2>
    : title;

  return (
    // Main container with classes
    <div className={`pokemon-filters ${className}`.trim()}>
      <div
        className="top pokemon-filters__top" // Top bar containing title and search
      >
        {
          // Render title node or empty span
          titleNode || <span />
        }
        <div
          className="search pokemon-filters__search" // Search input container
          style={{ position: 'relative' }}
        >
          <input
            type="text" // Text input for search term
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
          <button
            type="button" // Search submit button (decorative)
            aria-label="Search"
          >
            <img
              src="/assets/images/icon-search.svg" // Search icon
              alt="search"
            />
          </button>
        </div>
      </div>

      <ul
        className={`hide-scroll pokemon-filters__types ${typeListClassName}`.trim()} // Horizontal scrollable types list
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'flex-start',
          gap: '1.5rem',
          marginBottom: '4rem',
          padding: '0 2rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {
          // Iterate over types array
          types.map((type) => {
            // Normalize type key to lowercase
            const typeKey = type.toLowerCase();
            // Check if this is the "All" type
            const isAll = typeKey === 'all';
            // Check if this type is currently selected
            const isActive = selectedType === type;

            return (
              <li
                key={type} // List item for type
              >
                <button
                  type="button" // Type filter button
                  className={`type-filter ${isAll ? 'all' : typeKey} ${isActive ? 'active' : ''}`.trim()}
                  onClick={() => onSelectedTypeChange(type)}
                >
                  <span
                    className="icon" // Icon wrapper
                  >
                    <img
                      src={isAll ? '/assets/images/icon-all.svg' : `/assets/images/${typeKey}_1.svg`} // Type icon image
                      alt={type}
                      onError={(event) => {
                        // Hide image on load error
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </span>
                  <span
                    // Type name text
                  >
                    {type}
                  </span>
                </button>
              </li>
            );
          })
        }
      </ul>

      <div
        className="right-container pokemon-filters__results" // Results summary container
        style={{ paddingLeft: '2rem', width: '100%', marginBottom: '0.5in' }}
      >
        <div
          className="top-container" // Top container for count block
        >
          <div
            className="pokemon-count-block" // Flex container for count elements
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <img
              src="/assets/images/icon-pokeball.svg" // Pokeball icon for count block
              alt=""
              style={{ width: '1.6rem', height: '1.6rem', objectFit: 'contain' }}
            />
            <span
              style={{ display: 'inline-block' }} // Count text wrapper
            >
              <strong
                // Actual number
              >
                {count}
              </strong>
              {' '}{countLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export PokemonFilters Component
export default PokemonFilters;
