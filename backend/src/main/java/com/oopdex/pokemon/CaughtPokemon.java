// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import JsonIgnore annotation to prevent the user field from being serialized in JSON responses
import com.fasterxml.jackson.annotation.JsonIgnore;
// Import the User entity class to represent the owner of this caught Pokemon
import com.oopdex.user.User;
// Import all JPA persistence annotations for entity mapping
import jakarta.persistence.*;

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

    // Default no-argument constructor required by JPA for entity instantiation
    public CaughtPokemon() {}

    // Convenience constructor to create a new CaughtPokemon with owner and Pokemon ID
    public CaughtPokemon(User user, int pokemonId) {
        // Assign the owner User to the user field
        this.user = user;
        // Assign the Pokedex ID of the caught Pokemon
        this.pokemonId = pokemonId;
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
// End of the CaughtPokemon class
}
