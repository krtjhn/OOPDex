// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import JsonIgnore annotation to prevent the user field from being serialized in JSON responses
import com.fasterxml.jackson.annotation.JsonIgnore;
// Import the User entity class to represent the owner of this caught Pokemon
import com.oopdex.user.User;
// Import all JPA persistence annotations for entity mapping
import jakarta.persistence.*;
// Import LocalDateTime for storing the date and time the Pokemon was caught
import java.time.LocalDateTime;

// Annotation to mark this class as a JPA entity
@Entity
// Annotation to map this entity to the "collections" database table with a unique constraint on user+pokemon
@Table(name = "collections", uniqueConstraints = {
    // Define a unique constraint to prevent a user from catching the same Pokemon twice
    @UniqueConstraint(columnNames = {"user_id", "pokemon_id"})
// End of the uniqueConstraints array
})
// Class definition for CaughtPokemon, representing a Pokemon that a user has caught and added to their collection
public class CaughtPokemon {

    // Annotation to mark this field as the primary key of the entity
    @Id
    // Annotation to use the database's identity auto-increment strategy for the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Field to store the unique database ID for this caught Pokemon record
    private Long id;

    // Annotation to define a many-to-one relationship with the User entity, fetched lazily
    @ManyToOne(fetch = FetchType.LAZY)
    // Annotation to specify the foreign key column name linking to the users table
    @JoinColumn(name = "user_id", nullable = false)
    // Annotation to exclude the user field from JSON serialization to prevent circular references
    @JsonIgnore
    // Field to store the User who owns this caught Pokemon
    private User user;

    // Annotation to map this field to the "pokemon_id" column in the database, non-nullable
    @Column(name = "pokemon_id", nullable = false)
    // Field to store the Pokedex ID of the caught Pokemon
    private int pokemonId;

    // Field to store the user-assigned nickname for this caught Pokemon (nullable)
    private String nickname;

    // Annotation to map this field to the "date_caught" column, non-nullable
    @Column(name = "date_caught", nullable = false)
    // Field to store the exact date and time this Pokemon was caught, defaulting to the current time
    private LocalDateTime dateCaught = LocalDateTime.now();

    // Default no-argument constructor required by JPA for entity instantiation
    public CaughtPokemon() {}

    // Convenience constructor to create a new CaughtPokemon with owner, Pokemon ID, and nickname
    public CaughtPokemon(User user, int pokemonId, String nickname) {
        // Assign the owner User to the user field
        this.user = user;
        // Assign the Pokedex ID of the caught Pokemon
        this.pokemonId = pokemonId;
        // Assign the user-provided nickname for the Pokemon
        this.nickname = nickname;
        // Record the current date and time as the catch timestamp
        this.dateCaught = LocalDateTime.now();
    // End of the convenience constructor
    }

    // Getter method to retrieve the unique database ID of this caught Pokemon record
    public Long getId() {
        // Return the stored id value
        return id;
    // End of the getId method
    }

    // Setter method to assign a value to the id field
    public void setId(Long id) {
        // Assign the provided id to the field
        this.id = id;
    // End of the setId method
    }

    // Getter method to retrieve the User who owns this caught Pokemon
    public User getUser() {
        // Return the stored User object
        return user;
    // End of the getUser method
    }

    // Setter method to assign the owning User to this caught Pokemon
    public void setUser(User user) {
        // Assign the provided User to the field
        this.user = user;
    // End of the setUser method
    }

    // Getter method to retrieve the Pokedex ID of this caught Pokemon
    public int getPokemonId() {
        // Return the stored Pokemon ID
        return pokemonId;
    // End of the getPokemonId method
    }

    // Setter method to assign a Pokedex ID to this caught Pokemon
    public void setPokemonId(int pokemonId) {
        // Assign the provided Pokemon ID to the field
        this.pokemonId = pokemonId;
    // End of the setPokemonId method
    }

    // Getter method to retrieve the user-assigned nickname of this caught Pokemon
    public String getNickname() {
        // Return the stored nickname string
        return nickname;
    // End of the getNickname method
    }

    // Setter method to assign a nickname to this caught Pokemon
    public void setNickname(String nickname) {
        // Assign the provided nickname to the field
        this.nickname = nickname;
    // End of the setNickname method
    }

    // Getter method to retrieve the date and time this Pokemon was caught
    public LocalDateTime getDateCaught() {
        // Return the stored dateCaught timestamp
        return dateCaught;
    // End of the getDateCaught method
    }

    // Setter method to assign the catch date and time for this caught Pokemon
    public void setDateCaught(LocalDateTime dateCaught) {
        // Assign the provided timestamp to the dateCaught field
        this.dateCaught = dateCaught;
    // End of the setDateCaught method
    }
// End of the CaughtPokemon class
}
