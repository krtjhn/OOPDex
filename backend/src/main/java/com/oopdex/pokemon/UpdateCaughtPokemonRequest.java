// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import the Size validation annotation to enforce a maximum length on the nickname
import jakarta.validation.constraints.Size;

// Record declaration for UpdateCaughtPokemonRequest, a DTO used when updating a caught Pokemon's nickname
public record UpdateCaughtPokemonRequest(
        // Validation annotation to restrict the nickname field to a maximum of 40 characters
        @Size(max = 40, message = "Nickname must be 40 characters or fewer.")
        // The new nickname for the caught Pokemon; null means no nickname update is requested
        String nickname
// End of the record component list
) {
    // Method to check whether a nickname update was included in this request
    public boolean hasNicknameUpdate() {
        // Return true if the nickname field is not null, indicating an update is requested
        return nickname != null;
    // End of the hasNicknameUpdate method
    }

    // Method to determine if this request carries no updates at all
    public boolean isEmpty() {
        // Return true if there is no nickname update specified
        return !hasNicknameUpdate();
    // End of the isEmpty method
    }
// End of the UpdateCaughtPokemonRequest record
}
