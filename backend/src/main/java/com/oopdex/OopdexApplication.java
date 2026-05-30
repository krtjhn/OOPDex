// Package declaration for the Oopdex application
package com.oopdex;

// Import statement for SpringApplication class from Spring Boot
import org.springframework.boot.SpringApplication;
// Import statement for SpringBootApplication annotation from Spring Boot
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Annotation to mark this class as the primary Spring Boot application class
@SpringBootApplication
// Main class for the Oopdex application
public class OopdexApplication {

	// Main method which serves as the entry point for the Java application
	public static void main(String[] args) {
		// Runs the Spring Boot application, initializing the Spring context and embedded server
		SpringApplication.run(OopdexApplication.class, args);
	// End of the main method
	}

// End of the OopdexApplication class
}