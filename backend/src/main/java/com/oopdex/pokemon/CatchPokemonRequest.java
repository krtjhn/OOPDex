// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import NotNull validation annotation to enforce that the pokemonId field is not null
import jakarta.validation.constraints.NotNull;
// Import Positive validation annotation to enforce that the pokemonId field must be a positive number
import jakarta.validation.constraints.Positive;

// Record declaration for CatchPokemonRequest, a DTO used when a user wants to catch a Pokemon
public record CatchPokemonRequest(
        // Annotation to validate that pokemonId is not null, with a descriptive error message
        @NotNull(message = "pokemonId is required.")
        // Annotation to validate that pokemonId is a positive integer, with a descriptive error message
        @Positive(message = "pokemonId must be positive.")
        // The ID of the Pokemon the user wants to catch, corresponding to its Pokedex number
        Integer pokemonId
// End of the CatchPokemonRequest record component list
) {
// End of the CatchPokemonRequest record body
}
