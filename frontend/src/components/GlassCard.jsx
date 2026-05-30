// Import the React library to use JSX and component features
import React from 'react';

// Define the GlassCard functional component that accepts children, className, and hover props
const GlassCard = ({ children, className = "", hover = true }) => {
  // Return the JSX layout for the component
  return (
    // Render a div element with dynamic classes for glass styling, hover effects, and custom classes
    <div className={`glass-card ${hover ? 'hover:scale-[1.01]' : ''} ${className}`}>
      {
        // Render the child elements passed into this component
        children
      }
    </div>
  );
};

// Export the GlassCard component as the default export of this module
export default GlassCard;
