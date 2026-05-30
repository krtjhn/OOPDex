// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import JsonNode to parse JSON responses from the PokeAPI
import com.fasterxml.jackson.databind.JsonNode;
// Import Service annotation to register this class as a Spring service bean
import org.springframework.stereotype.Service;
// Import RestClientException for handling HTTP client errors from the PokeAPI
import org.springframework.web.client.RestClientException;
// Import RestTemplate for making synchronous HTTP calls to the external PokeAPI
import org.springframework.web.client.RestTemplate;

// Import ArrayList to build mutable lists of types, abilities, and weaknesses
import java.util.ArrayList;
// Import Comparator for sorting types and abilities by their slot number
import java.util.Comparator;
// Import HashMap to store stat name-to-value mappings from the API response
import java.util.HashMap;
// Import List to hold collections of JsonNode objects and strings
import java.util.List;
// Import Map to hold the stat key-value pairs
import java.util.Map;
// Import Collectors for collecting stream results into joined strings
import java.util.stream.Collectors;

// Annotation to register this class as a Spring service bean
@Service
// Class definition for Gen1PokemonSeeder which fetches and seeds Generation 1 Pokemon data from the PokeAPI
public class Gen1PokemonSeeder {

    // Public constant defining the total number of Generation 1 Pokemon (Bulbasaur to Mew)
    public static final int GEN1_MAX_ID = 151;
    // Private constant for the base URL of the PokeAPI used for all HTTP requests
    private static final String POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

    // Field for the PokemonRepository used to check existing records and save new ones
    private final PokemonRepository pokemonRepository;
    // Field for the RestTemplate used to make HTTP requests to the PokeAPI
    private final RestTemplate restTemplate;

    // Constructor to inject the PokemonRepository and create a RestTemplate instance
    public Gen1PokemonSeeder(PokemonRepository pokemonRepository) {
        // Assign the injected repository to the local field
        this.pokemonRepository = pokemonRepository;
        // Create a new RestTemplate instance for making HTTP calls to the PokeAPI
        this.restTemplate = new RestTemplate();
    // End of the constructor
    }

    // Method to synchronize the database with any missing Gen 1 Pokemon from the PokeAPI
    public int syncMissingGen1() {
        // Initialize a counter to track how many Pokemon were added during this sync
        int added = 0;
        // Loop through each Pokedex ID from 1 to 151 inclusive
        for (int id = 1; id <= GEN1_MAX_ID; id++) {
            // Skip this ID if the Pokemon already exists in the database
            if (pokemonRepository.existsById(id)) {
                // Move to the next ID without fetching from the API
                continue;
            // End of the existing check
            }

            // Fetch the Pokemon data from the PokeAPI for this Pokedex ID
            Pokemon pokemon = fetchPokemonFromApi(id);
            // Check if the fetch returned a valid Pokemon object
            if (pokemon != null) {
                // Save the newly fetched Pokemon to the database
                pokemonRepository.save(pokemon);
                // Increment the counter to track the number of Pokemon added
                added++;
            // End of the null check
            }
        // End of the for loop over all Gen 1 IDs
        }
        // Return the total number of Pokemon that were added in this sync run
        return added;
    // End of the syncMissingGen1 method
    }

    // Private method to fetch a single Pokemon's data from the PokeAPI by its Pokedex ID
    private Pokemon fetchPokemonFromApi(int id) {
        // Try to make the HTTP request; catch exceptions if the API call fails
        try {
            // Make an HTTP GET request to the PokeAPI for the given Pokemon ID
            JsonNode data = restTemplate.getForObject(POKEAPI_BASE_URL + "/pokemon/" + id, JsonNode.class);
            // Return null if the API returned no data for this Pokemon
            if (data == null) {
                // No data received from the API, skip this Pokemon
                return null;
            // End of the null data check
            }

            // Create a new Pokemon entity to populate with the fetched data
            Pokemon pokemon = new Pokemon();
            // Set the Pokemon's ID to the current Pokedex number
            pokemon.setId(id);
            // Set the Pokemon's name from the API response, defaulting to "unknown" if not present
            pokemon.setName(data.path("name").asText("unknown"));

            // Parse the height from the API (given in decimetres) and convert to metres
            double height = data.path("height").asDouble(0.0) / 10.0;
            // Parse the weight from the API (given in hectograms) and convert to kilograms
            double weight = data.path("weight").asDouble(0.0) / 10.0;
            // Set the height on the Pokemon entity as a BigDecimal
            pokemon.setHeight(java.math.BigDecimal.valueOf(height));
            // Set the weight on the Pokemon entity as a BigDecimal
            pokemon.setWeight(java.math.BigDecimal.valueOf(weight));

            // Collect the types array nodes from the API response into a mutable list
            List<JsonNode> types = new ArrayList<>();
            // Iterate over the "types" array in the API response and add each to the list
            data.path("types").forEach(types::add);
            // Sort the types by their slot number to ensure primary type comes first
            types.sort(Comparator.comparingInt(t -> t.path("slot").asInt(0)));
            // Map each type node to its name string and join them with a comma separator
            String joinedTypes = types.stream()
                    .map(t -> t.path("type").path("name").asText("normal"))
                    // Collect all type names into a single comma-separated string
                    .collect(Collectors.joining(", "));
                // If the resulting string is blank, default to "normal"; otherwise use the joined types
                pokemon.setTypes(joinedTypes.isBlank() ? "normal" : joinedTypes);

            // Fetch and set the Pokemon's abilities as a comma-separated string
            pokemon.setAbilities(joinedAbilities(data));
            // Fetch and set the Pokemon's type weaknesses as a comma-separated string
            pokemon.setWeaknesses(joinedWeaknesses(types));

            // Create a map to hold the Pokemon's base stats keyed by stat name
            Map<String, Integer> stats = new HashMap<>();
            // Iterate over the "stats" array in the API response to populate the stats map
            data.path("stats").forEach(stat -> {
                // Extract the stat name from the nested "stat.name" field
                String statName = stat.path("stat").path("name").asText();
                // Extract the base stat value, defaulting to 1 if missing
                int value = stat.path("base_stat").asInt(1);
                // Store the stat name and value in the map
                stats.put(statName, value);
            // End of the stat forEach lambda
            });

            // Set the HP stat, clamping it to a minimum of 1
            pokemon.setHp(clampStat(stats.get("hp")));
            // Set the Attack stat, clamping it to a minimum of 1
            pokemon.setAttack(clampStat(stats.get("attack")));
            // Set the Defense stat, clamping it to a minimum of 1
            pokemon.setDefense(clampStat(stats.get("defense")));
            // Set the Speed stat, clamping it to a minimum of 1
            pokemon.setSpeed(clampStat(stats.get("speed")));

            // Clamp and store the Special Attack stat value
            int specialAttack = clampStat(stats.get("special-attack"));
            // Clamp and store the Special Defense stat value
            int specialDefense = clampStat(stats.get("special-defense"));
            // Set the Special Attack stat on the Pokemon entity
            pokemon.setSpecialAttack(specialAttack);
            // Set the Special Defense stat on the Pokemon entity
            pokemon.setSpecialDefense(specialDefense);

            // Return the fully populated Pokemon entity ready to be saved
            return pokemon;
        // Catch any REST client exception that occurs during the API call
        } catch (RestClientException ex) {
            // Return null to signal that this Pokemon could not be fetched
            return null;
        // End of the try-catch block
        }
    // End of the fetchPokemonFromApi method
    }

    // Private method to build a comma-separated string of ability names from the API data
    private String joinedAbilities(JsonNode data) {
        // Create a mutable list to hold the ability nodes from the API response
        List<JsonNode> abilities = new ArrayList<>();
        // Iterate over the "abilities" array in the API data and add each node to the list
        data.path("abilities").forEach(abilities::add);
        // Sort the abilities by their slot number to ensure consistent ordering
        abilities.sort(Comparator.comparingInt(a -> a.path("slot").asInt(0)));
        // Map each ability node to its name, filter out blank names, and join with comma separators
        return abilities.stream()
                .map(a -> a.path("ability").path("name").asText(""))
                // Filter out any blank ability names that may have been returned by the API
                .filter(value -> !value.isBlank())
                // Join all valid ability names into a single comma-separated string
                .collect(Collectors.joining(", "));
    // End of the joinedAbilities method
    }

    // Private method to build a comma-separated string of type weaknesses by calling the PokeAPI for each type
    private String joinedWeaknesses(List<JsonNode> types) {
        // Return an empty string immediately if the types list is empty
        if (types.isEmpty()) {
            // No types means no weaknesses to calculate
            return "";
        // End of the empty types check
        }

        // Create a mutable list to accumulate all weakness names from every type
        List<String> weaknesses = new ArrayList<>();
        // Iterate over each type node in the list to look up its weaknesses
        for (JsonNode typeNode : types) {
            // Extract the type name from the nested "type.name" field
            String typeName = typeNode.path("type").path("name").asText("");
            // Skip this type if the name is blank or missing
            if (typeName.isBlank()) {
                // Move to the next type without making an API call
                continue;
            // End of the blank type name check
            }

            // Try to fetch the type's damage relations from the PokeAPI
            try {
                // Make an HTTP GET request to the PokeAPI for the given type name
                JsonNode typeData = restTemplate.getForObject(POKEAPI_BASE_URL + "/type/" + typeName, JsonNode.class);
                // Skip this type if the API returned no data
                if (typeData == null) {
                    // No data for this type, skip it and continue
                    continue;
                // End of the null type data check
                }

                // Iterate over each "double_damage_from" entry in the type's damage relations
                typeData.path("damage_relations").path("double_damage_from").forEach(weakness -> {
                    // Extract the weakness type name from the API response
                    String weaknessName = weakness.path("name").asText("");
                    // Add the weakness name to the list only if it is not blank
                    if (!weaknessName.isBlank()) {
                        // Add the valid weakness name to the running list
                        weaknesses.add(weaknessName);
                    // End of the blank weakness check
                    }
                // End of the forEach lambda for double_damage_from
                });
            // Catch any REST client exception for this type lookup so other types can still be processed
            } catch (RestClientException ex) {
                // Silently continue to the next type if this type's API call fails
            // End of the try-catch for the type API call
            }
        // End of the for loop over each type node
        }

        // Deduplicate the collected weaknesses and join them into a comma-separated string
        return weaknesses.stream().distinct().collect(Collectors.joining(", "));
    // End of the joinedWeaknesses method
    }

    // Private helper method to clamp a stat value to a minimum of 1
    private int clampStat(Integer value) {
        // Return 1 if the value is null or less than 1 to satisfy the database constraint
        if (value == null || value < 1) {
            // Return the minimum allowed stat value
            return 1;
        // End of the null/low value check
        }
        // Return the original value if it is already valid
        return value;
    // End of the clampStat method
    }

// End of the Gen1PokemonSeeder class
}
