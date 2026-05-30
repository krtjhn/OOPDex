// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import DuplicateCatchException to throw when a user attempts to catch a Pokemon they already own
import com.oopdex.exception.DuplicateCatchException;
// Import CustomExceptions to access the ResourceNotFoundException inner class
import com.oopdex.exception.CustomExceptions;
// Import the User entity class to look up the user who is catching a Pokemon
import com.oopdex.user.User;
// Import UserRepository for querying user data from the database
import com.oopdex.user.UserRepository;
// Import Service annotation to register this class as a Spring service bean
import org.springframework.stereotype.Service;
// Import Transactional annotation to wrap methods in a database transaction
import org.springframework.transaction.annotation.Transactional;

// Import List to return collections of CaughtPokemon objects
import java.util.List;

// Annotation to register this class as a Spring service component
@Service
// Class definition for CaughtPokemonService which handles all caught Pokemon business logic
public class CaughtPokemonService {

    // Field for the repository that manages CaughtPokemon database records
    private final CaughtPokemonRepository caughtPokemonRepository;
    // Field for the repository that manages User database records
    private final UserRepository userRepository;
    // Field for the repository that manages Pokemon database records
    private final PokemonRepository pokemonRepository;

    // Constructor to inject all three required repository dependencies
    public CaughtPokemonService(CaughtPokemonRepository caughtPokemonRepository,
                                UserRepository userRepository,
                                PokemonRepository pokemonRepository) {
        // Assign the injected CaughtPokemonRepository to the local field
        this.caughtPokemonRepository = caughtPokemonRepository;
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
        // Assign the injected PokemonRepository to the local field
        this.pokemonRepository = pokemonRepository;
    // End of the constructor
    }

    // Annotation to wrap this method in a database transaction so changes are atomic
    @Transactional
    // Method to add a new Pokemon to a user's collection by user ID and Pokemon ID
    public CaughtPokemon catchPokemon(Long userId, int pokemonId) {
        // Check whether the Pokemon with the given ID actually exists in the database
        if (!pokemonRepository.existsById(pokemonId)) {
            // Throw a ResourceNotFoundException if no Pokemon is found with that ID
            throw new CustomExceptions.ResourceNotFoundException("Pokemon not found");
        // End of the Pokemon existence check
        }

        // Check whether this user has already caught the Pokemon with the given ID
        if (caughtPokemonRepository.findByUserIdAndPokemonId(userId, pokemonId).isPresent()) {
            // Throw a DuplicateCatchException to signal the Pokemon is already in the user's collection
            throw new DuplicateCatchException("Pokemon already in your collection");
        // End of the duplicate catch check
        }

        // Retrieve the User entity from the database; throw an exception if not found
        User user = userRepository.findById(userId)
                // Throw ResourceNotFoundException if the user does not exist
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        // Create a new CaughtPokemon entity with no nickname (null) using the found user and Pokemon ID
        CaughtPokemon caughtPokemon = new CaughtPokemon(user, pokemonId, null);
        // Save the new CaughtPokemon entity to the database and return the persisted result
        return caughtPokemonRepository.save(caughtPokemon);
    // End of the catchPokemon method
    }

    // Private helper method to retrieve a CaughtPokemon that belongs to a specific user
    private CaughtPokemon getOwnedCaughtPokemon(Long userId, Long caughtPokemonId) {
        // Query the repository for a CaughtPokemon matching both the record ID and user ID
        return caughtPokemonRepository.findByIdAndUserId(caughtPokemonId, userId)
                // Throw a ResourceNotFoundException if no matching record is found for this user
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Caught Pokemon not found"));
    // End of the getOwnedCaughtPokemon method
    }

    // Annotation to wrap this method in a database transaction
    @Transactional
    // Method to release (delete) a caught Pokemon from the user's collection
    public void releasePokemon(Long userId, Long caughtPokemonId) {
        // Delete the CaughtPokemon record after verifying it belongs to the given user
        caughtPokemonRepository.delete(getOwnedCaughtPokemon(userId, caughtPokemonId));
    // End of the releasePokemon method
    }


    // Annotation to wrap this method in a database transaction
    @Transactional
    // Method to update the nickname of a caught Pokemon for a specific user
    public CaughtPokemon updateNickname(Long userId, Long caughtPokemonId, String nickname) {
        // Retrieve the CaughtPokemon record that belongs to this user
        CaughtPokemon cp = getOwnedCaughtPokemon(userId, caughtPokemonId);
        // Normalize the nickname: set to null if blank or null, otherwise trim whitespace
        String normalizedNickname = nickname == null || nickname.isBlank() ? null : nickname.trim();
        // Apply the normalized nickname to the CaughtPokemon entity
        cp.setNickname(normalizedNickname);
        // Save the updated CaughtPokemon record and return the result
        return caughtPokemonRepository.save(cp);
    // End of the updateNickname method
    }

    // Method to retrieve the full list of Pokemon in a user's collection
    public List<CaughtPokemon> getUserCollection(Long userId) {
        // Query the repository for all CaughtPokemon records belonging to the given user ID
        return caughtPokemonRepository.findByUserId(userId);
    // End of the getUserCollection method
    }
// End of the CaughtPokemonService class
}
