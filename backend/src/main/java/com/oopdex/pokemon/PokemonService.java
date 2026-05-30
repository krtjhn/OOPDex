// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import CustomExceptions to throw ResourceNotFoundException when Pokemon are not found
import com.oopdex.exception.CustomExceptions;
// Import Sort to define the sorting order of query results
import org.springframework.data.domain.Sort;
// Import Service annotation to register this class as a Spring service bean
import org.springframework.stereotype.Service;

// Import List to return collections of Pokemon objects
import java.util.List;

// Annotation to register this class as a Spring service component
@Service
// Class definition for PokemonService which contains all business logic related to Pokemon
public class PokemonService {

    // Field for the PokemonRepository used to perform database operations on Pokemon records
    private final PokemonRepository pokemonRepository;

    // Constructor to inject the PokemonRepository dependency
    public PokemonService(PokemonRepository pokemonRepository) {
        // Assign the injected repository to the local field
        this.pokemonRepository = pokemonRepository;
    // End of the constructor
    }

    // Method to retrieve all non-deleted Pokemon sorted by ID in ascending order
    public List<Pokemon> getAllPokemon() {
        // Query the repository for all Pokemon where isDeleted is false, sorted by id ascending
        return pokemonRepository.findByIsDeletedFalse(Sort.by(Sort.Direction.ASC, "id"));
    // End of the getAllPokemon method
    }

    // Method to retrieve a single Pokemon by its Pokedex ID
    public Pokemon getPokemonById(Integer id) {
        // Query the repository for a Pokemon with the given ID; throw an exception if not found
        return pokemonRepository.findById(id)
                // Throw a ResourceNotFoundException if no Pokemon exists with this ID
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Pokemon not found"));
    // End of the getPokemonById method
    }

    // Method to search for non-deleted Pokemon whose name contains the given string
    public List<Pokemon> searchPokemon(String name) {
        // Validate and normalize the search name; throw an exception if blank or null
        String normalizedName = requireSearchValue(name, "Search name is required.");
        // Query the repository for non-deleted Pokemon whose name contains the normalized string (case-insensitive)
        return pokemonRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(normalizedName);
    // End of the searchPokemon method
    }

    // Method to filter non-deleted Pokemon by their type
    public List<Pokemon> filterPokemon(String type) {
        // Validate and normalize the type filter; throw an exception if blank or null
        String normalizedType = requireSearchValue(type, "Filter type is required.");
        // Query the repository for non-deleted Pokemon whose types contain the normalized type string (case-insensitive)
        return pokemonRepository.findByTypesContainingIgnoreCaseAndIsDeletedFalse(normalizedType);
    // End of the filterPokemon method
    }

    // Method to count the total number of non-deleted Pokemon
    public long countPokemon() {
        // Retrieve all non-deleted Pokemon with no particular sort order and return the count
        return pokemonRepository.findByIsDeletedFalse(Sort.unsorted()).size();
    // End of the countPokemon method
    }

    // Method to update an existing Pokemon's details by its ID
    public Pokemon updatePokemon(Integer id, Pokemon pokemon) {
        // Retrieve the existing Pokemon from the database; throws an exception if not found
        Pokemon existingPokemon = getPokemonById(id);
        // Normalize the incoming Pokemon data (trim strings, handle blanks)
        normalizePokemon(pokemon);

        // Update the existing Pokemon's name with the normalized value from the request
        existingPokemon.setName(pokemon.getName());
        // Update the existing Pokemon's height
        existingPokemon.setHeight(pokemon.getHeight());
        // Update the existing Pokemon's weight
        existingPokemon.setWeight(pokemon.getWeight());
        // Update the existing Pokemon's types string
        existingPokemon.setTypes(pokemon.getTypes());
        // Update the existing Pokemon's abilities string
        existingPokemon.setAbilities(pokemon.getAbilities());
        // Update the existing Pokemon's weaknesses string
        existingPokemon.setWeaknesses(pokemon.getWeaknesses());
        // Update the existing Pokemon's base HP stat
        existingPokemon.setHp(pokemon.getHp());
        // Update the existing Pokemon's base Attack stat
        existingPokemon.setAttack(pokemon.getAttack());
        // Update the existing Pokemon's base Defense stat
        existingPokemon.setDefense(pokemon.getDefense());
        // Update the existing Pokemon's base Speed stat
        existingPokemon.setSpeed(pokemon.getSpeed());
        // Update the existing Pokemon's base Special Attack stat
        existingPokemon.setSpecialAttack(pokemon.getSpecialAttack());
        // Update the existing Pokemon's base Special Defense stat
        existingPokemon.setSpecialDefense(pokemon.getSpecialDefense());
        // Save the updated Pokemon entity to the database and return the persisted result
        return pokemonRepository.save(existingPokemon);
    // End of the updatePokemon method
    }

    // Method to soft-delete a Pokemon by setting its isDeleted flag to true
    public void deletePokemon(Integer id) {
        // Retrieve the Pokemon from the database; throws an exception if not found
        Pokemon pokemon = getPokemonById(id);
        // Set the soft-delete flag to true to hide this Pokemon from public listings
        pokemon.setDeleted(true);
        // Save the updated Pokemon record to persist the soft-delete
        pokemonRepository.save(pokemon);
    // End of the deletePokemon method
    }

    // Method to retrieve a list of all soft-deleted Pokemon sorted by ID ascending
    public List<Pokemon> getDeletedPokemon() {
        // Query the repository for all Pokemon where isDeleted is true, sorted by id ascending
        return pokemonRepository.findByIsDeletedTrue(Sort.by(Sort.Direction.ASC, "id"));
    // End of the getDeletedPokemon method
    }

    // Method to restore a previously soft-deleted Pokemon by its ID
    public void restorePokemon(Integer id) {
        // Retrieve the soft-deleted Pokemon from the database; throws an exception if not found
        Pokemon pokemon = getPokemonById(id);
        // Set the isDeleted flag back to false to make the Pokemon visible again
        pokemon.setDeleted(false);
        // Save the updated Pokemon record to persist the restoration
        pokemonRepository.save(pokemon);
    // End of the restorePokemon method
    }

    // Method to permanently delete a Pokemon record from the database by its ID
    public void permanentlyDeletePokemon(Integer id) {
        // Check if a Pokemon with the given ID exists before attempting deletion
        if (!pokemonRepository.existsById(id)) {
            // Throw a ResourceNotFoundException if no Pokemon exists with this ID
            throw new CustomExceptions.ResourceNotFoundException("Pokemon not found");
        // End of the existence check
        }
        // Permanently remove the Pokemon record from the database by its ID
        pokemonRepository.deleteById(id);
    // End of the permanentlyDeletePokemon method
    }

    // Private helper method to validate and normalize a search or filter value
    private String requireSearchValue(String value, String message) {
        // Check if the value is null or contains only whitespace
        if (value == null || value.isBlank()) {
            // Throw an exception with the provided message if the value is invalid
            throw new IllegalArgumentException(message);
        // End of the null/blank check
        }
        // Return the trimmed version of the value for consistent querying
        return value.trim();
    // End of the requireSearchValue method
    }

    // Private helper method to normalize string fields on a Pokemon object before saving
    private void normalizePokemon(Pokemon pokemon) {
        // Trim the name and set it to null if it is blank
        pokemon.setName(trimToNull(pokemon.getName()));
        // Trim the types and set it to null if it is blank
        pokemon.setTypes(trimToNull(pokemon.getTypes()));
        // Trim the abilities and set it to null if it is blank
        pokemon.setAbilities(trimToNull(pokemon.getAbilities()));
        // Trim the weaknesses and set it to null if it is blank
        pokemon.setWeaknesses(trimToNull(pokemon.getWeaknesses()));
    // End of the normalizePokemon method
    }

    // Private helper method to trim a string and return null if the result is empty
    private String trimToNull(String value) {
        // Return null immediately if the input value is already null
        if (value == null) {
            // Propagate the null value without modification
            return null;
        // End of the null check
        }
        // Trim leading and trailing whitespace from the value
        String trimmedValue = value.trim();
        // Return null if the trimmed string is empty, otherwise return the trimmed string
        return trimmedValue.isEmpty() ? null : trimmedValue;
    // End of the trimToNull method
    }
// End of the PokemonService class
}
