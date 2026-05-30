// Package declaration for the user module of the Oopdex application
package com.oopdex.user;

// Import CustomExceptions to throw ResourceNotFoundException when a user is not found
import com.oopdex.exception.CustomExceptions;
// Import Service annotation to register this class as a Spring service bean
import org.springframework.stereotype.Service;

// Import List to return collections of User objects
import java.util.List;

// Annotation to register this class as a Spring service component
@Service
// Class definition for UserService which handles all user-related business logic
public class UserService {

    // Field for the UserRepository used to query and modify user database records
    private final UserRepository userRepository;

    // Constructor to inject the UserRepository dependency
    public UserService(UserRepository userRepository) {
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
    // End of the constructor
    }

    // Method to retrieve a User entity by their email address
    public User getUserByEmail(String email) {
        // Query the repository by email; throw a ResourceNotFoundException if not found
        return userRepository.findByEmail(email)
                // Throw an exception if no user exists with the given email
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
    // End of the getUserByEmail method
    }

    // Method to retrieve a User entity by their database ID
    public User getUserById(Long userId) {
        // Query the repository by ID; throw a ResourceNotFoundException if not found
        return userRepository.findById(userId)
                // Throw an exception if no user exists with the given ID
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
    // End of the getUserById method
    }

    // Method to retrieve all User records from the database
    public List<User> getAllUsers() {
        // Delegate to the repository to retrieve the full list of users
        return userRepository.findAll();
    // End of the getAllUsers method
    }

    // Method to search for users whose username or email contains the given query string
    public List<User> searchUsers(String query) {
        // Reject the search if the query is null or blank
        if (query == null || query.isBlank()) {
            // Throw an exception requiring a non-blank search query
            throw new IllegalArgumentException("Search query is required.");
        // End of the null/blank check
        }
        // Normalize the query to lowercase and trim whitespace for case-insensitive comparison
        String normalizedQuery = query.trim().toLowerCase();
        // Stream all users and filter by those whose username or email contains the normalized query
        return userRepository.findAll().stream()
                // Include users whose username or email matches the query (case-insensitive)
                .filter(user -> containsIgnoreCase(user.getUsername(), normalizedQuery)
                        // Also check the email field for a match
                        || containsIgnoreCase(user.getEmail(), normalizedQuery))
                // Collect the filtered stream results into a list
                .toList();
    // End of the searchUsers method
    }

    // Method to permanently delete a User record from the database by their ID
    public void deleteUser(Long userId) {
        // Check if a user with the given ID exists before attempting deletion
        if (!userRepository.existsById(userId)) {
            // Throw a ResourceNotFoundException if no user exists with this ID
            throw new CustomExceptions.ResourceNotFoundException("User not found");
        // End of the existence check
        }
        // Permanently delete the user record from the database by their ID
        userRepository.deleteById(userId);
    // End of the deleteUser method
    }

    // Private helper method to check if a string value contains the normalized query (case-insensitive)
    private boolean containsIgnoreCase(String value, String normalizedQuery) {
        // Return true if the value is not null and its lowercase form contains the query string
        return value != null && value.toLowerCase().contains(normalizedQuery);
    // End of the containsIgnoreCase method
    }
// End of the UserService class
}
