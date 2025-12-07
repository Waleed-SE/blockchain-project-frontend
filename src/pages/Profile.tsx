import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cnic: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        cnic: ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Update local user data
      const updatedUser = {
        ...user,
        full_name: formData.full_name,
        email: formData.email,
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);

      if (formData.email !== user?.email) {
        setSuccess('Profile updated! Please verify your new email address.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{user?.full_name}</h2>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm mb-2">Wallet ID</p>
          <p className="text-lg font-mono break-all">{user?.wallet_id?.substring(0, 20)}...</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm mb-2">Account Status</p>
          <p className="text-2xl font-bold">
            {user ? '✓ Active' : '✗ Inactive'}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Personal Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn btn-secondary"
          >
            {editMode ? '✗ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={!editMode}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editMode}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="input-field bg-gray-100"
            />
          </div>

          {editMode && (
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                💾 Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="card bg-red-50 border-red-200">
        <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
        <p className="text-gray-700 mb-4">
          Once you log out, you'll need to sign in again to access your account.
        </p>
        <button
          onClick={logout}
          className="btn bg-red-600 text-white hover:bg-red-700"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
