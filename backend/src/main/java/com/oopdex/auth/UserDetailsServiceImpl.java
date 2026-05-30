// Package declaration for the auth module of the Oopdex application
package com.oopdex.auth;

// Import the User entity class from the user module
import com.oopdex.user.User;
// Import the UserRepository interface for database access to user records
import com.oopdex.user.UserRepository;
// Import SimpleGrantedAuthority to represent a user's granted role as a Spring Security authority
import org.springframework.security.core.authority.SimpleGrantedAuthority;
// Import UserDetails interface that Spring Security uses to represent an authenticated principal
import org.springframework.security.core.userdetails.UserDetails;
// Import UserDetailsService interface that must be implemented for Spring Security's authentication mechanism
import org.springframework.security.core.userdetails.UserDetailsService;
// Import UsernameNotFoundException which is thrown when a user cannot be found during authentication
import org.springframework.security.core.userdetails.UsernameNotFoundException;
// Import Service annotation to mark this class as a Spring service component
import org.springframework.stereotype.Service;

// Import List to hold the collection of granted authorities for the user
import java.util.List;

// Annotation to register this class as a Spring service bean
@Service
// Class definition that implements UserDetailsService to integrate with Spring Security's authentication flow
public class UserDetailsServiceImpl implements UserDetailsService {

    // Field for the user repository used to query the database for user records
    private final UserRepository userRepository;

    // Constructor to inject the UserRepository dependency
    public UserDetailsServiceImpl(UserRepository userRepository) {
        // Assign the injected repository to the local field
        this.userRepository = userRepository;
    // End of the constructor
    }

    // Override annotation indicating this method implements the interface's loadUserByUsername method
    @Override
    // Method to load a user's details by their email address (used as the username in this app)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Query the database for a user with the given email; throw an exception if not found
        User user = userRepository.findByEmail(email)
                // Throw UsernameNotFoundException with a descriptive message if the user is absent
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Get the user's role, defaulting to ROLE_USER if the role field is null
        User.Role role = user.getRole() != null ? user.getRole() : User.Role.ROLE_USER;

        // Build and return a Spring Security User object with the email, hashed password, and authority list
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), List.of(new SimpleGrantedAuthority(role.name())));
    // End of the loadUserByUsername method
    }
// End of the UserDetailsServiceImpl class
}