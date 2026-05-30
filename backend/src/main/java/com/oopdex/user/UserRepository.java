// Package declaration for the user module of the Oopdex application
package com.oopdex.user;

// Import JpaRepository to inherit standard CRUD and JPA operations for User entities
import org.springframework.data.jpa.repository.JpaRepository;
// Import Optional to represent a single User result that may or may not exist
import java.util.Optional;

// Interface definition for UserRepository, extending JpaRepository for User entities with Long IDs
public interface UserRepository extends JpaRepository<User, Long> {
    // Method to find a User by their email address (used for login and authentication lookups)
    Optional<User> findByEmail(String email);
    // Method to find a User by their exact username (case-sensitive)
    Optional<User> findByUsername(String username);
    // Method to find a User by their username in a case-insensitive manner (used for uniqueness checks)
    Optional<User> findByUsernameIgnoreCase(String username);
// End of the UserRepository interface
}