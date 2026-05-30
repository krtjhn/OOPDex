// Package declaration for the pokemon module of the Oopdex application
package com.oopdex.pokemon;

// Import all JPA persistence annotations for entity mapping
import jakarta.persistence.*;
// Import DecimalMin validation annotation for minimum decimal value enforcement
import jakarta.validation.constraints.DecimalMin;
// Import Max validation annotation for maximum integer value enforcement
import jakarta.validation.constraints.Max;
// Import Min validation annotation for minimum integer value enforcement
import jakarta.validation.constraints.Min;
// Import NotBlank validation annotation to require non-empty string fields
import jakarta.validation.constraints.NotBlank;
// Import NotNull validation annotation to require non-null fields
import jakarta.validation.constraints.NotNull;
// Import Positive validation annotation to require positive integer values
import jakarta.validation.constraints.Positive;
// Import Size validation annotation to enforce string length limits
import jakarta.validation.constraints.Size;

// Import BigDecimal for precise representation of height and weight values
import java.math.BigDecimal;

// Annotation to mark this class as a JPA entity mapped to a database table
@Entity
// Annotation to specify the database table name for Pokemon records
@Table(name = "pokemons")
// Class definition for the Pokemon entity representing a single Pokemon in the Pokedex
public class Pokemon {

    // Annotation to mark this field as the primary key of the entity
    @Id
    // Validation annotation to ensure the Pokedex number is not null
    @NotNull(message = "Pokedex number is required.")
    // Validation annotation to ensure the Pokedex number is a positive integer
    @Positive(message = "Pokedex number must be positive.")
    // Field to store the Pokedex number which serves as the primary key
    private Integer id;

    // Validation annotation to ensure the Pokemon name is not blank
    @NotBlank(message = "Pokemon name is required.")
    // Validation annotation to limit the Pokemon name length to 80 characters
    @Size(max = 80, message = "Pokemon name must be 80 characters or fewer.")
    // Field to store the official name of the Pokemon
    private String name;

    // Validation annotation to ensure height is greater than 0.0
    @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0.")
    // Field to store the height of the Pokemon in meters as a precise decimal
    private BigDecimal height;

    // Validation annotation to ensure weight is greater than 0.0
    @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0.")
    // Field to store the weight of the Pokemon in kilograms as a precise decimal
    private BigDecimal weight;

    // Validation annotation to ensure at least one type is provided
    @NotBlank(message = "At least one type is required.")
    // Validation annotation to limit the types string length to 100 characters
    @Size(max = 100, message = "Types must be 100 characters or fewer.")
    // Field to store the Pokemon's type(s) as a comma-separated string (e.g., "Fire,Flying")
    private String types;

    // Validation annotation to limit the abilities string length to 255 characters
    @Size(max = 255, message = "Abilities must be 255 characters or fewer.")
    // Field to store the Pokemon's abilities as a comma-separated string
    private String abilities;

    // Validation annotation to limit the weaknesses string length to 255 characters
    @Size(max = 255, message = "Weaknesses must be 255 characters or fewer.")
    // Field to store the Pokemon's type weaknesses as a comma-separated string
    private String weaknesses;

    // Validation annotation to ensure HP is at least 1
    @Min(value = 1, message = "HP must be at least 1.")
    // Validation annotation to ensure HP does not exceed 255
    @Max(value = 255, message = "HP must be 255 or lower.")
    // Field to store the base HP stat of the Pokemon
    private int hp;

    // Validation annotation to ensure Attack is at least 1
    @Min(value = 1, message = "Attack must be at least 1.")
    // Validation annotation to ensure Attack does not exceed 255
    @Max(value = 255, message = "Attack must be 255 or lower.")
    // Field to store the base Attack stat of the Pokemon
    private int attack;

    // Validation annotation to ensure Defense is at least 1
    @Min(value = 1, message = "Defense must be at least 1.")
    // Validation annotation to ensure Defense does not exceed 255
    @Max(value = 255, message = "Defense must be 255 or lower.")
    // Field to store the base Defense stat of the Pokemon
    private int defense;

    // Annotation to map this field to the "special_attack" column in the database
    @Column(name = "special_attack")
    // Validation annotation to ensure Special Attack is at least 1
    @Min(value = 1, message = "Special attack must be at least 1.")
    // Validation annotation to ensure Special Attack does not exceed 255
    @Max(value = 255, message = "Special attack must be 255 or lower.")
    // Field to store the base Special Attack stat of the Pokemon
    private int specialAttack;

    // Annotation to map this field to the "special_defense" column in the database
    @Column(name = "special_defense")
    // Validation annotation to ensure Special Defense is at least 1
    @Min(value = 1, message = "Special defense must be at least 1.")
    // Validation annotation to ensure Special Defense does not exceed 255
    @Max(value = 255, message = "Special defense must be 255 or lower.")
    // Field to store the base Special Defense stat of the Pokemon
    private int specialDefense;

    // Validation annotation to ensure Speed is at least 1
    @Min(value = 1, message = "Speed must be at least 1.")
    // Validation annotation to ensure Speed does not exceed 255
    @Max(value = 255, message = "Speed must be 255 or lower.")
    // Field to store the base Speed stat of the Pokemon
    private int speed;

    // Annotation to map this field to the "is_deleted" column with a non-null constraint
    @Column(name = "is_deleted", nullable = false)
    // Field to track whether this Pokemon record has been soft-deleted; defaults to false
    private boolean isDeleted = false;

    // Getter method to check whether this Pokemon record is soft-deleted
    public boolean isDeleted() {
        // Return the current soft-delete flag value
        return isDeleted;
    // End of the isDeleted method
    }

    // Setter method to set the soft-delete flag on this Pokemon record
    public void setDeleted(boolean deleted) {
        // Assign the provided deleted flag to the isDeleted field
        isDeleted = deleted;
    // End of the setDeleted method
    }

    // Getter method to retrieve the Pokemon's Pokedex ID
    public Integer getId() {
        // Return the stored id value
        return id;
    // End of the getId method
    }

    // Setter method to assign the Pokedex ID to this Pokemon
    public void setId(Integer id) {
        // Assign the provided id to the field
        this.id = id;
    // End of the setId method
    }

    // Getter method to retrieve the Pokedex number, returning 0 if the id is null
    public int getPokedexNumber() {
        // Return 0 as a safe default if the id is null, otherwise return the id value
        return id == null ? 0 : id;
    // End of the getPokedexNumber method
    }

    // Setter method to set the Pokedex number by assigning it to the id field
    public void setPokedexNumber(int pokedexNumber) {
        // Assign the provided Pokedex number to the id field
        this.id = pokedexNumber;
    // End of the setPokedexNumber method
    }

    // Getter method to retrieve the Pokemon's name
    public String getName() {
        // Return the stored name value
        return name;
    // End of the getName method
    }

    // Setter method to assign a name to this Pokemon
    public void setName(String name) {
        // Assign the provided name string to the field
        this.name = name;
    // End of the setName method
    }

    // Getter method to retrieve the Pokemon's height
    public BigDecimal getHeight() {
        // Return the stored height value
        return height;
    // End of the getHeight method
    }

    // Setter method to assign a height value to this Pokemon
    public void setHeight(BigDecimal height) {
        // Assign the provided height to the field
        this.height = height;
    // End of the setHeight method
    }

    // Getter method to retrieve the Pokemon's weight
    public BigDecimal getWeight() {
        // Return the stored weight value
        return weight;
    // End of the getWeight method
    }

    // Setter method to assign a weight value to this Pokemon
    public void setWeight(BigDecimal weight) {
        // Assign the provided weight to the field
        this.weight = weight;
    // End of the setWeight method
    }

    // Getter method to retrieve the Pokemon's types as a comma-separated string
    public String getTypes() {
        // Return the stored types string
        return types;
    // End of the getTypes method
    }

    // Setter method to assign type(s) to this Pokemon
    public void setTypes(String types) {
        // Assign the provided types string to the field
        this.types = types;
    // End of the setTypes method
    }

    // Getter method to retrieve the Pokemon's abilities as a comma-separated string
    public String getAbilities() {
        // Return the stored abilities string
        return abilities;
    // End of the getAbilities method
    }

    // Setter method to assign abilities to this Pokemon
    public void setAbilities(String abilities) {
        // Assign the provided abilities string to the field
        this.abilities = abilities;
    // End of the setAbilities method
    }

    // Getter method to retrieve the Pokemon's type weaknesses as a comma-separated string
    public String getWeaknesses() {
        // Return the stored weaknesses string
        return weaknesses;
    // End of the getWeaknesses method
    }

    // Setter method to assign type weaknesses to this Pokemon
    public void setWeaknesses(String weaknesses) {
        // Assign the provided weaknesses string to the field
        this.weaknesses = weaknesses;
    // End of the setWeaknesses method
    }

    // Getter method to retrieve the base HP stat
    public int getHp() {
        // Return the stored hp value
        return hp;
    // End of the getHp method
    }

    // Setter method to assign the base HP stat
    public void setHp(int hp) {
        // Assign the provided hp value to the field
        this.hp = hp;
    // End of the setHp method
    }

    // Getter method to retrieve the base Attack stat
    public int getAttack() {
        // Return the stored attack value
        return attack;
    // End of the getAttack method
    }

    // Setter method to assign the base Attack stat
    public void setAttack(int attack) {
        // Assign the provided attack value to the field
        this.attack = attack;
    // End of the setAttack method
    }

    // Getter method to retrieve the base Defense stat
    public int getDefense() {
        // Return the stored defense value
        return defense;
    // End of the getDefense method
    }

    // Setter method to assign the base Defense stat
    public void setDefense(int defense) {
        // Assign the provided defense value to the field
        this.defense = defense;
    // End of the setDefense method
    }

    // Getter method to retrieve the base Special Attack stat
    public int getSpecialAttack() {
        // Return the stored specialAttack value
        return specialAttack;
    // End of the getSpecialAttack method
    }

    // Setter method to assign the base Special Attack stat
    public void setSpecialAttack(int specialAttack) {
        // Assign the provided specialAttack value to the field
        this.specialAttack = specialAttack;
    // End of the setSpecialAttack method
    }

    // Getter method to retrieve the base Special Defense stat
    public int getSpecialDefense() {
        // Return the stored specialDefense value
        return specialDefense;
    // End of the getSpecialDefense method
    }

    // Setter method to assign the base Special Defense stat
    public void setSpecialDefense(int specialDefense) {
        // Assign the provided specialDefense value to the field
        this.specialDefense = specialDefense;
    // End of the setSpecialDefense method
    }

    // Getter method to retrieve the base Speed stat
    public int getSpeed() {
        // Return the stored speed value
        return speed;
    // End of the getSpeed method
    }

    // Setter method to assign the base Speed stat
    public void setSpeed(int speed) {
        // Assign the provided speed value to the field
        this.speed = speed;
    // End of the setSpeed method
    }

    // Annotation to mark this method as transient (not persisted to the database)
    @Transient
    // Computed getter to extract and return the first type from the comma-separated types string
    public String getType1() {
        // Return null if the types field is null or blank
        if (types == null || types.isBlank()) {
            // No types available, so return null
            return null;
        // End of the null/blank check
        }
        // Split the types string by comma to get individual type values
        String[] split = types.split(",");
        // Return the first type if it exists after trimming whitespace, otherwise return null
        return split.length > 0 ? split[0].trim() : null;
    // End of the getType1 method
    }

    // Annotation to mark this method as transient (not persisted to the database)
    @Transient
    // Computed getter to extract and return the second type from the comma-separated types string
    public String getType2() {
        // Return null if the types field is null or blank
        if (types == null || types.isBlank()) {
            // No types available, so return null
            return null;
        // End of the null/blank check
        }
        // Split the types string by comma to get individual type values
        String[] split = types.split(",");
        // Return the second type if it exists after trimming whitespace, otherwise return null
        return split.length > 1 ? split[1].trim() : null;
    // End of the getType2 method
    }

    // Annotation to mark this method as transient (not persisted to the database)
    @Transient
    // Computed getter to return the URL path to the Pokemon's 3D sprite image
    public String getSpriteUrl() {
        // Return null if there is no id set
        if (id == null) {
            // Cannot construct a URL without the Pokemon's ID
            return null;
        // End of the null id check
        }
        // Build and return the sprite URL using the Pokemon's Pokedex ID
        return "/assets/pokemon-3d/" + id + ".png";
    // End of the getSpriteUrl method
    }

    // Annotation to mark this method as transient (not persisted to the database)
    @Transient
    // Computed getter to return the URL path to the Pokemon's animated GIF
    public String getGifUrl() {
        // Return null if there is no id set
        if (id == null) {
            // Cannot construct a URL without the Pokemon's ID
            return null;
        // End of the null id check
        }
        // Build and return the GIF URL using the Pokemon's Pokedex ID
        return "/assets/pokemon-gifs/" + id + ".gif";
    // End of the getGifUrl method
    }
// End of the Pokemon class
}
