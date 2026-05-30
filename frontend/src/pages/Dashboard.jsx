// Import React hooks for state, side-effects, and refs
import React, { useState, useEffect, useRef } from 'react';
// Import custom hook for accessing authentication state
import { useAuth } from '../context/AuthContext';
// Import the configured Axios client for API requests
import apiClient from '../api/axios';
// Import the SidePanel component for the dashboard navigation
import SidePanel from '../components/SidePanel';
// Import ErrorBoundary component to catch errors in the dashboard child components
import ErrorBoundary from '../components/ErrorBoundary';
// Import utility to format the profile display specifically for admins (Professor Oak)
import { getProfessorOakDisplayProfile } from '../utils/profileDisplay';
// Assign the local path for the catch icon to a constant
const CatchIcon = '/assets/images/catch.png';

// Import child page component for admin's Pokemon Database view
import PokemonDatabase from './admin/PokemonDatabase';
// Import child page component for admin's User Management view
import UserManagement from './admin/UserManagement';

// Import child page component for standard user's Collection view
import MyCollection from './user/MyCollection';
// Import child page component for standard user's Pokedex Catalog view
import PokemonCatalog from './user/PokemonCatalog';

// Define the Dashboard functional component
const Dashboard = () => {
  // Destructure isAdmin flag and user object from AuthContext
  const { isAdmin, user } = useAuth();
  // Initialize state for the detailed user profile data
  const [profile, setProfile] = useState(null);
  // Initialize state for the currently active tab based on user role
  const [activeTab, setActiveTab] = useState(isAdmin ? 'pokemon' : 'collection');
  // Determine the current profile, defaulting to the basic user info if profile fetch fails/is pending
  const currentProfile = profile || user;
  // Apply the Professor Oak theme if the user is an admin, otherwise use normal profile
  const displayProfile = isAdmin ? getProfessorOakDisplayProfile(currentProfile) : currentProfile;

  // Use effect to fetch detailed user profile data on component mount
  useEffect(() => {
    // Define async function to fetch profile
    const fetchProfile = async () => {
      // Use try block to handle network errors
      try {
        // Fetch data from the current user endpoint, suppressing global errors
        const res = await apiClient.get('/user/me', { meta: { suppressGlobalErrorToast: true } });
        // Set the profile state with the received data
        setProfile(res.data);
      // Use catch block for error handling
      } catch (err) {
        // Set profile to null if the fetch fails
        setProfile(null);
      }
    };
    // Initiate the profile fetch
    fetchProfile();
  // Run effect only once on mount
  }, []);

  // Create a ref to access the background audio element
  const audioRef = useRef(null);

  // Use effect to handle background music based on user role
  useEffect(() => {
    // Check if audio element is ready
    if (audioRef.current) {
      // Set default volume to 50%
      audioRef.current.volume = 0.5;
      // Try playing the audio immediately
      audioRef.current.play().catch(() => {
        // Define fallback function to play audio on user interaction if autoplay was blocked
        const playOnInteraction = () => {
          // Play audio if ref exists, silencing errors
          audioRef.current && audioRef.current.play().catch(() => {});
          // Remove click listener once interacted
          document.removeEventListener('click', playOnInteraction);
          // Remove scroll listener once interacted
          document.removeEventListener('scroll', playOnInteraction);
        };
        // Add one-time click listener for audio fallback
        document.addEventListener('click', playOnInteraction, { once: true });
        // Add one-time scroll listener for audio fallback
        document.addEventListener('scroll', playOnInteraction, { once: true });
      });
    }
  // Re-run effect if isAdmin state changes
  }, [isAdmin]);

  // Define configuration array for admin navigation tabs
  const adminTabs = [
    // Configure Pokemon Database tab
    { id: 'pokemon', label: 'Pokemon Database', icon: '/assets/images/sidebar-pokedex.png' },
    // Configure User Management tab
    { id: 'users', label: 'Users', icon: '/assets/images/sidebar-users.png' }
  ];

  // Define configuration array for standard user navigation tabs
  const userTabs = [
    // Configure My Collection tab
    { id: 'collection', label: 'My Collection', icon: '/assets/images/sidebar-collection.png' },
    // Configure Catch / Pokedex Database tab
    { id: 'catch', label: 'Pokedex Database', icon: '/assets/images/sidebar-pokedex.png' }
  ];

  // Function to render the correct child component based on role and active tab
  const renderContent = () => {
    // Check if current user is an admin
    if (isAdmin) {
      // Evaluate the active tab ID for admin
      switch (activeTab) {
        // Case for the 'pokemon' tab
        case 'pokemon':
          // Render the PokemonDatabase component
          return <PokemonDatabase />;
        // Case for the 'users' tab
        case 'users':
          // Render the UserManagement component
          return <UserManagement />;
        // Default fallback case
        default:
          // Return null if no match is found
          return null;
      }
    }

    // Evaluate the active tab ID for standard user
    switch (activeTab) {
      // Case for the 'collection' tab
      case 'collection':
        // Render the MyCollection component
        return <MyCollection />;
      // Case for the 'catch' tab
      case 'catch':
        // Render the PokemonCatalog component
        return <PokemonCatalog />;
      // Default fallback case
      default:
        // Return null if no match is found
        return null;
    }
  };

  // Return the JSX structure for the Dashboard layout
  return (
    <ErrorBoundary
      // Wrap the entire dashboard in an ErrorBoundary to prevent full app crashes
    >
      <div
        // Create a full-height flex container preventing outer scrolling, forcing light theme
        className="flex h-screen overflow-hidden light-theme"
      >
        <audio 
          // Render the hidden background audio element
          // Attach the audio ref
          ref={audioRef} 
          // Dynamically set the audio source based on user role
          src={isAdmin ? "/assets/pokemon-audio/admin.mp3" : "/assets/pokemon-audio/user.mp3"} 
          // Enable continuous looping
          loop 
          // Attempt to auto-play on load
          autoPlay 
          // Hide the element visually
          style={{ display: 'none' }} 
        />
        <SidePanel
          // Render the SidePanel navigation component
          // Pass the appropriate tab configuration based on role
          tabs={isAdmin ? adminTabs : userTabs}
          // Pass the current active tab state
          activeTab={activeTab}
          // Pass the function to update the active tab
          onTabChange={setActiveTab}
          // Pass the display profile data (normal user or Prof Oak)
          profile={displayProfile}
        />

        <main
          // Render the main content area, allowing vertical scrolling
          className="flex-1 overflow-y-auto bg-[#f8fafc]"
        >
          <header
            // Render the sticky header area with blur effect and borders
            className="h-24 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm"
          >
            <div
              // Flex container for the header title and icon
              className="flex items-center gap-4"
            >
              <img
                // Render the Catch icon
                src={CatchIcon}
                alt="Pokeball"
                className="w-12 h-12 object-contain shrink-0"
                draggable={false}
              />
              <div
                // Container for the text headers
              >
                <h1
                  // Render the main dynamic title based on role
                  className="text-2xl font-black text-slate-800 tracking-tight leading-tight"
                >
                  {isAdmin ? 'Admin Control Center' : 'Trainer Dashboard'}
                </h1>
                <p
                  // Render the dynamic subtitle based on role
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1"
                >
                  {isAdmin ? 'System Management Portal' : 'Your Journey Begins Here'}
                </p>
              </div>
            </div>

            <div
              // Flex container for the user profile badge
              className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {
                // Check if the profile has a picture URL available
                displayProfile?.profilePictureUrl ? (
                  <img
                    // Render the profile image if available
                    // Use the profile picture URL
                    src={displayProfile.profilePictureUrl}
                    // Use the username for alt text, defaulting to 'Profile'
                    alt={displayProfile.username || 'Profile'}
                    // Apply styling for a rounded circular image
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-inner"
                  />
                ) : (
                  <div
                    // Render a fallback initial avatar if no picture is available
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-inner"
                  >
                    {
                      // Extract the first letter of the username or subject ID, fallback to 'U'
                      (displayProfile?.username || user?.sub || 'U').charAt(0).toUpperCase()
                    }
                  </div>
                )
              }
              <div
                // Container for the welcome text next to the avatar
                className="flex flex-col pr-4"
              >
                <span
                  // Render a small welcome label
                  className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider"
                >
                  Welcome Back
                </span>
                <span
                  // Render the actual username or subject ID
                  // Fallback chain for username display
                  className="text-sm font-extrabold text-slate-700 leading-tight"
                >
                  {displayProfile?.username || user?.sub}
                </span>
              </div>
            </div>
          </header>

          <div
            // Wrapper for the injected page content, adding padding
            className="p-10"
          >
            {
              // Call the renderContent function to inject the correct child component
              renderContent()
            }
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

// Export the Dashboard component as the default export
export default Dashboard;
