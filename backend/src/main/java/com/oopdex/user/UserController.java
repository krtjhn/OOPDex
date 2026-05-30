// Package declaration for the user module of the Oopdex application
package com.oopdex.user;

// Import HttpStatus for setting specific HTTP status codes on responses
import org.springframework.http.HttpStatus;
// Import ResponseEntity to wrap HTTP responses with status codes and bodies
import org.springframework.http.ResponseEntity;
// Import PreAuthorize for method-level role-based access control
import org.springframework.security.access.prepost.PreAuthorize;
// Import Authentication to retrieve the currently authenticated principal
import org.springframework.security.core.Authentication;
// Import SecurityContextHolder to access the security context of the current request
import org.springframework.security.core.context.SecurityContextHolder;
// Import ResponseStatusException to throw HTTP errors with a status and message
import org.springframework.web.server.ResponseStatusException;
// Import all Spring Web REST annotations for endpoint mapping
import org.springframework.web.bind.annotation.*;

// Import List for returning collections of User objects
import java.util.List;

// Annotation to mark this class as a REST controller
@RestController
// Annotation to map all endpoints in this controller to the /api/user base path
@RequestMapping("/api/user")
// Class definition for UserController which handles all user profile API requests
public class UserController {

    // Field for the UserRepository to perform direct database queries on users
    private final UserRepository userRepository;
    // Field for the UserService containing user-related business logic
    private final UserService userService;

    // Constructor to inject the required dependencies
    public UserController(UserRepository userRepository, UserService userService) {
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
        // Assign the injected UserService to the local field
        this.userService = userService;
    // End of the constructor
    }

    // Annotation to map HTTP GET requests to /api/user/me to this method
    @GetMapping("/me")
    // Restrict this endpoint to authenticated users with either USER or ADMIN role
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    // Method to retrieve the currently authenticated user's profile
    public ResponseEntity<User> getCurrentUser() {
        // Retrieve the Authentication object from the current security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Look up the user by their email and return a 200 OK response with the User object
        return ResponseEntity.ok(userService.getUserByEmail(auth.getName()));
    // End of the getCurrentUser method
    }

    // Annotation to map HTTP PUT requests to /api/user/me/profile to this method
    @PutMapping("/me/profile")
    // Restrict this endpoint to authenticated users with either USER or ADMIN role
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    // Method to update the authenticated user's profile using a JSON request body
    public ResponseEntity<User> updateProfile(@RequestBody User profileUpdates) {
        // Delegate the update to the helper method using fields from the request body
        return saveProfileUpdates(
                // Pass the username from the request body
                profileUpdates.getUsername(),
                // Pass the bio from the request body
                profileUpdates.getBio(),
                // Pass the trainer class from the request body
                profileUpdates.getTrainerClass(),
                // Pass the profile picture URL from the request body
                profileUpdates.getProfilePictureUrl()
        // End of the saveProfileUpdates call arguments
        );
    // End of the updateProfile method
    }

    // Private helper method to resolve the current user and apply profile field updates
    private ResponseEntity<User> saveProfileUpdates(String username, String bio, String trainerClass, String profilePictureUrl) {
        // Retrieve the Authentication object from the current security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Look up the current user by their email; throw an exception if not found
        User currentUser = userRepository.findByEmail(auth.getName())
                // Throw a ResourceNotFoundException if the authenticated user cannot be found
                .orElseThrow(() -> new com.oopdex.exception.CustomExceptions.ResourceNotFoundException("User not found"));

        // Check if a username update was requested
        if (username != null) {
            // Trim the provided username to remove leading and trailing whitespace
            String trimmedUsername = username.trim();
            // Reject the update if the trimmed username is empty
            if (trimmedUsername.isEmpty()) {
                // Throw a 400 Bad Request exception indicating the name is required
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required.");
            // End of the empty username check
            }

            // Enforce that the trimmed username is between 3 and 20 characters
            if (trimmedUsername.length() < 3 || trimmedUsername.length() > 20) {
                // Throw a 400 Bad Request exception with a descriptive length error message
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name must be between 3 and 20 characters.");
            // End of the length check
            }

            // Check if another user already has this username (case-insensitive)
            userRepository.findByUsernameIgnoreCase(trimmedUsername)
                    // Filter out the current user so they can keep their own username
                    .filter(existingUser -> !existingUser.getId().equals(currentUser.getId()))
                    // If a different user already has this username, throw a conflict error
                    .ifPresent(existingUser -> {
                        // Throw a 409 Conflict exception to signal the username is already taken
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "That name is already taken.");
                    // End of the ifPresent lambda
                    });
            // Apply the valid trimmed username to the current user
            currentUser.setUsername(trimmedUsername);
        // End of the username update block
        }

        // Check if a bio update was requested
        if (bio != null) {
            // Set the bio to null if it is blank, otherwise set the trimmed value
            currentUser.setBio(bio.isBlank() ? null : bio.trim());
        // End of the bio update block
        }

        // Check if a trainer class update was requested
        if (trainerClass != null) {
            // Trim the provided trainer class string
            String trimmedTrainerClass = trainerClass.trim();
            // Reject the update if the trimmed trainer class exceeds 50 characters
            if (trimmedTrainerClass.length() > 50) {
                // Throw a 400 Bad Request exception with a descriptive length error message
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trainer class must be 50 characters or fewer.");
            // End of the length check
            }
            // Set the trainer class to null if it is blank, otherwise set the trimmed value
            currentUser.setTrainerClass(trimmedTrainerClass.isEmpty() ? null : trimmedTrainerClass);
        // End of the trainer class update block
        }

        // Check if a profile picture URL update was requested
        if (profilePictureUrl != null) {
            // Trim the provided profile picture URL string
            String trimmedProfilePictureUrl = profilePictureUrl.trim();
            // Reject the URL if it exceeds 500 characters
            if (trimmedProfilePictureUrl.length() > 500) {
                // Throw a 400 Bad Request exception indicating the URL is too long
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile picture URL is too long.");
            // End of the URL length check
            }
            // Set the profile picture URL to null if blank, otherwise set the trimmed value
            currentUser.setProfilePictureUrl(trimmedProfilePictureUrl.isEmpty() ? null : trimmedProfilePictureUrl);
        // End of the profile picture URL update block
        }

        // Save the updated User entity to the database and return a 200 OK response
        return ResponseEntity.ok(userRepository.save(currentUser));
    // End of the saveProfileUpdates method
    }

    // Annotation to map HTTP GET requests to /api/user/search to this method
    @GetMapping("/search")
    // Restrict this endpoint to authenticated users with either USER or ADMIN role
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    // Method to search for users by a query string, returning a list of matching users
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        // Delegate the search to the UserService and return a 200 OK response with the results
        return ResponseEntity.ok(userService.searchUsers(query));
    // End of the searchUsers method
    }

    // Annotation to map HTTP GET requests to /api/user/{userId} to this method
    @GetMapping("/{userId}")
    // Restrict this endpoint to authenticated users with either USER or ADMIN role
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    // Method to retrieve another user's public profile by their user ID
    public ResponseEntity<User> getPublicProfile(@PathVariable Long userId) {
        // Delegate the lookup to the UserService and return a 200 OK response with the found user
        return ResponseEntity.ok(userService.getUserById(userId));
    // End of the getPublicProfile method
    }
// End of the UserController class
}
