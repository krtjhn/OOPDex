// Package declaration for the admin module of the Oopdex application
package com.oopdex.admin;

// Import statement for the User entity class
import com.oopdex.user.User;
// Import statement for the UserService class to handle user-related business logic
import com.oopdex.user.UserService;
// Import statement for Spring's ResponseEntity class to handle HTTP responses
import org.springframework.http.ResponseEntity;
// Import statement for Spring Security's PreAuthorize annotation for method-level security
import org.springframework.security.access.prepost.PreAuthorize;
// Import statement for Spring Web annotations for REST controllers and request mapping
import org.springframework.web.bind.annotation.*;

// Import statement for the standard Java List interface
import java.util.List;

// Annotation to mark this class as a REST controller component
@RestController
// Annotation to map web requests to the /api/admin base path
@RequestMapping("/api/admin")
// Annotation to restrict access to these endpoints to users with the ADMIN role
@PreAuthorize("hasRole('ADMIN')")
// Class declaration for the AdminController
public class AdminController {

    // Final variable to hold the injected UserService instance
    private final UserService userService;

    // Constructor for AdminController to inject the UserService dependency
    public AdminController(UserService userService) {
        // Assign the injected userService to the class field
        this.userService = userService;
    // End of the constructor
    }

    // Annotation to map HTTP GET requests to the /users path for retrieving all users
    @GetMapping("/users")
    // Method to handle the request to get all users, returning a list of User objects
    public ResponseEntity<List<User>> getAllUsers() {
        // Return a 200 OK response containing the list of all users retrieved from the service
        return ResponseEntity.ok(userService.getAllUsers());
    // End of the getAllUsers method
    }

    // Annotation to map HTTP GET requests to the /users/{userId} path for retrieving a specific user by ID
    @GetMapping("/users/{userId}")
    // Method to handle the request to get a user by their ID, extracting the ID from the path variable
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        // Return a 200 OK response containing the user retrieved from the service by their ID
        return ResponseEntity.ok(userService.getUserById(userId));
    // End of the getUserById method
    }

    // Annotation to map HTTP DELETE requests to the /users/{userId} path for deleting a specific user
    @DeleteMapping("/users/{userId}")
    // Method to handle the request to delete a user by their ID, extracting the ID from the path variable
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        // Call the service method to delete the user with the specified ID
        userService.deleteUser(userId);
        // Return a 204 No Content response to indicate the deletion was successful
        return ResponseEntity.noContent().build();
    // End of the deleteUser method
    }

    // Annotation to map HTTP GET requests to the /users/search path for searching users
    @GetMapping("/users/search")
    // Method to handle the request to search users, extracting the search query from the request parameters
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        // Return a 200 OK response containing the list of users matching the search query
        return ResponseEntity.ok(userService.searchUsers(query));
    // End of the searchUsers method
    }
// End of the AdminController class
}
