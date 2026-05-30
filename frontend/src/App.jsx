// Import the useEffect hook from React for side effects
import { useEffect } from 'react';
// Import routing components from react-router-dom to manage app navigation
import { Routes, Route, Navigate } from 'react-router-dom';
// Import the custom useAuth hook to access authentication context
import { useAuth } from './context/AuthContext';
// Import the custom useToast hook to trigger global notifications
import { useToast } from './components/Toast';
// Import the LandingPage component for the root route
import LandingPage from './pages/LandingPage';
// Import the AuthPage component for the login/register route
import AuthPage from './pages/AuthPage';
// Import the Dashboard component for authenticated users
import Dashboard from './pages/Dashboard';
// Import PokeballTransition to apply a screen transition effect
import PokeballTransition from './components/PokeballTransition';
// Import the core design system CSS styles
import './styles/design-system.css';

// Define the main App functional component
function App() {
  // Destructure the user object from the authentication context
  const { user } = useAuth();
  // Destructure the showToast function from the toast context
  const { showToast } = useToast();

  // Use the useEffect hook to listen for custom API error events
  useEffect(() => {
    // Define the event handler for API errors
    const handleApiError = (event) => {
      // Extract the error message and status from the custom event detail
      const { message, status } = event.detail;
      // Ignore 409 Conflict errors silently
      if (status === 409) return;
      // Show a toast notification with the error message or a default string
      showToast(message || "A wild error appeared!", "error");
    // Close the handleApiError function
    };

    // Add an event listener to the window object for 'api-error' events
    window.addEventListener('api-error', handleApiError);
    // Return a cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener('api-error', handleApiError);
  // Provide showToast in the dependency array
  }, [showToast]);

  // Return the application routing structure
  return (
    <PokeballTransition>
      <Routes
        // Define the top-level route configuration
      >
        <Route
          // Render the root path, redirecting to dashboard if user exists, else LandingPage
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
        />
        <Route
          // Render the auth path, redirecting to dashboard if user exists, else AuthPage
          path="/auth"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
        />
        <Route
          // Render the dashboard path, rendering Dashboard if user exists, else redirect to AuthPage
          path="/dashboard/*"
          element={user ? <Dashboard /> : <Navigate to="/auth" />}
        />
      </Routes>
    </PokeballTransition>
  );
}

// Export the App component as the default module export
export default App;
