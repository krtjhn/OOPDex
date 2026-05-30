// Package declaration for the user module of the Oopdex application
package com.oopdex.user;

// Import CaughtPokemon entity to represent the user's Pokemon collection
import com.oopdex.pokemon.CaughtPokemon;
// Import JsonProperty annotation to control JSON serialization access for the password field
import com.fasterxml.jackson.annotation.JsonProperty;
// Import all JPA persistence annotations for entity mapping
import jakarta.persistence.*;
// Import Email validation annotation to enforce a valid email format
import jakarta.validation.constraints.Email;
// Import NotBlank validation annotation to ensure required string fields are not blank
import jakarta.validation.constraints.NotBlank;
// Import Size validation annotation to enforce string length constraints
import jakarta.validation.constraints.Size;
// Import JsonIgnore annotation to prevent the caughtPokemons list from being serialized
import com.fasterxml.jackson.annotation.JsonIgnore;
// Import LocalDateTime to store the account creation timestamp
import java.time.LocalDateTime;
// Import ArrayList to initialize the caughtPokemons collection
import java.util.ArrayList;
// Import List to declare the caughtPokemons relationship field
import java.util.List;

// Annotation to mark this class as a JPA entity
@Entity
// Annotation to map this entity to the "users" database table
@Table(name = "users")
// Class definition for the User entity representing a registered application user
public class User {

    // Annotation to mark this field as the primary key
    @Id
    // Annotation to use the database's auto-increment strategy for the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Field to store the unique database ID for this user
    private Long id;

    // Validation annotation to ensure the username is not blank
    @NotBlank
    // Validation annotation to enforce the username length between 3 and 20 characters
    @Size(min = 3, max = 20)
    // Annotation to enforce a unique constraint on the username column in the database
    @Column(unique = true)
    // Field to store the user's unique username
    private String username;

    // Validation annotation to ensure the email is not blank
    @NotBlank
    // Validation annotation to enforce a valid email format
    @Email
    // Annotation to enforce a unique constraint on the email column in the database
    @Column(unique = true)
    // Field to store the user's unique email address
    private String email;

    // Validation annotation to ensure the password is not blank
    @NotBlank
    // Validation annotation to enforce a minimum password length of 8 characters
    @Size(min = 8)
    // Annotation to make the password write-only so it is never included in JSON responses
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    // Field to store the user's hashed password
    private String password;

    // Annotation to store the Role enum value as a string in the database
    @Enumerated(EnumType.STRING)
    // Field to store the user's role (ROLE_USER or ROLE_ADMIN)
    private Role role;

    // Annotation to map this field to the "profile_picture_url" column with a max length of 500
    @Column(name = "profile_picture_url", length = 500)
    // Field to store the URL of the user's profile picture
    private String profilePictureUrl;

    // Annotation to store the bio as a TEXT column allowing longer content
    @Column(columnDefinition = "TEXT")
    // Field to store the user's biographical description
    private String bio;

    // Annotation to map this field to the "trainer_class" column with a max length of 50
    @Column(name = "trainer_class", length = 50)
    // Field to store the user's trainer class label (e.g., "Professor", "Trainer")
    private String trainerClass;

    // Field to store the account creation timestamp, defaulting to the current date and time
    private LocalDateTime createdAt = LocalDateTime.now();

    // Annotation to define a one-to-many relationship with CaughtPokemon mapped by the "user" field
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    // Annotation to prevent the caughtPokemons list from being serialized in JSON responses
    @JsonIgnore
    // Field to hold the list of all Pokemon caught by this user, initialized as an empty list
    private List<CaughtPokemon> caughtPokemons = new ArrayList<>();

    // Enum declaration for the Role type, defining the two possible user roles
    public enum Role {
        // Enum constant for a standard registered user
        ROLE_USER,
        // Enum constant for an administrator with elevated privileges
        ROLE_ADMIN
    // End of the Role enum
    }

    // Getter method to retrieve the user's unique database ID
    public Long getId() {
        // Return the stored id value
        return id;
    // End of the getId method
    }

    // Setter method to assign a database ID to this user
    public void setId(Long id) {
        // Assign the provided id to the field
        this.id = id;
    // End of the setId method
    }

    // Getter method to retrieve the user's username
    public String getUsername() {
        // Return the stored username value
        return username;
    // End of the getUsername method
    }

    // Setter method to assign a username to this user
    public void setUsername(String username) {
        // Assign the provided username to the field
        this.username = username;
    // End of the setUsername method
    }

    // Getter method to retrieve the user's email address
    public String getEmail() {
        // Return the stored email value
        return email;
    // End of the getEmail method
    }

    // Setter method to assign an email address to this user
    public void setEmail(String email) {
        // Assign the provided email to the field
        this.email = email;
    // End of the setEmail method
    }

    // Getter method to retrieve the user's hashed password
    public String getPassword() {
        // Return the stored password value
        return password;
    // End of the getPassword method
    }

    // Setter method to assign a password to this user
    public void setPassword(String password) {
        // Assign the provided password to the field
        this.password = password;
    // End of the setPassword method
    }

    // Getter method to retrieve the user's role
    public Role getRole() {
        // Return the stored Role enum value
        return role;
    // End of the getRole method
    }

    // Setter method to assign a role to this user
    public void setRole(Role role) {
        // Assign the provided Role to the field
        this.role = role;
    // End of the setRole method
    }

    // Getter method to retrieve the URL of the user's profile picture
    public String getProfilePictureUrl() {
        // Return the stored profile picture URL string
        return profilePictureUrl;
    // End of the getProfilePictureUrl method
    }

    // Setter method to assign a profile picture URL to this user
    public void setProfilePictureUrl(String profilePictureUrl) {
        // Assign the provided URL string to the field
        this.profilePictureUrl = profilePictureUrl;
    // End of the setProfilePictureUrl method
    }

    // Getter method to retrieve the user's bio
    public String getBio() {
        // Return the stored bio string
        return bio;
    // End of the getBio method
    }

    // Setter method to assign a bio to this user
    public void setBio(String bio) {
        // Assign the provided bio string to the field
        this.bio = bio;
    // End of the setBio method
    }

    // Getter method to retrieve the user's trainer class label
    public String getTrainerClass() {
        // Return the stored trainerClass string
        return trainerClass;
    // End of the getTrainerClass method
    }

    // Setter method to assign a trainer class to this user
    public void setTrainerClass(String trainerClass) {
        // Assign the provided trainer class string to the field
        this.trainerClass = trainerClass;
    // End of the setTrainerClass method
    }

    // Getter method to retrieve the user's account creation timestamp
    public LocalDateTime getCreatedAt() {
        // Return the stored createdAt timestamp
        return createdAt;
    // End of the getCreatedAt method
    }

    // Setter method to assign the account creation timestamp
    public void setCreatedAt(LocalDateTime createdAt) {
        // Assign the provided timestamp to the field
        this.createdAt = createdAt;
    // End of the setCreatedAt method
    }

    // Getter method to retrieve the list of Pokemon caught by this user
    public List<CaughtPokemon> getCaughtPokemons() {
        // Return the list of caught Pokemon associated with this user
        return caughtPokemons;
    // End of the getCaughtPokemons method
    }

    // Setter method to replace the entire caught Pokemon list for this user
    public void setCaughtPokemons(List<CaughtPokemon> caughtPokemons) {
        // Assign the provided list to the caughtPokemons field
        this.caughtPokemons = caughtPokemons;
    // End of the setCaughtPokemons method
    }
// End of the User class
}
