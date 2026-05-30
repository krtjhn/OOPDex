// Import the core React library
import React from 'react';
// Import ReactDOM for rendering the React component tree to the DOM
import ReactDOM from 'react-dom/client';
// Import BrowserRouter to enable client-side routing
import { BrowserRouter } from 'react-router-dom';
// Import the global CSS styles
import './index.css';
// Import the root App component
import App from './App.jsx';
// Import the AuthProvider to handle authentication state
import { AuthProvider } from './context/AuthContext';
// Import the ToastProvider to enable global toast notifications
import { ToastProvider } from './components/Toast';

// Create the React root at the DOM element with ID 'root' and render the component tree
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode
    // Enable StrictMode for highlighting potential problems in an application
  >
    <BrowserRouter
      // Provide routing context to the application
    >
      <AuthProvider
        // Provide authentication state context to the application
      >
        <ToastProvider
          // Provide toast notification context to the application
        >
          <App
            // Render the main App component
          />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);