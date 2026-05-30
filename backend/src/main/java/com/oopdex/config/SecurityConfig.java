// Package declaration for the config module of the Oopdex application
package com.oopdex.config;

// Import Bean annotation to declare Spring-managed beans from factory methods
import org.springframework.context.annotation.Bean;
// Import Configuration annotation to declare this class as a Spring configuration source
import org.springframework.context.annotation.Configuration;
// Import AuthenticationManager interface for managing authentication processes
import org.springframework.security.authentication.AuthenticationManager;
// Import AuthenticationConfiguration to retrieve the default AuthenticationManager from Spring
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// Import EnableMethodSecurity annotation to enable annotation-based method-level security
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// Import HttpSecurity to configure web-based security for HTTP requests
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// Import EnableWebSecurity annotation to activate Spring Security's web security support
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// Import SessionCreationPolicy to specify how sessions are managed (stateless for JWT)
import org.springframework.security.config.http.SessionCreationPolicy;
// Import BCryptPasswordEncoder for hashing passwords using the BCrypt algorithm
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// Import PasswordEncoder interface to abstract password encoding
import org.springframework.security.crypto.password.PasswordEncoder;
// Import SecurityFilterChain to define the security filter pipeline
import org.springframework.security.web.SecurityFilterChain;
// Import UsernamePasswordAuthenticationFilter to specify where to insert our JWT filter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Annotation to declare this class as a Spring configuration class
@Configuration
// Annotation to enable Spring Security's web security features
@EnableWebSecurity
// Annotation to enable method-level security annotations like @PreAuthorize
@EnableMethodSecurity
// Class definition for SecurityConfig which sets up all security-related beans and rules
public class SecurityConfig {

    // Field for the custom JWT authentication filter injected as a dependency
    private final JwtAuthFilter jwtAuthFilter;

    // Constructor to inject the JwtAuthFilter dependency
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        // Assign the injected filter to the local field
        this.jwtAuthFilter = jwtAuthFilter;
    // End of the constructor
    }

    // Annotation to declare this method's return value as a Spring bean
    @Bean
    // Method to provide a BCrypt password encoder bean for hashing and matching passwords
    public PasswordEncoder passwordEncoder() {
        // Create and return a new BCryptPasswordEncoder instance
        return new BCryptPasswordEncoder();
    // End of the passwordEncoder method
    }

    // Annotation to declare this method's return value as a Spring bean
    @Bean
    // Method to expose the default AuthenticationManager as a Spring bean for use in the auth controller
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        // Retrieve and return the AuthenticationManager from Spring's configuration
        return authenticationConfiguration.getAuthenticationManager();
    // End of the authenticationManager method
    }

    // Annotation to declare this method's return value as a Spring bean
    @Bean
    // Method to configure and return the main SecurityFilterChain defining all HTTP security rules
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Begin configuring the HttpSecurity object
        http
                // Apply the default CORS configuration (uses the CorsConfig bean defined separately)
                .cors(org.springframework.security.config.Customizer.withDefaults())
                // Disable CSRF protection since we use stateless JWT authentication, not sessions
                .csrf(csrf -> csrf.disable())
                // Configure session management to STATELESS so no HTTP session is created or used
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configure authorization rules for incoming HTTP requests
                .authorizeHttpRequests(auth -> auth
                        // Permit all requests to the authentication endpoints without requiring a token
                        .requestMatchers("/api/auth/**").permitAll()
                        // Permit public access to the Pokemon filter and search endpoints
                        .requestMatchers("/api/pokemon/filter", "/api/pokemon/search").permitAll()
                        // Permit public access to individual Pokemon lookup endpoints by numeric ID
                        .requestMatchers("/api/pokemon/{id:[0-9]+}").permitAll()
                        // Permit public access to the base Pokemon listing endpoint
                        .requestMatchers("/api/pokemon").permitAll()
                        // Restrict admin API endpoints to users with the ADMIN role only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Require authentication for all other requests not matched above
                        .anyRequest().authenticated()
                )
                // Insert the custom JWT authentication filter before the default username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Build and return the configured SecurityFilterChain
        return http.build();
    // End of the securityFilterChain method
    }
// End of the SecurityConfig class
}
