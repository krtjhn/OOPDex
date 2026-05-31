// Package declaration for the user module of the Oopdex application
package com.oopdex.user;

// Import ResponseEntity to wrap HTTP responses with status codes and bodies
import org.springframework.http.ResponseEntity;
// Import PreAuthorize for method-level role-based access control
import org.springframework.security.access.prepost.PreAuthorize;
// Import Authentication to retrieve the currently authenticated principal
import org.springframework.security.core.Authentication;
// Import SecurityContextHolder to access the security context of the current request
import org.springframework.security.core.context.SecurityContextHolder;
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

