// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import JpaRepository for standard CRUD and JPA operations on CaughtPokemon entities
import org.springframework.data.jpa.repository.JpaRepository;
// Import Repository annotation to mark this interface as a Spring Data repository
import org.springframework.stereotype.Repository;
// Import List to return collections of CaughtPokemon records
import java.util.List;
// Import Optional to represent a single CaughtPokemon that may or may not exist
import java.util.Optional;

// Annotation to register this interface as a Spring Data repository bean
@Repository
// Interface definition for CaughtPokemonRepository extending JpaRepository for CaughtPokemon entities with Long IDs
public interface CaughtPokemonRepository extends JpaRepository<CaughtPokemon, Long> {
    // Method to find all CaughtPokemon records belonging to a specific user by their user ID
    List<CaughtPokemon> findByUserId(Long userId);
    // Method to find a single CaughtPokemon record by its own ID and the owning user's ID
    Optional<CaughtPokemon> findByIdAndUserId(Long id, Long userId);
    // Method to find a single CaughtPokemon record by the user ID and Pokemon ID (to check for duplicates)
    Optional<CaughtPokemon> findByUserIdAndPokemonId(Long userId, int pokemonId);
// End of the CaughtPokemonRepository interface
}
