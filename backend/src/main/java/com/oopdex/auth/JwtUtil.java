// Package declaration for the auth module of the Oopdex application
package com.oopdex.auth;

// Import Claims class from the JJWT library to represent the payload of a JWT
import io.jsonwebtoken.Claims;
// Import Jwts builder/parser factory from the JJWT library
import io.jsonwebtoken.Jwts;
// Import the deprecated SignatureAlgorithm enum for specifying HMAC-SHA signing algorithm
import io.jsonwebtoken.SignatureAlgorithm;
// Import the Keys utility class for creating cryptographic keys
import io.jsonwebtoken.security.Keys;
// Import Value annotation to inject properties from application configuration
import org.springframework.beans.factory.annotation.Value;
// Import UserDetails interface from Spring Security representing an authenticated user
import org.springframework.security.core.userdetails.UserDetails;
// Import Component annotation to register this class as a Spring-managed bean
import org.springframework.stereotype.Component;
// Import the User entity class from the user module
import com.oopdex.user.User;

// Import SecretKey interface for representing a cryptographic secret key
import javax.crypto.SecretKey;
// Import Date class for working with token issuance and expiration timestamps
import java.util.Date;
// Import HashMap for creating a mutable map of JWT claims
import java.util.HashMap;
// Import List for holding role information in JWT claims
import java.util.List;
// Import Map interface for defining JWT claims as key-value pairs
import java.util.Map;
// Import Function interface for using method references when extracting claims
import java.util.function.Function;

// Annotation to register this class as a Spring component, making it injectable
@Component
// Class definition for the JwtUtil utility class that handles JWT creation and validation
public class JwtUtil {

    // Inject the JWT secret key from the application properties file
    @Value("${jwt.secret}")
    // Field to store the secret key string used to sign JWTs
    private String secret;

    // Inject the JWT expiration duration from the application properties file
    @Value("${jwt.expiration}")
    // Field to store the token expiration duration in milliseconds
    private long expiration;

    // Private helper method to build a SecretKey from the configured secret string
    private SecretKey getSigningKey() {
        // Convert the secret string to bytes and create an HMAC-SHA key from it
        return Keys.hmacShaKeyFor(secret.getBytes());
    // End of the getSigningKey method
    }

    // Public method to extract the username (email) from a JWT token string
    public String extractUsername(String token) {
        // Use the extractClaim method with a reference to the getSubject method to get the username
        return extractClaim(token, Claims::getSubject);
    // End of the extractUsername method
    }

    // Public method to extract the expiration date from a JWT token string
    public Date extractExpiration(String token) {
        // Use the extractClaim method with a reference to the getExpiration method
        return extractClaim(token, Claims::getExpiration);
    // End of the extractExpiration method
    }

    // Generic public method to extract any single claim from a JWT token using a resolver function
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        // Parse all claims from the given token
        final Claims claims = extractAllClaims(token);
        // Apply the provided resolver function to the claims and return the result
        return claimsResolver.apply(claims);
    // End of the extractClaim method
    }

    // Private method to parse and return all claims from a JWT token string
    private Claims extractAllClaims(String token) {
        // Build a parser with the signing key, parse the JWT, and return its body (claims)
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    // End of the extractAllClaims method
    }

    // Private method to check whether a JWT token has expired
    private Boolean isTokenExpired(String token) {
        // Compare the token's expiration date with the current date; return true if expired
        return extractExpiration(token).before(new Date());
    // End of the isTokenExpired method
    }

    // Overloaded public method to generate a JWT token from a UserDetails object
    public String generateToken(UserDetails userDetails) {
        // Initialize an empty claims map since no extra data is needed for UserDetails
        Map<String, Object> claims = new HashMap<>();
        // Delegate to createToken with empty claims and the user's username as the subject
        return createToken(claims, userDetails.getUsername());
    // End of the generateToken(UserDetails) method
    }

    // Overloaded public method to generate a JWT token from a full User entity
    public String generateToken(User user) {
        // Initialize an empty claims map to hold custom JWT claims
        Map<String, Object> claims = new HashMap<>();
        // Get the user's role, defaulting to ROLE_USER if the role is null
        User.Role role = user.getRole() != null ? user.getRole() : User.Role.ROLE_USER;
        // Add the user's role as a list under the "roles" claim key
        claims.put("roles", List.of(role.name()));
        // Add the user's username as a custom "username" claim
        claims.put("username", user.getUsername());
        // Delegate to createToken using the user's email as the JWT subject
        return createToken(claims, user.getEmail());
    // End of the generateToken(User) method
    }

    // Private method that builds and signs the actual JWT token string
    private String createToken(Map<String, Object> claims, String subject) {
        // Build the JWT with claims, subject, issue time, expiration time, and HMAC-SHA256 signature
        return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
                // Set the expiration time to the current time plus the configured expiration duration
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                // Sign the JWT with the secret key using the HS256 algorithm and compact it to a string
                .signWith(getSigningKey(), SignatureAlgorithm.HS256).compact();
    // End of the createToken method
    }

    // Public method to validate a JWT token against a given UserDetails object
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        // Extract the username (email) from the token
        final String username = extractUsername(token);
        // Return true only if the token's username matches the UserDetails username and the token is not expired
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    // End of the isTokenValid method
    }
// End of the JwtUtil class
}