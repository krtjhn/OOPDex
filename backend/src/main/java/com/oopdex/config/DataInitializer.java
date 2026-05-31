// Package declaration for the config module of the Oopdex application
package com.oopdex.config;

// Import the Gen1PokemonSeeder class responsible for seeding Generation 1 Pokemon data
import com.oopdex.pokemon.Gen1PokemonSeeder;
// Import the PokemonRepository interface for database access to Pokemon records
import com.oopdex.pokemon.PokemonRepository;
// Import the User entity class for creating the default admin user
import com.oopdex.user.User;
// Import the UserRepository interface for database access to user records
import com.oopdex.user.UserRepository;
// Import CommandLineRunner interface so this class runs on application startup
import org.springframework.boot.CommandLineRunner;
// Import PasswordEncoder for securely hashing the default admin password
import org.springframework.security.crypto.password.PasswordEncoder;
// Import Component annotation to register this class as a Spring-managed bean
import org.springframework.stereotype.Component;

// Annotation to register this class as a Spring component bean
@Component
// Class definition for DataInitializer which seeds initial data on application startup
public class DataInitializer implements CommandLineRunner {

    // Constant defining the maximum number of Generation 1 Pokemon (Bulbasaur to Mew)
    private static final int GEN1_MAX_ID = 151;

    // Field for the user repository to query and save user records
    private final UserRepository userRepository;
    // Field for the pokemon repository to count existing Pokemon in the database
    private final PokemonRepository pokemonRepository;
    // Field for the password encoder to hash the default admin password
    private final PasswordEncoder passwordEncoder;
    // Field for the Gen1 Pokemon seeder used to populate missing Pokemon data
    private final Gen1PokemonSeeder pokemonSeeder;

    // Constructor to inject all required dependencies via Spring's dependency injection
    public DataInitializer(UserRepository userRepository,
                           PokemonRepository pokemonRepository,
                           PasswordEncoder passwordEncoder,
                           Gen1PokemonSeeder pokemonSeeder) {
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
        // Assign the injected PokemonRepository to the local field
        this.pokemonRepository = pokemonRepository;
        // Assign the injected PasswordEncoder to the local field
        this.passwordEncoder = passwordEncoder;
        // Assign the injected Gen1PokemonSeeder to the local field
        this.pokemonSeeder = pokemonSeeder;
    // End of the constructor
    }

    // Override annotation to indicate this method implements the CommandLineRunner interface
    @Override
    // Method executed on application startup; seeds the database with initial data
    public void run(String... args) throws Exception {
        // Check if the Pokemon database has fewer records than the expected 151 Gen 1 Pokemon
        if (pokemonRepository.count() < GEN1_MAX_ID) {
            // Call the seeder to fetch and insert any missing Gen 1 Pokemon from the PokeAPI
            pokemonSeeder.syncMissingGen1();
        // End of the Pokemon seeding check
        }

        // Check if the default admin user "oak" does not already exist in the database
        if (userRepository.findByUsername("oak").isEmpty()) {
            // Create a new User object to represent the default administrator account
            User oak = new User();
            // Set the username for the default admin to "oak"
            oak.setUsername("oak");
            // Set the email address for the default admin using the institutional domain
            oak.setEmail("oak@pokemon.lab");
            // Set the admin's password after encoding it securely with BCrypt
            oak.setPassword(passwordEncoder.encode("prof_oak_123"));
            // Assign the ADMIN role to this user so they have elevated privileges
            oak.setRole(User.Role.ROLE_ADMIN);
            // Save the newly created admin user to the database
            userRepository.save(oak);
        // End of the admin user seeding check
        }

    // End of the run method
    }
// End of the DataInitializer class
}
