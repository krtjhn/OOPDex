// Import React hooks for state and lifecycle management
import { useEffect, useState, useRef } from 'react';
// Import Link component for client-side routing
import { Link } from 'react-router-dom';
// Import the configured Axios client for API requests
import apiClient from '../api/axios';
// Import the outer shell layout for the Pokemon database
import PokemonDatabaseShell from '../components/pokemon/PokemonDatabaseShell';
// Import the individual Pokemon card component
import PokemonCard from '../components/pokemon/PokemonCard';
// Import the modal component for viewing Pokemon details
import PokemonDetailModal from '../components/pokemon/PokemonDetailModal';
// Import utility constants and functions for filtering the Pokemon list
import { POKEMON_TYPES, filterPokemonList } from '../utils/pokemonCatalog';
// Import utility function to resolve local image paths for sprites
import { getPokemonSpritePath } from '../utils/pokemonMedia';

// Define the LandingPage functional component
const LandingPage = () => {
  // Initialize state for the list of Pokemon
  const [pokemonList, setPokemonList] = useState([]);
  // Initialize state to track the loading status of the API request
  const [loading, setLoading] = useState(true);
  // Initialize state for the current search term
  const [searchTerm, setSearchTerm] = useState('');
  // Initialize state for the currently selected Pokemon type filter
  const [selectedType, setSelectedType] = useState('All');
  // Initialize state to track which Pokemon is currently selected for the detail modal
  const [detailPokemon, setDetailPokemon] = useState(null);
  // Create a ref to access the background audio element
  const audioRef = useRef(null);

  // Use an effect to manage external plugin scripts on mount and unmount
  useEffect(() => {
    // Select any existing script tags injected by this component previously
    const existingScripts = document.querySelectorAll('script[data-inspo]');
    // Remove the existing scripts to avoid duplicates
    existingScripts.forEach((script) => script.remove());

    // Create a new script element for the plugins
    const pluginsScript = document.createElement('script');
    // Set the source URL of the script
    pluginsScript.src = '/js/plugins.js';
    // Ensure the script loads synchronously relative to DOM parsing
    pluginsScript.async = false;
    // Add a custom data attribute to identify this specific script
    pluginsScript.dataset.inspo = 'plugins';

    // Append the new script to the document body to execute it
    document.body.appendChild(pluginsScript);

    // Return a cleanup function for when the component unmounts
    return () => {
      // Remove the open-modal class from the root HTML element just in case it was left active
      document.documentElement.classList.remove('open-modal');
      // Remove the injected script element from the DOM
      pluginsScript.remove();
    // Close cleanup function
    };
  // Run this effect only once on initial component mount
  }, []);

  // Use an effect to fetch the Pokemon data from the API
  useEffect(() => {
    // Define an asynchronous function to perform the fetch
    const fetchPokemon = async () => {
      // Use a try block to handle potential network or server errors
      try {
        // Send a GET request to the /pokemon endpoint, suppressing global toast errors for the landing page
        const response = await apiClient.get('/pokemon', { meta: { suppressGlobalErrorToast: true } });
        // Update the pokemon list state, ensuring the payload is an array
        setPokemonList(Array.isArray(response.data) ? response.data : []);
      // Use a catch block for error handling
      } catch {
        // If the request fails, default the list to an empty array
        setPokemonList([]);
      // Use a finally block to ensure loading state is updated regardless of success or failure
      } finally {
        // Set loading to false once the request completes
        setLoading(false);
      // Close finally block
      }
    // Close fetchPokemon function
    };

    // Call the fetch function to initiate the request
    fetchPokemon();
  // Run this effect only once on initial component mount
  }, []);

  // Use an effect to handle background music playback
  useEffect(() => {
    // Check if the audio element reference exists
    if (audioRef.current) {
      // Set the volume of the audio element to 50%
      audioRef.current.volume = 0.5;

      // Attempt to play the audio immediately and catch any autoplay rejections
      const playAttempt = audioRef.current.play().catch(() => {
        // Define a handler function to play audio upon user interaction if autoplay was blocked
        const playOnInteraction = () => {
          // Check again if the audio element reference still exists
          if (audioRef.current) {
            // Play the audio and catch any subsequent errors silently
            audioRef.current.play().catch(() => {});
          // Close if block
          }
          // Remove the click event listener after the first interaction
          document.removeEventListener('click', playOnInteraction);
          // Remove the scroll event listener after the first interaction
          document.removeEventListener('scroll', playOnInteraction);
        // Close playOnInteraction function
        };

        // Add a one-time click listener to the document to trigger audio playback
        document.addEventListener('click', playOnInteraction, { once: true });
        // Add a one-time scroll listener to the document to trigger audio playback
        document.addEventListener('scroll', playOnInteraction, { once: true });
      // Close catch block for playAttempt
      });
    // Close if block
    }
  // Run this effect only once on initial component mount
  }, []);

  // Filter the base Pokemon list using the search term and selected type
  const filteredPokemon = filterPokemonList(pokemonList, searchTerm, selectedType)
    // Create a shallow copy of the filtered array before sorting it
    .slice()
    // Sort the array in ascending order by Pokemon ID
    .sort((left, right) => (left.id || 0) - (right.id || 0));

  // Return the JSX structure for the LandingPage
  return (
    <div
      // Wrap the entire page content in a root div
    >
      <audio
        // Render the hidden audio element for background music
        // Attach the audio ref to control playback
        ref={audioRef}
        // Set the source path for the audio file
        src="/assets/pokemon-audio/landingpage.mp3"
        // Enable looping for continuous playback
        loop
        // Attempt to automatically play the audio
        autoPlay
        // Hide the audio element from the UI
        style={{ display: 'none' }}
      // Close audio tag
      />
      { // Render the header section
      }
      <header>
        <div
          // Render a container div for header layout
          // Apply standard container class
          className="container"
          // Apply inline styles for flexbox layout and spacing
          style={{
            // Use flexbox layout
            display: 'flex',
            // Space items to the extremes of the container
            justifyContent: 'space-between',
            // Center items vertically
            alignItems: 'center',
            // Take up full width
            width: '100%',
            // Add right padding
            paddingRight: '2rem'
          // Close inline styles object
          }}
        >
          { // Render the logo link to the root path
          }
          <a href="/" className="logo">
            { // Render the logo image
            }
            <img src="/assets/images/logo.svg" alt="Logo pokemon" title="logo pokemon" />
          { // Close logo link
          }
          </a>

          { // Render a flex container for header actions like the login button
          }
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            { // Render a React Router Link to the authentication page
            }
            <Link
              // Set the destination route to /auth
              to="/auth"
              // Apply inline styles for the button appearance
              style={{
                // Set padding
                padding: '10px 28px',
                // Set red background color
                backgroundColor: '#e3350d',
                // Set white text color
                color: 'white',
                // fully round the corners
                borderRadius: '9999px',
                // Make text semi-bold
                fontWeight: '600',
                // Set font size
                fontSize: '1rem',
                // Remove default underline
                textDecoration: 'none',
                // Add a subtle drop shadow
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                // Add transition for hover effects
                transition: 'transform 0.2s, box-shadow 0.2s'
              // Close inline styles object
              }}
              // Apply hover effects using onMouseOver
              onMouseOver={(e) => {
                // Scale up the button slightly
                e.currentTarget.style.transform = 'scale(1.05)';
                // Increase the shadow intensity and color
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(227, 53, 13, 0.3)';
              // Close onMouseOver handler
              }}
              // Revert hover effects using onMouseOut
              onMouseOut={(e) => {
                // Reset scale to normal
                e.currentTarget.style.transform = 'scale(1)';
                // Reset shadow to normal
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              // Close onMouseOut handler
              }}
            >
              Login
            </Link>
          </div>
        </div>
      { // Close header section
      }
      </header>

      { // Render the hero slide section wrapper
      }
      <section className="s-area-slide-hero">
        { // Render the main hero slider container
        }
        <div className="slide-hero">
          { // Render the swiper wrapper for multiple slides
          }
          <div className="swiper-wrapper">
            { // Render the first slide (Red Pokeball)
            }
            <div className="swiper-slide">
              { // Render the main area container for the slide content
              }
              <div className="main-area">
                { // Render the standard container
                }
                <div className="container">
                  { // Render the text content block
                  }
                  <div className="text">
                    { // Render the group tag
                    }
                    <div className="tag">
                      { // Render the tag icon container
                      }
                      <div className="icon">
                        { // Render the red bag icon
                        }
                        <img src="/assets/images/bag-red.svg" alt="" />
                      { // Close tag icon container
                      }
                      </div>
                      { // Render the tag text
                      }
                      <span>Group 3</span>
                    { // Close tag container
                    }
                    </div>
                    { // Render the main heading
                    }
                    <h1>Who is that Pokemon?</h1>
                    { // Render the sub-heading description
                    }
                    <p>The perfect guide for those who want to hunt Pokemons around the world</p>
                    { // Render the hero image container
                    }
                    <div className="image">
                      { // Render the background lighting effect image
                      }
                      <img src="/assets/images/lighting.svg" alt="lights" title="lights" className="lights" />
                      { // Render the main red pokeball image
                      }
                      <img
                        src="/assets/images/pokeball-red.png"
                        alt="pokeball"
                        title="pokeball"
                        className="pokeball"
                      // Close image tag
                      />
                    { // Close hero image container
                    }
                    </div>
                  { // Close text content block
                  }
                  </div>
                  { // Render the explore indicator area
                  }
                  <div className="area-explore">
                    { // Render the text and icon for explore
                    }
                    <div className="txt">
                      { // Render the explore icon container
                      }
                      <div className="icon">
                        { // Render the down arrow icon
                        }
                        <img src="/assets/images/arrow-down-white.svg" alt="" />
                      { // Close explore icon container
                      }
                      </div>
                      { // Render the explore text label
                      }
                      <span>explore</span>
                    { // Close text and icon for explore
                    }
                    </div>
                    { // Render the swiper pagination dots container
                    }
                    <div className="swiper-pagination" />
                  { // Close explore indicator area
                  }
                  </div>
                { // Close standard container
                }
                </div>
              { // Close main area container
              }
              </div>
            { // Close first slide
            }
            </div>

            { // Render the second slide (Blue Pokeball)
            }
            <div className="swiper-slide">
              { // Render the main area container for the slide content
              }
              <div className="main-area">
                { // Render the standard container
                }
                <div className="container">
                  { // Render the text content block
                  }
                  <div className="text">
                    { // Render the pokedex tag
                    }
                    <div className="tag">
                      { // Render the tag icon container
                      }
                      <div className="icon">
                        { // Render the red bag icon
                        }
                        <img src="/assets/images/bag-red.svg" alt="" />
                      { // Close tag icon container
                      }
                      </div>
                      { // Render the tag text
                      }
                      <span>pokedex</span>
                    { // Close tag container
                    }
                    </div>
                    { // Render the main heading
                    }
                    <h1>Catch them all!</h1>
                    { // Render the sub-heading description
                    }
                    <p>The perfect guide for those who want to hunt Pokemons around the world</p>
                    { // Render the hero image container
                    }
                    <div className="image">
                      { // Render the background lighting effect image
                      }
                      <img src="/assets/images/lighting.svg" alt="lights" title="lights" className="lights" />
                      { // Render the main blue pokeball image
                      }
                      <img
                        src="/assets/images/pokeball-blue.png"
                        alt="pokeball"
                        title="pokeball"
                        className="pokeball"
                      // Close image tag
                      />
                    { // Close hero image container
                    }
                    </div>
                  { // Close text content block
                  }
                  </div>
                  { // Render the explore indicator area
                  }
                  <div className="area-explore">
                    { // Render the text and icon for explore
                    }
                    <div className="txt">
                      { // Render the explore icon container
                      }
                      <div className="icon">
                        { // Render the down arrow icon
                        }
                        <img src="/assets/images/arrow-down-white.svg" alt="" />
                      { // Close explore icon container
                      }
                      </div>
                      { // Render the explore text label
                      }
                      <span>explore</span>
                    { // Close text and icon for explore
                    }
                    </div>
                    { // Render the swiper pagination dots container
                    }
                    <div className="swiper-pagination" />
                  { // Close explore indicator area
                  }
                  </div>
                { // Close standard container
                }
                </div>
              { // Close main area container
              }
              </div>
            { // Close second slide
            }
            </div>
          { // Close swiper wrapper
          }
          </div>
        { // Close main hero slider container
        }
        </div>
      { // Close hero slide section
      }
      </section>

      { // Render the Pokemon database shell component for searching and filtering
      }
      <PokemonDatabaseShell
        // Pass the title prop
        title="Select your Pokemon"
        // Pass the total count of filtered Pokemon
        count={filteredPokemon.length}
        // Pass the current search term state
        searchTerm={searchTerm}
        // Pass the state setter function for the search term
        onSearchTermChange={setSearchTerm}
        // Pass the currently selected type filter state
        selectedType={selectedType}
        // Pass the state setter function for the selected type
        onSelectedTypeChange={setSelectedType}
        // Pass the array of available Pokemon types
        types={POKEMON_TYPES}
        // Pass the loading state to display a loader if necessary
        loading={loading}
      >
        { // Map over the filtered array of Pokemon to render individual cards
        }
        {filteredPokemon.map((pokemon) => (
          <PokemonCard
            // Provide a unique key using the Pokemon ID
            key={pokemon.id}
            // Pass the individual pokemon data object
            pokemon={pokemon}
            // Pass the resolved local image path for the Pokemon sprite
            imageSrc={getPokemonSpritePath(pokemon.id)}
            // Pass an onClick handler to open the detail modal with this Pokemon's data
            onClick={() => setDetailPokemon(pokemon)}
          // Close PokemonCard component
          />
        ))}
      </PokemonDatabaseShell>

      { // Conditionally render the detail modal if a Pokemon is selected
      }
      {detailPokemon && (
        <PokemonDetailModal 
          // Pass the selected pokemon data object to the modal
          pokemon={detailPokemon} 
          // Pass a function to clear the selected Pokemon when the modal is closed
          onClose={() => setDetailPokemon(null)} 
        // Close PokemonDetailModal component
        />
      )}
    </div>
  );
};

// Export the LandingPage component as the default export
export default LandingPage;
