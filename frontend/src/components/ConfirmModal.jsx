// Import the React library for component definition
import React from 'react';
// Import the GlassCard component for styling the modal container
import GlassCard from './GlassCard';

// Define the ConfirmModal component accepting various props for customization
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    // If the modal is not open, return null to render nothing
    if (!isOpen) return null;

    // Define Tailwind CSS classes for different modal types
    const typeClasses = {
        // Danger type classes (red styling)
        danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
        // Primary type classes (blue styling)
        primary: "bg-primary-blue hover:bg-blue-600 shadow-blue-500/20",
        // Success type classes (green styling)
        success: "bg-green-500 hover:bg-green-600 shadow-green-500/20"
    // Close the typeClasses object
    };

    // Return the JSX layout for the ConfirmModal
    return (
        // Render the overlay background for the modal
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <GlassCard
                className="w-full max-w-md p-8 border-white/10" // Render the GlassCard container for the modal content
            >
                <h3
                    className="text-2xl font-bold text-white mb-2" // Render the title of the modal
                >
                    {title}
                </h3>
                <p
                    className="text-slate-400 mb-8" // Render the main message of the modal
                >
                    {message}
                </p>
                
                <div
                    className="flex gap-3 justify-end" // Render the action buttons container
                >
                    <button 
                        onClick={onCancel} // Attach the onCancel function to the click event
                        className="px-6 py-2 text-slate-300 hover:bg-white/5 rounded-xl font-bold transition-colors" // Apply styling to the cancel button
                    >
                        {
                            // Display the cancel text
                            cancelText
                        }
                    </button>
                    <button 
                        onClick={onConfirm} // Attach the onConfirm function to the click event
                        className={`px-6 py-2 text-white rounded-xl font-bold transition-all shadow-lg ${typeClasses[type]}`} // Apply dynamic styling based on the type prop
                    >
                        {
                            // Display the confirm text
                            confirmText
                        }
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

// Export the ConfirmModal component for use in other files
export default ConfirmModal;
