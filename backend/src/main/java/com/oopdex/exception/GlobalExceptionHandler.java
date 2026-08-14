// Package declaration for the exception module of the Oopdex application
package com.oopdex.exception;

// Import DataIntegrityViolationException for handling database constraint violations
import org.springframework.dao.DataIntegrityViolationException;
// Import HttpStatus for setting specific HTTP status codes in error responses
import org.springframework.http.HttpStatus;
// Import ResponseEntity to wrap error response bodies with status codes
import org.springframework.http.ResponseEntity;
// Import HttpMessageNotReadableException for handling malformed or missing request bodies
import org.springframework.http.converter.HttpMessageNotReadableException;
// Import AccessDeniedException for handling authorization failures
import org.springframework.security.access.AccessDeniedException;
// Import AuthenticationException for handling authentication failures
import org.springframework.security.core.AuthenticationException;
// Import FieldError to access individual validation error details for each field
import org.springframework.validation.FieldError;
// Import MethodArgumentNotValidException for handling bean validation errors on request bodies
import org.springframework.web.bind.MethodArgumentNotValidException;
// Import ResponseStatusException to handle exceptions that carry their own HTTP status
import org.springframework.web.server.ResponseStatusException;
// Import ControllerAdvice to apply exception handling globally across all controllers
import org.springframework.web.bind.annotation.ControllerAdvice;
// Import ExceptionHandler to declare methods that handle specific exception types
import org.springframework.web.bind.annotation.ExceptionHandler;

// Import LocalDateTime to timestamp error responses
import java.time.LocalDateTime;
// Import LinkedHashMap to maintain insertion order in the error response body
import java.util.LinkedHashMap;
// Import Map to represent the structured error response body as key-value pairs
import java.util.Map;

// Annotation to designate this class as a global exception handler for all controllers
@ControllerAdvice
// Class definition for GlobalExceptionHandler which intercepts and formats all application exceptions
public class GlobalExceptionHandler {

    // Private helper method to build a standardized error response body map
    private Map<String, Object> errorBody(HttpStatus status, String message) {
        // Create a LinkedHashMap to preserve the order of fields in the JSON response
        Map<String, Object> body = new LinkedHashMap<>();
        // Add the current timestamp to the error body so clients know when the error occurred
        body.put("timestamp", LocalDateTime.now());
        // Add the numeric HTTP status code to the error body
        body.put("status", status.value());
        // Add the human-readable reason phrase of the HTTP status to the error body
        body.put("error", status.getReasonPhrase());
        // Add the descriptive error message to the error body
        body.put("message", message);
        // Return the populated error response map
        return body;
    // End of the errorBody method
    }

    // Annotation to declare this method as the handler for ResponseStatusException
    @ExceptionHandler(ResponseStatusException.class)
    // Method to handle exceptions that carry an HTTP status and optional reason
    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException ex) {
        // Convert the exception's status code to a Spring HttpStatus object
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        // Use the exception's reason if present and non-blank; otherwise use a default message
        String message = ex.getReason() != null && !ex.getReason().isBlank() ? ex.getReason() : "Request failed.";
        // Return a response entity with the error body and the corresponding HTTP status
        return new ResponseEntity<>(errorBody(status, message), status);
    // End of the handleResponseStatusException method
    }

    // Annotation to declare this method as the handler for MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    // Method to handle request body validation failures, returning detailed field-level errors
    public ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        // Build a base error body with a 400 Bad Request status and a generic validation message
        Map<String, Object> body = errorBody(HttpStatus.BAD_REQUEST, "Validation failed.");
        // Create a map to hold each field's validation error message
        Map<String, String> errors = new LinkedHashMap<>();

        // Iterate over each field validation error in the binding result
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            // Add the field name and its corresponding default error message to the errors map
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        // End of the field errors loop
        }

        // Add the map of field-specific errors to the response body under the "errors" key
        body.put("errors", errors);
        // Return a 400 Bad Request response containing the full validation error body
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    // End of the handleMethodArgumentNotValid method
    }

    // Annotation to declare this method as the handler for DuplicateCatchException
    @ExceptionHandler(DuplicateCatchException.class)
    // Method to handle attempts to catch a Pokemon that the user has already caught
    public ResponseEntity<Object> handleDuplicateCatchException(DuplicateCatchException ex) {
        // Return a 409 Conflict response with the exception's message
        return new ResponseEntity<>(errorBody(HttpStatus.CONFLICT, ex.getMessage()), HttpStatus.CONFLICT);
    // End of the handleDuplicateCatchException method
    }

    // Annotation to declare this method as the handler for ResourceNotFoundException
    @ExceptionHandler(CustomExceptions.ResourceNotFoundException.class)
    // Method to handle cases where a requested resource does not exist in the database
    public ResponseEntity<Object> handleResourceNotFoundException(CustomExceptions.ResourceNotFoundException ex) {
        // Return a 404 Not Found response with the exception's descriptive message
        return new ResponseEntity<>(errorBody(HttpStatus.NOT_FOUND, ex.getMessage()), HttpStatus.NOT_FOUND);
    // End of the handleResourceNotFoundException method
    }

    // Annotation to declare this method as the handler for UnauthorizedException
    @ExceptionHandler(CustomExceptions.UnauthorizedException.class)
    // Method to handle cases where a user tries to perform an action they are not allowed to do
    public ResponseEntity<Object> handleUnauthorizedException(CustomExceptions.UnauthorizedException ex) {
        // Return a 403 Forbidden response with the exception's descriptive message
        return new ResponseEntity<>(errorBody(HttpStatus.FORBIDDEN, ex.getMessage()), HttpStatus.FORBIDDEN);
    // End of the handleUnauthorizedException method
    }

    // Annotation to declare this method as the handler for both IllegalStateException and DataIntegrityViolationException
    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class})
    // Method to handle conflict scenarios such as duplicate data or database constraint violations
    public ResponseEntity<Object> handleConflict(Exception ex) {
        // Use the exception message if it is present and not blank; otherwise use a fallback message
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                // Fallback message when the exception has no usable message
                : "Request conflicts with existing data.";
        // Return a 409 Conflict response with the resolved message
        return new ResponseEntity<>(errorBody(HttpStatus.CONFLICT, message), HttpStatus.CONFLICT);
    // End of the handleConflict method
    }

    // Annotation to declare this method as the handler for IllegalArgumentException and HttpMessageNotReadableException
    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class})
    // Method to handle bad request scenarios such as invalid arguments or unreadable request bodies
    public ResponseEntity<Object> handleBadRequest(Exception ex) {
        // Use a generic message for unreadable HTTP messages; otherwise use the exception's own message
        String message = ex instanceof HttpMessageNotReadableException
                ? "Request body is invalid or missing."
                // Use the exception's message for IllegalArgumentException
                : ex.getMessage();
        // Return a 400 Bad Request response with the resolved message
        return new ResponseEntity<>(errorBody(HttpStatus.BAD_REQUEST, message), HttpStatus.BAD_REQUEST);
    // End of the handleBadRequest method
    }

    // Annotation to declare this method as the handler for AuthenticationException
    @ExceptionHandler(AuthenticationException.class)
    // Method to handle authentication failures such as wrong email or password
    public ResponseEntity<Object> handleAuthenticationException(Exception ex) {
        // Return a 401 Unauthorized response with a generic invalid credentials message
        return new ResponseEntity<>(errorBody(HttpStatus.UNAUTHORIZED, "Invalid email or password."), HttpStatus.UNAUTHORIZED);
    // End of the handleAuthenticationException method
    }

    // Annotation to declare this method as the handler for AccessDeniedException
    @ExceptionHandler(AccessDeniedException.class)
    // Method to handle authorization failures where the user lacks the required role or permission
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex) {
        // Return a 403 Forbidden response with a descriptive permission denied message
        return new ResponseEntity<>(errorBody(HttpStatus.FORBIDDEN, "You do not have permission to perform this action."), HttpStatus.FORBIDDEN);
    // End of the handleAccessDeniedException method
    }


    // Logger for recording unexpected errors on the server side
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Annotation to declare this method as the catch-all handler for any unhandled Exception
    @ExceptionHandler(Exception.class)
    // Method to handle any unexpected exceptions that are not caught by more specific handlers
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        // Log the full exception with stack trace securely on the server
        log.error("Unhandled exception caught by GlobalExceptionHandler: ", ex);
        // Build a 500 Internal Server Error response body with a safe, non-leaking error message
        Map<String, Object> body = errorBody(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Please try again later.");
        // Return a 500 Internal Server Error response with the safe error body
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    // End of the handleGeneralException method
    }
// End of the GlobalExceptionHandler class
}
