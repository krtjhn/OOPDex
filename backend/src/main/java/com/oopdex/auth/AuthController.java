// Package declaration for the auth module of the Oopdex application
package com.oopdex.auth;

// Import the User entity class from the user module
import com.oopdex.user.User;
// Import the UserRepository interface for database operations on users
import com.oopdex.user.UserRepository;
// Import the Valid annotation for bean validation on request bodies
import jakarta.validation.Valid;
// Import HttpStatus for setting HTTP response status codes
import org.springframework.http.HttpStatus;
// Import ResponseEntity to wrap HTTP responses with status codes and bodies
import org.springframework.http.ResponseEntity;
// Import AuthenticationManager to handle authentication logic
import org.springframework.security.authentication.AuthenticationManager;
// Import UsernamePasswordAuthenticationToken to create authentication tokens
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// Import PasswordEncoder for encoding and matching passwords
import org.springframework.security.crypto.password.PasswordEncoder;
// Import PostMapping annotation for mapping HTTP POST requests
import org.springframework.web.bind.annotation.PostMapping;
// Import RequestBody annotation to bind HTTP request body to a method parameter
import org.springframework.web.bind.annotation.RequestBody;
// Import RequestMapping annotation to define the base URL path for this controller
import org.springframework.web.bind.annotation.RequestMapping;
// Import RestController annotation to mark this class as a REST API controller
import org.springframework.web.bind.annotation.RestController;

// Import LocalDateTime for capturing the current date and time
import java.time.LocalDateTime;

// Annotation to mark this class as a REST controller that handles HTTP requests
@RestController
// Annotation to map all endpoints in this controller to the /api/auth base path
@RequestMapping("/api/auth")
// Class definition for the AuthController which handles authentication operations
public class AuthController {

    // Field for the Spring Security authentication manager, used to authenticate users
    private final AuthenticationManager authenticationManager;
    // Field for the JWT utility class, used to generate and validate tokens
    private final JwtUtil jwtUtil;
    // Field for the user repository, used to query and save user data to the database
    private final UserRepository userRepository;
    // Field for the password encoder, used to hash user passwords before storing
    private final PasswordEncoder passwordEncoder;

    // Constructor for dependency injection of all required services
    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        // Assign the injected AuthenticationManager to the local field
        this.authenticationManager = authenticationManager;
        // Assign the injected JwtUtil to the local field
        this.jwtUtil = jwtUtil;
        // Assign the injected UserRepository to the local field
        this.userRepository = userRepository;
        // Assign the injected PasswordEncoder to the local field
        this.passwordEncoder = passwordEncoder;
    // End of constructor
    }

    // Map HTTP POST requests to /api/auth/register to this method
    @PostMapping("/register")
    // Method to handle user registration; validates the request body and returns the saved user
    public ResponseEntity<User> register(@Valid @RequestBody User user) {
        // Trim whitespace from the provided username
        String username = user.getUsername().trim();
        // Trim whitespace and convert the provided email to lowercase for consistency
        String email = user.getEmail().trim().toLowerCase();

        // Check if the email uses the required institutional domain
        if (!email.endsWith("@pokemon.lab")) {
            // Throw an exception if the email domain is not allowed
            throw new IllegalArgumentException("Only @pokemon.lab emails are allowed.");
        // End of domain validation check
        }

        // Check the database to see if the username is already in use (case-insensitive)
        userRepository.findByUsernameIgnoreCase(username).ifPresent(existingUser -> {
            // Throw an exception if the username is already taken
            throw new IllegalStateException("Username is already taken.");
        // End of username duplicate check
        });
        // Check the database to see if the email is already registered
        userRepository.findByEmail(email).ifPresent(existingUser -> {
            // Throw an exception if the email is already registered
            throw new IllegalStateException("Email is already registered.");
        // End of email duplicate check
        });

        // Set the cleaned-up username on the user object
        user.setUsername(username);
        // Set the normalized email on the user object
        user.setEmail(email);
        // Encode the raw password using BCrypt before storing it
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Assign the default role of ROLE_USER to the new user
        user.setRole(User.Role.ROLE_USER);
        // Set the account creation timestamp to the current date and time
        user.setCreatedAt(LocalDateTime.now());
        // Persist the new user entity to the database and capture the saved result
        User savedUser = userRepository.save(user);
        // Return a 201 Created HTTP response containing the saved user object
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    // End of the register method
    }

    // Map HTTP POST requests to /api/auth/login to this method
    @PostMapping("/login")
    // Method to handle user login; validates credentials and returns a JWT token
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        // Trim whitespace and normalize the email from the login request to lowercase
        String email = authRequest.getEmail().trim().toLowerCase();
        // Authenticate the user using Spring Security's AuthenticationManager
        authenticationManager.authenticate(
                // Create an authentication token with the provided email and password
                new UsernamePasswordAuthenticationToken(email, authRequest.getPassword())
        // End of authenticate call
        );

        // Look up the user in the database by email after successful authentication
        User user = userRepository.findByEmail(email)
            // Throw an exception if no user is found with the given email
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Generate a JWT token for the authenticated user
        final String jwt = jwtUtil.generateToken(user);

        // Return a 200 OK response containing the generated JWT token
        return ResponseEntity.ok(new AuthResponse(jwt));
    // End of the login method
    }
// End of the AuthController class
}
