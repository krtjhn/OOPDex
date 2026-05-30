// Import necessary React hooks: useCallback for memoizing functions, useEffect for side effects, useMemo for memoizing values, useState for local state management
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Import the configured axios client for making API requests
import apiClient from '../../api/axios';
// Import the custom useToast hook for displaying notifications
import { useToast } from '../../components/Toast';
// Import the PokemonCard component to render individual Pokemon
import PokemonCard from '../../components/pokemon/PokemonCard';
// Import the PokemonDetailModal component for showing detailed information
import PokemonDetailModal from '../../components/pokemon/PokemonDetailModal';
// Import the PokemonDatabaseShell component which serves as the layout wrapper for the catalog
import PokemonDatabaseShell from '../../components/pokemon/PokemonDatabaseShell';
// Import the CatchTarget component to display the drop zone for the catching mechanic
import CatchTarget from '../../components/pokemon/CatchTarget';
// Import the custom hook handling the drag-and-drop catching interaction
import usePokemonDragCatch from '../../hooks/usePokemonDragCatch';
// Import predefined Pokemon types array and a utility function to filter the list
import { POKEMON_TYPES, filterPokemonList } from '../../utils/pokemonCatalog';
// Import utility function to resolve the correct sprite image path based on Pokemon ID
import { getPokemonSpritePath } from '../../utils/pokemonMedia';
// Import utility function for playing sound effects
import { playPogoSound } from '../../utils/pogoAudio';
// Import the stylesheet specific to the catch mechanics animations
import '../../styles/catch-mechanic.css';
// Store the path to the Pokedex logo image
const PokedexLogo = '/assets/images/Pokedex.png';

// Define the PokemonCatalog functional component
const PokemonCatalog = () => {
  // Initialize state to hold the full list of Pokemon fetched from the API
  const [pokemonList, setPokemonList] = useState([]);
  // Initialize state to track whether data is currently being fetched
  const [loading, setLoading] = useState(true);
  // Initialize state to track the currently selected Pokemon type filter, defaulting to 'All'
  const [selectedType, setSelectedType] = useState('All');
  // Initialize state to track the user's search input text
  const [searchTerm, setSearchTerm] = useState('');
  // Initialize state to hold the specific Pokemon object currently being viewed in detail
  const [detailPokemon, setDetailPokemon] = useState(null);
  // Initialize state to track the ID of the Pokemon currently in the process of being caught
  const [catchingPokemonId, setCatchingPokemonId] = useState(null);
  // Initialize state to store an array of IDs of Pokemon the user has already caught
  const [collectionPokemonIds, setCollectionPokemonIds] = useState([]);
  // Initialize state to manage the visual success effect after catching a Pokemon
  const [catchEffect, setCatchEffect] = useState(null);
  // Extract the showToast function from the useToast hook
  const { showToast } = useToast();

  // Use an effect hook to fetch the initial data when the component mounts
  useEffect(() => {
    // Define an asynchronous function to perform the data fetching
    const fetchPokemon = async () => {
      // Use a try block to handle potential network or server errors
      try {
        // Run both API requests (catalog and user's collection) concurrently using Promise.all
        const [pokemonResponse, collectionResponse] = await Promise.all([
          // Fetch the complete list of Pokemon, suppressing global error toasts to handle them locally
          apiClient.get('/pokemon', { meta: { suppressGlobalErrorToast: true } }),
          // Fetch the user's current collection of caught Pokemon
          apiClient.get('/pokemon/my-collection', { meta: { suppressGlobalErrorToast: true } })
        ]);

        // Safely extract the pokemon list from the response, defaulting to an empty array if invalid
        setPokemonList(Array.isArray(pokemonResponse.data) ? pokemonResponse.data : []);
        // Process the collection response to extract an array of just the Pokemon IDs
        const initialCaughtIds = Array.isArray(collectionResponse.data)
          // Map over the collection entries to pull out the pokemonId property
          ? collectionResponse.data.map((entry) => entry?.pokemonId).filter((value) => value !== undefined && value !== null)
          // Fallback to an empty array if the response data is not an array
          : [];
        // Update the state with the extracted array of caught Pokemon IDs
        setCollectionPokemonIds(initialCaughtIds);
      // Catch block to handle errors during the fetch process
      } catch {
        // Show an error toast notification to the user
        showToast('Failed to load Pokemon catalog', 'error');
        // Reset the pokemon list to an empty array on failure
        setPokemonList([]);
        // Reset the collection IDs to an empty array on failure
        setCollectionPokemonIds([]);
      } finally {
        // Set the loading state to false to remove any loading indicators in the UI
        setLoading(false);
      }
    };

    // Call the fetch function to initiate the requests
    fetchPokemon();
  // Declare dependencies for this effect
  }, [showToast]);

  // Use an effect to automatically clear the visual catch effect after a short delay
  useEffect(() => {
    // Exit early if there is no active catch effect
    if (!catchEffect) return undefined;

    // Set a timeout to clear the catch effect state after 1700 milliseconds
    const timer = setTimeout(() => setCatchEffect(null), 1700);
    // Return a cleanup function to clear the timeout if the component unmounts or effect re-runs
    return () => clearTimeout(timer);
  // Re-run this effect whenever the catchEffect state changes
  }, [catchEffect]);

  // Define the function to handle the action of catching a Pokemon, memoized with useCallback
  const handleCatchPokemon = useCallback(
    // Async function receiving the ID of the Pokemon to catch
    async (pokemonId) => {
      // Prevent concurrent catch attempts by checking if one is already in progress
      if (catchingPokemonId !== null) return false;

      // Use a try block to handle API requests and potential errors
      try {
        // Set the state to indicate which Pokemon is currently being caught
        setCatchingPokemonId(pokemonId);
        // Play the sound effect for a Pokeball opening
        playPogoSound('pokeball-take-in.wav', 0.6);
        // Make a POST request to the catch endpoint with the target Pokemon ID
        const response = await apiClient.post(
          // API Endpoint path
          '/pokemon/catch',
          // Request body payload
          { pokemonId },
          // Request configuration, suppressing global toasts
          { meta: { suppressGlobalErrorToast: true } }
        );
        // Update the local state array of caught Pokemon IDs to reflect the new catch
        setCollectionPokemonIds((previous) => {
          // If the ID is already present, return the array unchanged
          if (previous.includes(pokemonId)) return previous;
          // Otherwise, return a new array containing the existing IDs plus the new one
          return [...previous, pokemonId];
        });
        // Safely extract the name of the caught Pokemon from the response for the UI notification
        const caughtName = response.data.pokemon?.name || 'Pokemon';
        // Play the success sound effect
        playPogoSound('pokeball-gotcha.wav', 0.78);
        // Set the state to trigger the visual success animation
        setCatchEffect({ id: pokemonId, name: caughtName, key: Date.now() });
        // Show a success toast notification to the user
        showToast(`Caught ${caughtName}! Added to collection.`, 'success');
        // Return true indicating the catch was successful
        return true;
      // Catch block to handle specific API errors during the catch process
      } catch (err) {
        // Check if the error indicates a lack of authorization (e.g., user is not admin)
        if (err.response?.status === 403) {
          // Show a specific error toast for unauthorized attempts
          showToast('Permission denied. Admin access required.', 'error');
        // Check if the error indicates the Pokemon is already caught
        } else if (err.response?.status === 409) {
          // Show an info toast notifying the user it's already in their collection
          showToast('This Pokemon is already in your collection.', 'info');
        // Handle all other general errors
        } else {
          // Show a generic failure toast
          showToast('Failed to catch Pokemon. Try again.', 'error');
        }
        // Return false indicating the catch failed
        return false;
      // Finally block to ensure catching state is reset
      } finally {
        // Clear the catching ID state
        setCatchingPokemonId(null);
      }
    },
    // Declare dependencies for useCallback
    [catchingPokemonId, showToast]
  );

  // Derive the filtered list of Pokemon based on the current search term and selected type
  const filteredPokemon = filterPokemonList(pokemonList, searchTerm, selectedType)
    // Create a shallow copy of the filtered array to avoid mutating state directly during sort
    .slice()
    // Sort the array sequentially by Pokemon ID
    .sort((left, right) => (left.id || 0) - (right.id || 0));

  // Define the function to open the details modal for a specific Pokemon, memoized with useCallback
  const openPokemonDetails = useCallback((pokemon) => {
    // Set the selected Pokemon into state, which triggers the modal render
    setDetailPokemon(pokemon);
  // Empty dependency array as it relies on no external variables
  }, []);

  // Memoize the array of caught IDs to ensure reference stability for the drag hook
  const stableCaughtIds = useMemo(() => collectionPokemonIds, [collectionPokemonIds]);

  // Initialize the custom drag-and-drop catching hook with callbacks and state
  const dragCatch = usePokemonDragCatch({
    // Pass the handleCatchPokemon function to be called on successful drop
    onCatch: handleCatchPokemon,
    // Pass a function to play a sound effect when dragging begins
    onDragStart: () => playPogoSound('pokeball-throw.wav', 0.42),
    // Pass the stable reference of already caught IDs
    initialCaughtPokemonIds: stableCaughtIds
  });

  // Calculate the horizontal delta for the vacuum animation effect if active
  const vacuumDeltaX = dragCatch.vacuumEffect
    // Calculate difference between start and end X coordinates
    ? dragCatch.vacuumEffect.endX - dragCatch.vacuumEffect.startX
    // Default to 0 if effect is not active
    : 0;
  // Calculate the vertical delta for the vacuum animation effect if active
  const vacuumDeltaY = dragCatch.vacuumEffect
    // Calculate difference between start and end Y coordinates
    ? dragCatch.vacuumEffect.endY - dragCatch.vacuumEffect.startY
    // Default to 0 if effect is not active
    : 0;

  // Return the JSX structure for the PokemonCatalog component
  return (
    <div
      // Main container with standard font applied
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <div
        // Wrapper div establishing stacking context and positioning
        style={{ position: 'relative', paddingTop: 0, marginTop: 0, zIndex: 1 }}
      >
        <div
          // Container limiting maximum width and resetting padding
          style={{ maxWidth: '100%', padding: 0 }}
        >
          <PokemonDatabaseShell
            // Main layout shell component providing the header, search, and grid layout
            title={<img src={PokedexLogo} alt="Pokedex Catalog" className="pokemon-database-shell__title-image" draggable={false} />}
            count={filteredPokemon.length}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedType={selectedType}
            onSelectedTypeChange={setSelectedType}
            types={POKEMON_TYPES}
            loading={loading}
            loadingMessage="Loading Pokedex catalog..."
            emptyMessage="No Pokemon found in catalog."
          >
            {
              // Iterate over the filtered array of Pokemon to render individual cards
              filteredPokemon.map((pokemon) => (
                <PokemonCard
                  // Render a PokemonCard component for each item
                  key={pokemon.id}
                  pokemon={pokemon}
                  imageSrc={getPokemonSpritePath(pokemon.id)}
                  className={dragCatch.getCardClassName(pokemon.id)}
                  style={dragCatch.getCardStyle(pokemon.id)}
                  articleRef={(node) => dragCatch.registerCardRef(pokemon.id, node)}
                  onClick={(event) => dragCatch.handleCardClick(pokemon, event, openPokemonDetails)}
                  onPointerDown={(event) => dragCatch.handleCardPointerDown(pokemon.id, event)}
                  onPointerMove={(event) => dragCatch.handleCardPointerMove(pokemon.id, event)}
                  onPointerUp={(event) => dragCatch.handleCardPointerUp(pokemon.id, event)}
                  onPointerCancel={(event) => dragCatch.handleCardPointerCancel(pokemon.id, event)}
                  onMouseEnter={() => dragCatch.handleCardMouseEnter(pokemon.id)}
                  onMouseLeave={() => dragCatch.handleCardMouseLeave(pokemon.id)}
                />
              ))
            }
          </PokemonDatabaseShell>
        </div>
      </div>

      <CatchTarget
        // Render the CatchTarget component representing the drop zone UI
        ref={dragCatch.targetRef}
        visible={dragCatch.isTargetVisible}
        proximity={dragCatch.proximity}
        isActive={dragCatch.isTargetActive}
        isBusy={dragCatch.isCatching || catchingPokemonId !== null}
      />

      {
        // Conditionally render the visual drag trail effect following the dragged card
        dragCatch.dragTrail && (
          <div
            // Container for the visual trail
            className={`catch-throw-trail ${dragCatch.isTargetActive ? 'is-hot' : ''}`}
            style={{
              left: `${dragCatch.dragTrail.x}px`,
              top: `${dragCatch.dragTrail.y}px`,
              '--trail-x': `${dragCatch.dragTrail.startX - dragCatch.dragTrail.x}px`,
              '--trail-y': `${dragCatch.dragTrail.startY - dragCatch.dragTrail.y}px`,
              '--trail-power': dragCatch.proximity.toFixed(2),
              '--trail-angle': `${Math.atan2(
                dragCatch.dragTrail.startY - dragCatch.dragTrail.y,
                dragCatch.dragTrail.startX - dragCatch.dragTrail.x
              )}rad`,
              '--trail-length': `${Math.min(
                128,
                Math.max(
                  56,
                  Math.hypot(
                    dragCatch.dragTrail.startX - dragCatch.dragTrail.x,
                    dragCatch.dragTrail.startY - dragCatch.dragTrail.y
                  ) * 0.36 + dragCatch.proximity * 44
                )
              )}px`
            }}
          >
            <span
              // Inner span used for the actual visual trail rendering via CSS
            />
          </div>
        )
      }

      {
        // Conditionally render the vacuum suction animation when a catch is confirmed
        dragCatch.vacuumEffect && (
          <div
            // Container for the vacuum effect animation sequence
            key={dragCatch.vacuumEffect.key}
            className="catch-vacuum-effect"
            style={{
              '--vacuum-start-x': `${dragCatch.vacuumEffect.startX}px`,
              '--vacuum-start-y': `${dragCatch.vacuumEffect.startY}px`,
              '--vacuum-end-x': `${dragCatch.vacuumEffect.endX}px`,
              '--vacuum-end-y': `${dragCatch.vacuumEffect.endY}px`,
              '--vacuum-dx-34': `${vacuumDeltaX * 0.34}px`,
              '--vacuum-dy-34': `${vacuumDeltaY * 0.34}px`,
              '--vacuum-dx-86': `${vacuumDeltaX * 0.86}px`,
              '--vacuum-dy-86': `${vacuumDeltaY * 0.86}px`,
              '--vacuum-dx-92': `${vacuumDeltaX * 0.92}px`,
              '--vacuum-dy-92': `${vacuumDeltaY * 0.92}px`,
              '--vacuum-dx-96': `${vacuumDeltaX * 0.96}px`,
              '--vacuum-dy-96': `${vacuumDeltaY * 0.96}px`,
              '--vacuum-dx': `${vacuumDeltaX}px`,
              '--vacuum-dy': `${vacuumDeltaY}px`,
              '--vacuum-card-width': `${Math.min(220, Math.max(124, dragCatch.vacuumEffect.width))}px`,
              '--vacuum-card-height': `${Math.min(260, Math.max(150, dragCatch.vacuumEffect.height))}px`,
              '--vacuum-angle': `${Math.atan2(
                dragCatch.vacuumEffect.endY - dragCatch.vacuumEffect.startY,
                dragCatch.vacuumEffect.endX - dragCatch.vacuumEffect.startX
              )}rad`,
              '--vacuum-distance': `${Math.hypot(
                dragCatch.vacuumEffect.endX - dragCatch.vacuumEffect.startX,
                dragCatch.vacuumEffect.endY - dragCatch.vacuumEffect.startY
              )}px`
            }}
            aria-hidden="true"
          >
            <div
              // Render the beam graphic connecting start and end points
              className="catch-vacuum-effect__beam"
            />
            <div
              // Container representing the card being sucked in
              className="catch-vacuum-effect__card"
            >
              <span
                // Render a glowing ring around the card
                className="catch-vacuum-effect__ring"
              />
              <img
                // Render the sprite image of the specific Pokemon being caught
                src={getPokemonSpritePath(dragCatch.vacuumEffect.pokemonId)}
                alt=""
                draggable={false}
              />
            </div>
            <span
              // Render decorative spark one
              className="catch-vacuum-effect__spark catch-vacuum-effect__spark--one"
            />
            <span
              // Render decorative spark two
              className="catch-vacuum-effect__spark catch-vacuum-effect__spark--two"
            />
            <span
              // Render decorative spark three
              className="catch-vacuum-effect__spark catch-vacuum-effect__spark--three"
            />
          </div>
        )
      }

      {
        // Conditionally render the final success effect shown at the target location
        catchEffect && (
          <div
            // Container for success animations, ensuring screen reader politeness
            key={catchEffect.key}
            className="catch-success-effect"
            aria-live="polite"
          >
            <div
              // Render central bright flash beam
              className="catch-success-effect__beam"
            />
            <div
              // Render expanding circular shockwave ring
              className="catch-success-effect__ring"
            />
            <div
              // Render expanding sparkles
              className="catch-success-effect__sparkles"
            />
            <img
              // Render the Pokemon sprite
              src={getPokemonSpritePath(catchEffect.id)}
              alt=""
              className="catch-success-effect__pokemon"
              draggable={false}
            />
            <div
              // Render text notification label
              className="catch-success-effect__label"
            >
              <span
                // Render primary 'Gotcha!' text
              >
                Gotcha!
              </span>
              <strong
                // Render specific descriptive text with Pokemon name
              >
                {catchEffect.name} was caught
              </strong>
            </div>
          </div>
        )
      }

      {
        // Conditionally render the detail modal if a specific Pokemon is selected for viewing
        detailPokemon && <PokemonDetailModal pokemon={detailPokemon} onClose={() => setDetailPokemon(null)} />}
    </div>
  );
};

// Export the component as default
export default PokemonCatalog;
