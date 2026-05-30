// Import React and useState hook
import React, { useState } from 'react';
// Import auth context
import { useAuth } from '../context/AuthContext';
// Import OOPDex logo
import OOPDexLogo from '/assets/images/OOPDex.png';

// SidePanel component
const SidePanel = ({ tabs, activeTab, onTabChange, profile }) => {
  // State to manage sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Get logout function from auth context
  const { logout } = useAuth();

  return (
    <div
      // Main sidebar container
      className={`glass-sidebar h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-[19rem]'}`}
    >
      <div
        // Header section with logo and toggle button
        className="h-24 px-4 border-b border-white/10 flex items-center gap-3"
      >
        <div
          // Logo wrapper
          className={`h-full flex-1 overflow-hidden transition-all duration-300 flex items-center justify-start ${isCollapsed ? 'w-10' : 'w-full'}`}
        >
          <img
            // Logo image
            src={OOPDexLogo}
            alt="OOPDex"
            className="h-16 w-auto max-w-full object-contain select-none"
            draggable={false}
          />
        </div>
        <button
          // Toggle collapse button
          // Arrow icon based on state
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-white p-2 hover:bg-white/10 rounded-lg"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div
        // User profile section
        className="p-4 border-b border-white/10"
      >
        <div
          // Profile info container
          className="flex items-center gap-3"
        >
          {
            // Check if profile picture URL exists
            profile?.profilePictureUrl ? (
              <img
                // Display profile picture
                src={profile.profilePictureUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div
                // Fallback avatar
                className="w-10 h-10 rounded-full border border-white/20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm"
              >
                {
                  // Initials fallback
                  profile?.username?.charAt(0).toUpperCase() || 'T'
                }
              </div>
            )
          }

          {
            // Conditional rendering for expanded state
            !isCollapsed && (
              <div
                // Text container
                className="overflow-hidden"
              >
                <p
                  // Username text
                  className="text-white font-medium truncate"
                >
                  {profile?.username}
                </p>
                <p
                  // User role text
                  className="text-xs text-slate-400"
                >
                  {profile?.role ? (profile.role.includes('ADMIN') ? 'Admin' : 'Trainer') : 'Trainer'}
                </p>
              </div>
            )
          }
        </div>
      </div>

      <nav
        // Navigation tabs area
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {
          // Map through tabs array
          tabs.map((tab) => (
            <button
              // Tab button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="sidebar-nav-button group w-full flex items-center gap-3 p-3"
              data-active={activeTab === tab.id}
              title={isCollapsed ? tab.label : undefined}
            >
              <span
                // Active state indicator rail
                className="sidebar-active-rail"
              />
              <span
                // Hover aura effect
                className="sidebar-nav-aura"
              />
              <span
                // Shine effect
                className="sidebar-nav-shine"
              />

              <span
                // Icon container
                className="sidebar-icon-frame"
              >
                {
                  // Check if icon is an image path
                  typeof tab.icon === 'string' && tab.icon.startsWith('/') ? (
                    <img
                      // Image icon
                      src={tab.icon}
                      alt={tab.label}
                      className="sidebar-icon-image relative z-10 h-8 w-8 object-contain drop-shadow-md"
                      draggable={false}
                    />
                  ) : (
                    <span
                      // Text/Emoji icon
                      className="relative z-10 text-xl"
                    >
                      {tab.icon}
                    </span>
                  )
                }
              </span>

              {
                // Conditional rendering for tab label
                !isCollapsed && <span className="sidebar-nav-label">{tab.label}</span>
              }
            </button>
          ))
        }
      </nav>

      <div
        // Bottom section (Logout)
        className="p-2 border-t border-white/10"
      >
        <button
          // Logout button
          onClick={logout}
          className="sidebar-nav-button sidebar-logout-button group w-full flex items-center gap-3 p-3"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <span
            // Hover aura effect
            className="sidebar-nav-aura"
          />
          <span
            // Shine effect
            className="sidebar-nav-shine"
          />
          <span
            // Icon container
            className="sidebar-icon-frame"
          >
            <img
              // Logout icon
              src="/assets/images/sidebar-logout.png"
              alt="Logout"
              className="sidebar-icon-image h-8 w-8 object-contain drop-shadow-md"
              draggable={false}
            />
          </span>
          {
            // Conditional rendering for label
            !isCollapsed && <span className="sidebar-nav-label">Logout</span>
          }
        </button>
      </div>
    </div>
  );
};

// Export SidePanel component
export default SidePanel;
