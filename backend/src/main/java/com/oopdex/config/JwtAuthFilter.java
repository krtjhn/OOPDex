// Package declaration for the config module of the Oopdex application
package com.oopdex.config;

// Import JwtUtil to parse and validate JWT tokens from incoming requests
import com.oopdex.auth.JwtUtil;
// Import FilterChain to allow the request to proceed through the filter chain
import jakarta.servlet.FilterChain;
// Import ServletException for checked exceptions from servlet filter operations
import jakarta.servlet.ServletException;
// Import HttpServletRequest to read incoming HTTP request data including headers
import jakarta.servlet.http.HttpServletRequest;
// Import HttpServletResponse to write outgoing HTTP response data
import jakarta.servlet.http.HttpServletResponse;
// Import UsernamePasswordAuthenticationToken to represent an authenticated user in the security context
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// Import SecurityContextHolder to store and retrieve the current security context
import org.springframework.security.core.context.SecurityContextHolder;
// Import UserDetails interface representing the authenticated user's details
import org.springframework.security.core.userdetails.UserDetails;
// Import UserDetailsService to load user details from the database by username
import org.springframework.security.core.userdetails.UserDetailsService;
// Import WebAuthenticationDetailsSource to build request-specific authentication details
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// Import Component annotation to register this class as a Spring-managed bean
import org.springframework.stereotype.Component;
// Import OncePerRequestFilter to ensure this filter executes exactly once per HTTP request
import org.springframework.web.filter.OncePerRequestFilter;

// Import IOException for handling input/output exceptions in the filter
import java.io.IOException;

// Annotation to register this class as a Spring component
@Component
// Class definition for JwtAuthFilter, a filter that intercepts requests and validates JWT tokens
public class JwtAuthFilter extends OncePerRequestFilter {

    // Field for the JWT utility used to extract and validate JWT tokens
    private final JwtUtil jwtUtil;
    // Field for the UserDetailsService used to load user details from the database
    private final UserDetailsService userDetailsService;

    // Constructor to inject the JwtUtil and UserDetailsService dependencies
    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        // Assign the injected JwtUtil to the local field
        this.jwtUtil = jwtUtil;
        // Assign the injected UserDetailsService to the local field
        this.userDetailsService = userDetailsService;
    // End of the constructor
    }

    // Override annotation indicating this method implements the abstract doFilterInternal method
    @Override
    // Method executed for every HTTP request; performs JWT extraction and authentication
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Check if the request path is for the auth endpoints, which do not require a token
        if (request.getServletPath().contains("/api/auth")) {
            // Pass the request and response to the next filter without JWT validation
            filterChain.doFilter(request, response);
            // Return early to skip the JWT processing logic below
            return;
        // End of the auth endpoint bypass check
        }

        // Extract the Authorization header from the incoming HTTP request
        final String authHeader = request.getHeader("Authorization");
        // Declare a variable to hold the extracted user email from the JWT
        final String userEmail;
        // Declare a variable to hold the extracted JWT token string
        final String jwtToken;

        // Check if the Authorization header is missing or does not start with the Bearer prefix
        if (authHeader == null || !authHeader.startsWith("Bearer")) {
            // Pass the request through without authentication if no valid Bearer token is present
            filterChain.doFilter(request, response);
            // Return early since there is no token to process
            return;
        // End of the missing/invalid Authorization header check
        }

        // Extract the JWT token by removing the "Bearer " prefix (7 characters)
        jwtToken = authHeader.substring(7);
        // Extract the user's email (username) from the JWT token payload
        userEmail = jwtUtil.extractUsername(jwtToken);

        // Proceed with authentication only if the email was extracted and no authentication is already set
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load the full UserDetails object from the database using the extracted email
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            // Validate the token against the loaded user details to ensure it is authentic and not expired
            if (jwtUtil.isTokenValid(jwtToken, userDetails)) {
                // Create a new authentication token with the user's details and authorities
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        // Provide the UserDetails as the principal
                        userDetails, null, userDetails.getAuthorities());
                // Attach additional request-specific details to the authentication token
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Store the authentication token in the Security Context for the current request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            // End of the token validity check
            }
        // End of the userEmail/SecurityContext null check
        }
        // Pass the request and response along to the next filter in the chain
        filterChain.doFilter(request, response);
    // End of the doFilterInternal method
    }
// End of the JwtAuthFilter class
}