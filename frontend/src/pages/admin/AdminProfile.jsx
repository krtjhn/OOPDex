import React, { useState } from 'react';
import apiClient from '../../api/axios';
import ProfileCard from '../../components/ProfileCard';
import ProfileEditModal from '../../components/ProfileEditModal';
import { useToast } from '../../components/Toast';
import { PencilLine } from 'lucide-react';

const AdminProfile = ({ profile, onProfileUpdated }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  if (!profile) {
    return <div className="p-6 text-slate-500">Loading profile...</div>;
  }

  const handleSaveProfile = async ({ username, bio, profilePictureFile }) => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio || '');

      if (profilePictureFile) {
        formData.append('profilePictureFile', profilePictureFile);
      }

      const response = await apiClient.put('/user/me/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        meta: { suppressGlobalErrorToast: true },
      });

      onProfileUpdated?.(response.data);
      showToast('Profile updated successfully.', 'success');
      return response.data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to update profile.', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Admin Profile</p>
          <h1 className="text-3xl font-black text-slate-900">{profile.username}</h1>
          <p className="text-slate-500">Professor Oak's control panel</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-red px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary-red/20 transition-transform hover:scale-[1.01]"
        >
          <PencilLine size={16} />
          Edit Profile
        </button>
      </div>

      <ProfileCard user={profile} />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Research Notes</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Professor Oak keeps the Pokédex organized and the trainers moving.
        </p>
      </div>

      <ProfileEditModal
        isOpen={isEditorOpen}
        profile={profile}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProfile}
        saving={isSaving}
      />
    </div>
  );
};

export default AdminProfile;

