// Package declaration for the exception module of the Oopdex application
package com.oopdex.exception;

// Import HttpStatus to associate this exception with the HTTP 409 Conflict status code
import org.springframework.http.HttpStatus;
// Import ResponseStatus annotation to automatically map this exception to an HTTP response code
import org.springframework.web.bind.annotation.ResponseStatus;

// Annotation to map this exception to HTTP 409 Conflict when thrown from a controller
@ResponseStatus(HttpStatus.CONFLICT)
// Class definition for the DuplicateCatchException, thrown when a user tries to catch a Pokemon they already have
public class DuplicateCatchException extends RuntimeException {
    // Constructor that accepts a descriptive message explaining the duplicate catch attempt
    public DuplicateCatchException(String message) {
        // Pass the message to the parent RuntimeException class
        super(message);
    // End of the DuplicateCatchException constructor
    }
// End of the DuplicateCatchException class
}
