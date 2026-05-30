// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import JpaRepository to inherit standard CRUD and JPA operations for Pokemon entities
import org.springframework.data.jpa.repository.JpaRepository;
// Import List to return collections of Pokemon objects
import java.util.List;

// Import Sort to allow sorting of query results
import org.springframework.data.domain.Sort;

// Interface definition for PokemonRepository, extending JpaRepository for Pokemon entities with Integer IDs
public interface PokemonRepository extends JpaRepository<Pokemon, Integer> {
    // Method to find all Pokemon that have not been soft-deleted, ordered by the provided Sort parameter
    List<Pokemon> findByIsDeletedFalse(Sort sort);
    // Method to find all Pokemon that have been soft-deleted, ordered by the provided Sort parameter
    List<Pokemon> findByIsDeletedTrue(Sort sort);
    // Method to search for non-deleted Pokemon whose name contains the given string (case-insensitive)
    List<Pokemon> findByNameContainingIgnoreCaseAndIsDeletedFalse(String name);
    // Method to search for non-deleted Pokemon whose types field contains the given type string (case-insensitive)
    List<Pokemon> findByTypesContainingIgnoreCaseAndIsDeletedFalse(String type);
// End of the PokemonRepository interface
}