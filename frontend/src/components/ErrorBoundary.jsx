// Import React library to create the class component
import React from 'react';

// Define the ErrorBoundary class component extending React.Component
class ErrorBoundary extends React.Component {
  // Define the constructor to initialize component state
  constructor(props) {
    // Call the parent class constructor with props
    super(props);
    // Initialize the component's state
    this.state = {
      // Boolean flag indicating if an error has occurred
      hasError: false,
      // Property to store the caught error object
      error: null,
      // Property to store additional error information
      errorInfo: null
    // Close the state object
    };
  // Close the constructor
  }

  // Static lifecycle method called when a child component throws an error
  static getDerivedStateFromError(error) {
    // Update state to indicate an error was caught
    return { hasError: true };
  // Close getDerivedStateFromError
  }

  // Lifecycle method called after an error is caught
  componentDidCatch(error, errorInfo) {
    // Update the state with the actual error and info
    this.setState({
      // Set the error object
      error: error,
      // Set the detailed error information
      errorInfo: errorInfo
    // Close setState
    });
  // Close componentDidCatch
  }

  // Define an arrow function to handle resetting the error state
  handleReset = () => {
    // Reset all error-related state properties to their default values
    this.setState({
      // Reset hasError to false
      hasError: false,
      // Reset error to null
      error: null,
      // Reset errorInfo to null
      errorInfo: null
    // Close setState
    });
    // Reload the current page to ensure a fresh state
    window.location.reload();
  // Close handleReset
  };

  // Define the render method for the component
  render() {
    // Check if an error has occurred
    if (this.state.hasError) {
      // Return the error UI fallback
      return (
        // Render a full-height centered container with a gradient background
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-8">
          <div
            className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center border-l-4 border-red-500" // Render the error card with maximum width, white background, and red border
          >
            <div
              className="text-4xl mb-4" // Display a warning emoji icon
            >
              ⚠️
            </div>
            <h2
              className="text-2xl font-bold text-gray-800 mb-4" // Display the main error heading
            >
              Oops! Something went wrong
            </h2>
            <p
              className="text-gray-600 mb-6" // Display a user-friendly error message
            >
              The dashboard encountered an unexpected error. Please try again.
            </p>
            {
              // Conditionally render error details if in development mode and an error exists
              process.env.NODE_ENV === 'development' && this.state.error && (
                <details
                  className="text-left bg-gray-50 p-3 rounded mb-6 text-xs text-gray-600 overflow-auto max-h-40" // Render an expandable details element for the technical error info
                >
                  <summary
                    className="cursor-pointer font-semibold mb-2" // Render the summary text for the details element
                  >
                    Error Details
                  </summary>
                  <pre
                    className="whitespace-pre-wrap break-words" // Display the error string inside a preformatted text block
                  >
                    {this.state.error.toString()}
                  </pre>
                </details>
              )
            }
            <button
              onClick={this.handleReset} // Attach the handleReset method to the click event
              className="w-full bg-gradient-to-r from-[#e3350d] to-[#c72a0a] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105" // Apply styling for the retry button including gradients and hover effects
            >
              Try Again
            </button>
          </div>
        </div>
      );
    // Close the if block
    }

    // If no error, render the normal children components
    return this.props.children;
  // Close the render method
  }
// Close the ErrorBoundary class
}

// Export ErrorBoundary as the default export
export default ErrorBoundary;
