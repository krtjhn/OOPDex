// Package declaration for the auth module of the Oopdex application
package com.oopdex.auth;

// Import the Email validation annotation to enforce a valid email format
import jakarta.validation.constraints.Email;
// Import the NotBlank validation annotation to enforce non-empty fields
import jakarta.validation.constraints.NotBlank;

// Class definition for the AuthRequest data transfer object used in login requests
public class AuthRequest {
    // Validation annotation to ensure the email field is not blank
    @NotBlank(message = "Email is required.")
    // Validation annotation to ensure the email field contains a valid email format
    @Email(message = "Email must be valid.")
    // Field to hold the user's email address sent in the login request
    private String email;

    // Validation annotation to ensure the password field is not blank
    @NotBlank(message = "Password is required.")
    // Field to hold the user's raw password sent in the login request
    private String password;

    // Getter method to retrieve the email field value
    public String getEmail() {
        // Return the stored email value
        return email;
    // End of the getEmail method
    }

    // Setter method to assign a value to the email field
    public void setEmail(String email) {
        // Assign the provided email value to the field
        this.email = email;
    // End of the setEmail method
    }

    // Getter method to retrieve the password field value
    public String getPassword() {
        // Return the stored password value
        return password;
    // End of the getPassword method
    }

    // Setter method to assign a value to the password field
    public void setPassword(String password) {
        // Assign the provided password value to the field
        this.password = password;
    // End of the setPassword method
    }
// End of the AuthRequest class
}
