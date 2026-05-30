// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import Valid annotation for applying bean validation on request body fields
import jakarta.validation.Valid;
// Import ResponseEntity to wrap HTTP responses with appropriate status codes
import org.springframework.http.ResponseEntity;
// Import PreAuthorize for method-level role-based access control
import org.springframework.security.access.prepost.PreAuthorize;
// Import all Spring Web REST annotations for mapping HTTP requests
import org.springframework.web.bind.annotation.*;

// Import List to return collections of Pokemon objects
import java.util.List;

// Annotation to mark this class as a REST controller
@RestController
// Annotation to map all endpoints in this controller to the /api/admin/pokemon base path
@RequestMapping("/api/admin/pokemon")
// Class definition for AdminPokemonController which handles admin-only Pokemon management operations
public class AdminPokemonController {

    // Field for the PokemonService that contains the business logic for Pokemon operations
    private final PokemonService pokemonService;

    // Constructor to inject the PokemonService dependency
    public AdminPokemonController(PokemonService pokemonService) {
        // Assign the injected service to the local field
        this.pokemonService = pokemonService;
    // End of the constructor
    }

    // Map HTTP GET requests to the /deleted path to this method
    @GetMapping("/deleted")
    // Restrict this endpoint to users with the ADMIN role only
    @PreAuthorize("hasRole('ADMIN')")
    // Method to retrieve a list of all soft-deleted Pokemon records
    public ResponseEntity<List<Pokemon>> getDeletedPokemon() {
        // Return a 200 OK response with the list of soft-deleted Pokemon from the service
        return ResponseEntity.ok(pokemonService.getDeletedPokemon());
    // End of the getDeletedPokemon method
    }

    // Map HTTP PUT requests to /{id} path to this method
    @PutMapping("/{id}")
    // Restrict this endpoint to users with the ADMIN role only
    @PreAuthorize("hasRole('ADMIN')")
    // Method to update an existing Pokemon's details by its numeric ID
    public ResponseEntity<Pokemon> updatePokemon(@PathVariable Integer id, @Valid @RequestBody Pokemon pokemon) {
        // Delegate the update operation to the service and capture the updated Pokemon object
        Pokemon updated = pokemonService.updatePokemon(id, pokemon);
        // Return a 200 OK response containing the updated Pokemon object
        return ResponseEntity.ok(updated);
    // End of the updatePokemon method
    }

    // Map HTTP DELETE requests to /{id} path to this method
    @DeleteMapping("/{id}")
    // Restrict this endpoint to users with the ADMIN role only
    @PreAuthorize("hasRole('ADMIN')")
    // Method to soft-delete a Pokemon by its numeric ID
    public ResponseEntity<Void> deletePokemon(@PathVariable Integer id) {
        // Call the service to perform a soft-delete on the Pokemon with the given ID
        pokemonService.deletePokemon(id);
        // Return a 204 No Content response to confirm successful deletion
        return ResponseEntity.noContent().build();
    // End of the deletePokemon method
    }

    // Map HTTP POST requests to /{id}/restore path to this method
    @PostMapping("/{id}/restore")
    // Restrict this endpoint to users with the ADMIN role only
    @PreAuthorize("hasRole('ADMIN')")
    // Method to restore a previously soft-deleted Pokemon by its numeric ID
    public ResponseEntity<Void> restorePokemon(@PathVariable Integer id) {
        // Call the service to restore the soft-deleted Pokemon with the given ID
        pokemonService.restorePokemon(id);
        // Return a 200 OK response to confirm successful restoration
        return ResponseEntity.ok().build();
    // End of the restorePokemon method
    }

    // Map HTTP DELETE requests to /{id}/permanent path to this method
    @DeleteMapping("/{id}/permanent")
    // Restrict this endpoint to users with the ADMIN role only
    @PreAuthorize("hasRole('ADMIN')")
    // Method to permanently delete a Pokemon record from the database by its numeric ID
    public ResponseEntity<Void> permanentlyDeletePokemon(@PathVariable Integer id) {
        // Call the service to permanently remove the Pokemon with the given ID from the database
        pokemonService.permanentlyDeletePokemon(id);
        // Return a 204 No Content response to confirm successful permanent deletion
        return ResponseEntity.noContent().build();
    // End of the permanentlyDeletePokemon method
    }
// End of the AdminPokemonController class
}
