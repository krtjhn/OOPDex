// Package declaration for the config module of the Oopdex application
package com.oopdex.config;

// Import Bean annotation to declare this method's return value as a Spring-managed bean
import org.springframework.context.annotation.Bean;
// Import Configuration annotation to mark this class as a source of bean definitions
import org.springframework.context.annotation.Configuration;
// Import CorsRegistry to register CORS configuration mappings
import org.springframework.web.servlet.config.annotation.CorsRegistry;
// Import WebMvcConfigurer interface to customize Spring MVC configuration
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Annotation to mark this class as a Spring configuration class
@Configuration
// Class definition for the CorsConfig that configures Cross-Origin Resource Sharing (CORS) settings
public class CorsConfig {

    // Annotation to declare corsConfigurer as a Spring-managed bean
    @Bean
    // Method to create and return a WebMvcConfigurer that defines CORS rules for the application
    public WebMvcConfigurer corsConfigurer() {
        // Return an anonymous implementation of WebMvcConfigurer with custom CORS settings
        return new WebMvcConfigurer() {
            // Override annotation to provide custom CORS mapping configuration
            @Override
            // Method to add CORS mappings to the registry, defining allowed origins, methods, and headers
            public void addCorsMappings(CorsRegistry registry) {
                // Register a CORS mapping that applies to all endpoints under the /api/ path
                registry.addMapping("/api/**")
                        // Allow requests from common local development origins on multiple ports
                        .allowedOrigins("http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174",
                                       // Also allow localhost variants for the same ports plus 8082
                                       "http://localhost:3000", "http://localhost:5173", "http://localhost:5174",
                                       // Allow additional localhost origins for port 8082 on both 127.0.0.1 and localhost
                                       "http://localhost:8082", "http://127.0.0.1:8082")
                        // Allow the standard HTTP methods needed by the frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        // Allow all request headers from the permitted origins
                        .allowedHeaders("*");
            // End of the addCorsMappings method
            }
        // End of the anonymous WebMvcConfigurer implementation
        };
    // End of the corsConfigurer method
    }
// End of the CorsConfig class
}