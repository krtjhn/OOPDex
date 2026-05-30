// Package declaration for the auth module of the Oopdex application
package com.oopdex.auth;

// Class definition for the AuthResponse data transfer object returned after a successful login
public class AuthResponse {
    // Field to hold the JWT token string returned to the client
    private final String token;
    // Field to hold a duplicate reference to the JWT token (aliased as 'jwt' for convenience)
    private final String jwt;

    // Constructor that accepts the JWT token string and assigns it to both fields
    public AuthResponse(String token) {
        // Assign the provided token to the 'token' field
        this.token = token;
        // Assign the same token value to the 'jwt' field as an alias
        this.jwt = token;
    // End of the AuthResponse constructor
    }

    // Getter method to retrieve the token field value
    public String getToken() {
        // Return the stored JWT token value
        return token;
    // End of the getToken method
    }

    // Getter method to retrieve the jwt field value
    public String getJwt() {
        // Return the stored JWT value (same as token)
        return jwt;
    // End of the getJwt method
    }
// End of the AuthResponse class
}