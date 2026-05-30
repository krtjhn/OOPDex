// Import React library
import React from 'react';
// Import PokemonFilters component
import PokemonFilters from './PokemonFilters';

// Database shell component definition
const PokemonDatabaseShell = ({
  title,
  count,
  searchTerm,
  onSearchTermChange,
  selectedType,
  onSelectedTypeChange,
  types,
  loading,
  loadingMessage = 'Loading Pokédex...',
  emptyMessage = 'No Pokémon found matching your search.',
  countLabel = 'Pokémons',
  className = '',
  filtersClassName = '',
  gridClassName = 'pokemon-database-grid',
  children,
}) => {
  return (
    // Main section wrapper
    <section className={`s-all-info-pokemons pokemon-database-shell ${className}`.trim()}>
      <div
        className="container" // Container limit wrapper
      >
        <PokemonFilters
          // Render Filters component
          title={title}
          count={count}
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          searchPlaceholder="Search name or code"
          selectedType={selectedType}
          onSelectedTypeChange={onSelectedTypeChange}
          types={types}
          countLabel={countLabel}
          className={filtersClassName}
        />

        <div
          className="area-all" // Content area wrapper
          style={{ display: 'block' }}
        >
          <div
            className="right-container pokemon-database-shell__content" // Main content right panel
            style={{ paddingLeft: 0, paddingBottom: '4rem', width: '100%' }}
          >
            <div
              className={gridClassName} // Main grid layout
            >
              {
                // Check if loading state is true
                loading ? (
                  <div
                    className="col-span-full py-16 text-center text-slate-500" // Loading state rendering
                  >
                    {
                      // Loading text message
                      loadingMessage
                    }
                  </div>
                ) : count > 0 ? (
                  // Render children if results exist
                  children
                ) : (
                  <div
                    className="col-span-full py-16 text-center text-slate-500" // Empty state rendering
                  >
                    {
                      // Empty text message
                      emptyMessage
                    }
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Export the component
export default PokemonDatabaseShell;