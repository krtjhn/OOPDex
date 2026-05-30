// Import React hooks
import React, { useState, useEffect } from 'react';
// Import api client
import apiClient from '../../api/axios';
// Import GlassCard component
import GlassCard from '../../components/GlassCard';
// Import ConfirmModal component
import ConfirmModal from '../../components/ConfirmModal';
// Import useToast hook
import { useToast } from '../../components/Toast';
// Import PaginatedTable component
import PaginatedTable from '../../components/PaginatedTable';
// Import display utilities
import { getProfessorOakDisplayProfile, isProfessorOakAccount } from '../../utils/profileDisplay';

// UserManagement Component
const UserManagement = () => {
    // State for list of users
    const [users, setUsers] = useState([]);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    
    // State for deletion confirmation
    const [confirmDelete, setConfirmDelete] = useState(null);
    // Destructure showToast from hook
    const { showToast } = useToast();

    // Effect to fetch users on mount
    useEffect(() => {
        // Call fetch users function
        fetchUsers();
    }, []);

    // Fetch users function
    const fetchUsers = async () => {
        try {
            // Make API GET request for users
            const response = await apiClient.get('/admin/users');
            // Set users state with data
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            // Show error toast on fail
            showToast("Failed to load users", "error");
            // Clear users state
            setUsers([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    };

    // Handle deleting user function
    const handleDeleteUser = async () => {
        // Ensure user is selected for deletion
        if (!confirmDelete) return;
        try {
            // Call delete API
            await apiClient.delete(`/admin/users/${confirmDelete.id}`);
            // Update users list state
            setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
            // Show success toast
            showToast(`Trainer ${confirmDelete.username} evicted from the league.`, "info");
            // Reset confirm delete state
            setConfirmDelete(null);
        } catch (error) {
            // Show error toast if delete fails
            showToast("Record deletion blocked by league regulations.", "error");
        }
    };

    // Get total user count
    const totalUsers = users.length;
    // Get trainer count (excluding Oak)
    const totalTrainers = users.filter(u => !isProfessorOakAccount(u)).length;

    // Get readable role label
    const roleLabel = (role) => {
        // Default to User
        if (!role) return 'User';
        // Return Admin for admin role
        if (role.includes('ADMIN')) return 'Admin';
        // Default to Trainer
        return 'Trainer';
    };

    // Define table columns
    const columns = [
        {
            // Column header string
            header: "Trainer",
            // Cell render function
            render: (u) => (
                <div
                    // Flex container for user profile
                    className="flex items-center gap-3"
                >
                    {
                        // Conditional render based on profile picture
                        u.profilePictureUrl ? (
                            <img 
                                // Profile image
                                src={u.profilePictureUrl} 
                                alt={u.username} 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-inner shrink-0" 
                            />
                        ) : (
                            <div
                                // Avatar placeholder with initial
                                className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-inner shrink-0"
                            >
                                {
                                    // Render username initial or U
                                    u.username ? u.username.charAt(0).toUpperCase() : 'U'
                                }
                            </div>
                        )
                    }
                    <div
                        // User text details container
                    >
                        <div
                            // Username
                            className="font-bold text-white capitalize"
                        >
                            {u.username}
                        </div>
                        <div
                            // User email
                            className="text-[11px] text-slate-400"
                        >
                            {u.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            // Column header string
            header: "Role",
            // Cell render function
            render: (u) => (
                <div
                    // Container for role elements
                >
                    <div
                        // Role badge
                        // Render localized role label
                        className={`role-pill mb-1 ${u.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-trainer'}`}
                    >
                        {roleLabel(u.role)}
                    </div>
                </div>
            )
        },
        {
            // Column header string
            header: "Joined",
            // Cell render function formatted date
            render: (u) => <span className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</span>
        },
        {
            // Column header string
            header: "Actions",
            // Cell render function for action buttons
            render: (u) => (
                <button 
                    // Delete button
                    onClick={() => setConfirmDelete(u)}
                    className="evict-btn"
                    title={`Evict ${u.username}`}
                >
                    <svg
                        // Delete SVG icon
                        // SVG paths
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 4h6l-1 2H10L9 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            )
        }
    ];

    // Format user records with display wrapper
    const displayedUsers = users.map(getProfessorOakDisplayProfile);
    // Filter out Oak account
    const filteredUsers = displayedUsers.filter(u => !isProfessorOakAccount(u));

    // Render loading state
    if (loading) return <div className="text-white p-6">Loading trainer registry...</div>;

    // Render component content
    return (
        <div
            // Main wrapper div
            className="space-y-6"
        >
            <div
                // Header flex container
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div
                    // Title area
                >
                    <h2
                        // Page title
                        className="text-3xl font-extrabold text-white"
                    >
                        User Management
                    </h2>
                    <p
                        // Page subtitle
                        className="text-slate-400"
                    >
                        Monitor and manage PokeDex trainers
                    </p>

                    <div
                        // Stats container
                        className="user-management-stats mt-4"
                    >
                        <div
                            // Stat card for trainers
                            className="user-stat-card"
                        >
                            <div
                                // Stat label
                                className="text-sm text-slate-400"
                            >
                                Trainers
                            </div>
                            <div
                                // Stat value
                                className="text-2xl font-bold"
                            >
                                {totalTrainers}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GlassCard
                // Glass card container for table
                className="p-0 overflow-hidden border-white/10"
            >
                <PaginatedTable 
                    // Render paginated table
                    columns={columns}
                    data={filteredUsers}
                    loading={loading}
                />
            </GlassCard>

            {
                // Conditionally render confirm modal
                confirmDelete && (
                    <ConfirmModal
                        // Render confirm modal component
                        isOpen={!!confirmDelete}
                        title="Evict Trainer?"
                        message={`Are you sure you want to evict ${confirmDelete.username}? All their caught Pokémon and data will be permanently erased.`}
                        confirmText="Permanently Evict"
                        onConfirm={handleDeleteUser}
                        onCancel={() => setConfirmDelete(null)}
                    />
                )
            }
        </div>
    );
};

// Export UserManagement component
export default UserManagement;


