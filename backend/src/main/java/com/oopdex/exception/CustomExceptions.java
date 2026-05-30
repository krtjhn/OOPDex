// Package declaration for the exception module of the Oopdex application
package com.oopdex.exception;

// Class definition that groups custom application-specific exception types together
public class CustomExceptions {

    // Static inner class representing a "Resource Not Found" exception (HTTP 404 scenario)
    public static class ResourceNotFoundException extends RuntimeException {
        // Constructor that accepts a descriptive message about which resource was not found
        public ResourceNotFoundException(String message) {
            // Pass the message to the parent RuntimeException class
            super(message);
        // End of the ResourceNotFoundException constructor
        }
    // End of the ResourceNotFoundException class
    }

    // Static inner class representing an "Unauthorized" exception (HTTP 403 scenario)
    public static class UnauthorizedException extends RuntimeException {
        // Constructor that accepts a descriptive message about the unauthorized action
        public UnauthorizedException(String message) {
            // Pass the message to the parent RuntimeException class
            super(message);
        // End of the UnauthorizedException constructor
        }
    // End of the UnauthorizedException class
    }
// End of the CustomExceptions class
}