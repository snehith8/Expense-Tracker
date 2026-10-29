import { useState } from 'react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../../CSS/ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete account confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authAPI.updateProfile(payload);
      if (updateUser) updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      await authAPI.deleteAccount();
      logout();
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div
      className="profile-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="profile-modal-card">
        <div className="profile-modal-header">
          <div className="profile-title-group">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="profile-modal-title">Account Settings</h2>
              <p className="profile-modal-subtitle">{user?.email}</p>
            </div>
          </div>
          <button className="profile-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="profile-alert error">{error}</div>}
        {success && <div className="profile-alert success">{success}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="profile-field">
            <label className="profile-label">Full Name</label>
            <input
              type="text"
              required
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="profile-divider">
            <span>Change Password (optional)</span>
          </div>

          <div className="profile-field">
            <label className="profile-label">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="profile-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label className="profile-label">New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className="profile-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label className="profile-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                className="profile-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-modal-actions">
            <button
              type="button"
              className="btn-profile-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-profile-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="profile-danger-zone">
          <div className="danger-zone-info">
            <h4>Delete Account</h4>
            <p>
              Permanently remove your account and all associated transactions.
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-trigger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="confirm-delete-block">
              <span>Are you sure? This cannot be undone.</span>
              <div className="confirm-buttons-row">
                <button
                  type="button"
                  className="btn-cancel-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Permanently Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
