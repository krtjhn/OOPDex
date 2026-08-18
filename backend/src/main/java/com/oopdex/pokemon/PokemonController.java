// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import the User entity for retrieving the currently authenticated user's details
import com.oopdex.user.User;
// Import the UserRepository to query the user database by email
import com.oopdex.user.UserRepository;
// Import Valid annotation for bean validation on request bodies
import jakarta.validation.Valid;
// Import HttpStatus for setting HTTP response status codes
import org.springframework.http.HttpStatus;
// Import ResponseEntity to wrap HTTP responses
import org.springframework.http.ResponseEntity;
// Import PreAuthorize for enforcing role-based access control on endpoints
import org.springframework.security.access.prepost.PreAuthorize;
// Import Authentication to retrieve the current authenticated principal from the security context
import org.springframework.security.core.Authentication;
// Import SecurityContextHolder to access the current security context
import org.springframework.security.core.context.SecurityContextHolder;
// Import all Spring Web annotations for REST controller endpoint mapping
import org.springframework.web.bind.annotation.*;

// Import List for returning collections of Pokemon or CaughtPokemon objects
import java.util.List;

// Annotation to mark this class as a REST controller component
@RestController
// Annotation to map all endpoints in this controller to the /api/pokemon base path
@RequestMapping("/api/pokemon")
// Class definition for PokemonController which handles all Pokemon-related API requests
public class PokemonController {

    // Field for the PokemonService handling Pokemon data and business logic
    private final PokemonService pokemonService;
    // Field for the CaughtPokemonService handling user collection business logic
    private final CaughtPokemonService caughtPokemonService;
    // Field for the UserRepository used to look up the authenticated user's full profile
    private final UserRepository userRepository;

    // Constructor to inject all required dependencies
    public PokemonController(PokemonService pokemonService,
                             CaughtPokemonService caughtPokemonService,
                             UserRepository userRepository) {
        // Assign the injected PokemonService to the local field
        this.pokemonService = pokemonService;
        // Assign the injected CaughtPokemonService to the local field
        this.caughtPokemonService = caughtPokemonService;
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
    // End of the constructor
    }

    // Private helper method to retrieve the currently authenticated User entity from the database
    private User getAuthenticatedUser() {
        // Retrieve the Authentication object from the current security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Look up the user by their email (the principal name) and throw an exception if not found
        return userRepository.findByEmail(auth.getName())
                // Throw a ResourceNotFoundException if no user exists with the authenticated email
                .orElseThrow(() -> new com.oopdex.exception.CustomExceptions.ResourceNotFoundException("User not found"));
    // End of the getAuthenticatedUser method
    }

    // Annotation to map HTTP GET requests to the /api/pokemon path to this method
    @GetMapping
    // Method to retrieve and return a list of all non-deleted Pokemon
    public ResponseEntity<List<Pokemon>> getAllPokemon() {
        // Return a 200 OK response containing the full list of active Pokemon
        return ResponseEntity.ok(pokemonService.getAllPokemon());
    // End of the getAllPokemon method
    }

    // Annotation to map HTTP GET requests to /api/pokemon/{id} to this method
    @GetMapping("/{id}")
    // Method to retrieve a single Pokemon by its Pokedex ID
    public ResponseEntity<Pokemon> getPokemonById(@PathVariable Integer id) {
        // Return a 200 OK response containing the Pokemon found by its ID
        return ResponseEntity.ok(pokemonService.getPokemonById(id));
    // End of the getPokemonById method
    }

    // Annotation to map HTTP GET requests to /api/pokemon/search to this method
    @GetMapping("/search")
    // Method to search for Pokemon by name, accepting the name as a query parameter
    public ResponseEntity<List<Pokemon>> searchPokemon(@RequestParam String name) {
        // Return a 200 OK response containing the list of Pokemon whose names match the query
        return ResponseEntity.ok(pokemonService.searchPokemon(name));
    // End of the searchPokemon method
    }

    // Annotation to map HTTP GET requests to /api/pokemon/filter to this method
    @GetMapping("/filter")
    // Method to filter Pokemon by type, accepting the type as a query parameter
    public ResponseEntity<List<Pokemon>> filterPokemon(@RequestParam String type) {
        // Return a 200 OK response containing the list of Pokemon matching the given type
        return ResponseEntity.ok(pokemonService.filterPokemon(type));
    // End of the filterPokemon method
    }

    // Annotation to map HTTP POST requests to /api/pokemon/catch to this method
    @PostMapping("/catch")
    // Restrict this endpoint to authenticated users with the USER role
    @PreAuthorize("hasRole('USER')")
    // Method to add a Pokemon to the authenticated user's collection
    public ResponseEntity<CaughtPokemon> catchPokemon(@Valid @RequestBody CatchPokemonRequest request) {
        // Retrieve the currently authenticated user from the database
        User user = getAuthenticatedUser();
        // Call the service to catch the specified Pokemon and add it to the user's collection
        CaughtPokemon caught = caughtPokemonService.catchPokemon(user.getId(), request.pokemonId());
        // Return a 201 Created response containing the newly caught Pokemon record
        return ResponseEntity.status(HttpStatus.CREATED).body(caught);
    // End of the catchPokemon method
    }

    // Annotation to map HTTP DELETE requests to /api/pokemon/release/{caughtPokemonId} to this method
    @DeleteMapping("/release/{caughtPokemonId}")
    // Restrict this endpoint to authenticated users with the USER role
    @PreAuthorize("hasRole('USER')")
    // Method to release (remove) a caught Pokemon from the authenticated user's collection
    public ResponseEntity<Void> releasePokemon(@PathVariable Long caughtPokemonId) {
        // Retrieve the currently authenticated user from the database
        User user = getAuthenticatedUser();
        // Call the service to delete the caught Pokemon record owned by this user
        caughtPokemonService.releasePokemon(user.getId(), caughtPokemonId);
        // Return a 204 No Content response to confirm the Pokemon was released
        return ResponseEntity.noContent().build();
    // End of the releasePokemon method
    }

    // Annotation to map HTTP GET requests to /api/pokemon/my-collection to this method
    @GetMapping("/my-collection")
    // Restrict this endpoint to authenticated users with the USER role
    @PreAuthorize("hasRole('USER')")
    // Method to retrieve the full list of Pokemon in the authenticated user's collection
    public ResponseEntity<List<CaughtPokemon>> getMyCollection() {
        // Retrieve the currently authenticated user from the database
        User user = getAuthenticatedUser();
        // Return a 200 OK response containing the user's full Pokemon collection
        return ResponseEntity.ok(caughtPokemonService.getUserCollection(user.getId()));
    // End of the getMyCollection method
    }
// End of the PokemonController class
}
