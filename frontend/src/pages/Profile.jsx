import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/api/users/profile', formData);
      setProfile(response.data);
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    try {
      await api.put('/api/users/profile/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-8 text-slate-400">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-slate-400 transition hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-50">Profile Settings</h1>
            <p className="mt-2 text-slate-400">Manage your account information and preferences</p>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Personal Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: profile.name,
                          email: profile.email
                        });
                      }}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="mt-1 text-lg text-slate-100">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="mt-1 text-lg text-slate-100">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Member Since</p>
                    <p className="mt-1 text-lg text-slate-100">
                      {new Date(profile?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Security</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                    >
                      <Lock className="h-4 w-4" />
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        });
                      }}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-slate-400">
                  Keep your account secure by using a strong password and changing it regularly.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
