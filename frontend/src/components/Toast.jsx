// Import React, state hooks, and context APIs to create a toast notification system
import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a React Context object for the toast notifications
const ToastContext = createContext();

// Export a Provider component that wraps the application and provides toast functionality
export const ToastProvider = ({ children }) => {
  // Initialize the toasts state as an empty array
  const [toasts, setToasts] = useState([]);

  // Define a function to add a new toast message, defaulting to a 'success' type
  const showToast = (message, type = 'success') => {
    // Generate a unique string identifier for the new toast
    const id = `${Date.now()}-${Math.random()}`;
    // Append the new toast object to the previous array of toasts
    setToasts((prev) => [...prev, { id, message, type }]);
    // Set a timeout to remove the toast automatically
    setTimeout(() => {
      // Filter out the toast with this specific ID after 3000ms
      setToasts((prev) => prev.filter((t) => t.id !== id));
      // The timeout duration is 3 seconds
    }, 3000);
    // Close the showToast function
  };

  // Return the ToastContext Provider with the showToast function as its value
  return (
    <ToastContext.Provider
      // Wrap the children with the ToastContext.Provider to grant access to showToast
      value={{ showToast }}
    >
      {
        // Render any nested children components
        children
      }
      <div
        // Render a fixed positioned container for the toast notifications
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3"
      >
        {
          // Iterate over the toasts array to render each toast
          toasts.map((toast) => (
            <div
              // Render an individual toast wrapper element
              // Assign a unique React key based on the toast ID
              // Apply conditional styling based on the toast type (error, info, or success)
              // Check if the toast type is error -> red color styling
              // Check if the toast type is info -> blue color styling
              // Default to success styling (green)
              key={toast.id}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-2xl animate-slide-up ${
                toast.type === 'error'
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : toast.type === 'info'
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-green-500/20 border-green-500/30 text-green-400'
              }`}
            >
              <div
                // Render a small pulsating dot acting as an indicator icon
                // Conditionally color the dot based on the toast type
                // Add animation classes for the dot
                className={`w-2 h-2 rounded-full ${
                  toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                } animate-pulse`}
              />
              <span
                // Render the text message of the toast
                className="font-bold text-sm"
              >
                {toast.message}
              </span>
              {
                // Close the individual toast element
              }
            </div>
          ))
          // Close the map function
        }
        {
          // Close the fixed container div
        }
      </div>
      {
        // Close the ToastContext.Provider
      }
    </ToastContext.Provider>
  );
  // Close the ToastProvider component definition
};

// Export a custom hook named useToast to easily access the ToastContext
export const useToast = () => useContext(ToastContext);
