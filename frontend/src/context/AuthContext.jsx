// Import necessary hooks from the React library for state and context management
import { createContext, useState, useContext, useMemo } from 'react';
// Import the configured Axios instance for making API requests
import apiClient from '../api/axios';
// Import jwtDecode to parse JSON Web Tokens
import { jwtDecode } from 'jwt-decode';

// Create a new React Context for authentication, initialized with null
const AuthContext = createContext(null);

// Export the AuthProvider component to wrap parts of the app needing auth data
export const AuthProvider = ({ children }) => {
  // Initialize the user state variable with a lazy initialization function
  const [user, setUser] = useState(() => {
    // Retrieve the stored JWT token from the browser's localStorage
    const storedToken = localStorage.getItem('token');
    // If no token is found, return null to signify an unauthenticated state
    if (!storedToken) return null;
    // Try block to handle potential errors during token decoding
    try {
      // Return the decoded user payload from the JWT token
      return jwtDecode(storedToken);
    // Catch block to handle invalid tokens
    } catch {
      // If decoding fails, return null
      return null;
    // Close try-catch block
    }
  // Close useState initialization
  });
  
  // Initialize the token state variable directly from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Define an asynchronous login function taking email and password
  const login = async (email, password) => {
    // Send a POST request to the login endpoint with the user credentials
    const response = await apiClient.post('/auth/login', { email, password });
    // Extract the token from the response, checking common field names
    const tokenValue = response.data.token || response.data.jwt;
    // If no token is received, throw an error
    if (!tokenValue) throw new Error('Missing token from login response.');
    
    // Store the received token in the browser's localStorage for persistence
    localStorage.setItem('token', tokenValue);
    // Decode the token to get user information
    const decodedUser = jwtDecode(tokenValue);
    // Update the user state with the decoded information
    setUser(decodedUser);
    // Update the token state with the new token
    setToken(tokenValue);
    // Return the decoded user object
    return decodedUser;
  // Close the login function
  };

  // Define an asynchronous register function taking username, email, and password
  const register = async (username, email, password) => {
    // Send a POST request to the registration endpoint with the new user data
    await apiClient.post('/auth/register', { username, email, password });
  // Close the register function
  };

  // Define a synchronous logout function
  const logout = () => {
    // Remove the authentication token from localStorage
    localStorage.removeItem('token');
    // Reset the user state to null
    setUser(null);
    // Reset the token state to null
    setToken(null);
  // Close the logout function
  };

  // Memoize the boolean result indicating if the current user is an admin
  const isAdmin = useMemo(() => {
    // If there is no authenticated user, return false
    if (!user) return false;
    // Extract roles from the user object, normalizing to an array format
    const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
    // Check if the user's roles array includes the admin role
    return roles.includes('ROLE_ADMIN');
  // Re-evaluate only when the user state changes
  }, [user]);

  // Memoize the boolean result indicating if the current user is a standard user
  const isUser = useMemo(() => {
    // If there is no authenticated user, return false
    if (!user) return false;
    // Extract roles from the user object, normalizing to an array format
    const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
    // Check if the user's roles array includes the standard user role
    return roles.includes('ROLE_USER');
  // Re-evaluate only when the user state changes
  }, [user]);

  // Group all authentication-related state and functions into a single value object
  const value = { user, token, login, register, logout, isAdmin, isUser };

  // Render the Provider component, passing the grouped value and rendering children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// Close the AuthProvider component
};

// Export a custom hook as a shorthand to consume the AuthContext
export const useAuth = () => useContext(AuthContext);
