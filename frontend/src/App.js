import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { authAPI } from './utils/api';
import './App.css';
import './index.css';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    path: '/transactions',
    label: 'Transactions',
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

// Inline Self-Contained Profile & Account Modal with Dynamic Close/Save Controls
const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync state whenever modal opens or user updates
  React.useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Detect whether any changes have been introduced
  const isNameChanged = name.trim() !== (user?.name || '').trim();
  const hasPasswordInput = Boolean(
    currentPassword || newPassword || confirmPassword,
  );
  const isDirty = isNameChanged || (showPasswordSection && hasPasswordInput);

  const handleResetForm = () => {
    setName(user?.name || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const togglePasswordSection = () => {
    setShowPasswordSection((prev) => !prev);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setError('Please enter your current password');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { name: name.trim() };
      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authAPI.updateProfile(payload);
      if (updateUser) updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
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

          {/* Collapsible Change Password Accordion Header */}
          <div className="password-accordion-bar">
            <button
              type="button"
              className="btn-toggle-password-accordion"
              onClick={togglePasswordSection}
            >
              <span className="toggle-label-with-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Change Password
              </span>
              <svg
                className={`accordion-chevron ${showPasswordSection ? 'rotated' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Expandable Password Form */}
          {showPasswordSection && (
            <div className="password-expandable-section">
              <div className="profile-field">
                <label className="profile-label">Current Password</label>
                <input
                  type="password"
                  required={showPasswordSection}
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
                    required={showPasswordSection}
                    placeholder="Min 6 chars"
                    className="profile-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-label">Confirm Password</label>
                  <input
                    type="password"
                    required={showPasswordSection}
                    placeholder="Repeat password"
                    className="profile-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions: Shown only when changes are made */}
          {isDirty && (
            <div className="profile-modal-actions">
              <button
                type="button"
                className="btn-profile-secondary"
                onClick={handleResetForm}
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
          )}
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="profile-danger-zone">
          <div className="danger-zone-info">
            <h4>Delete Account</h4>
            <p>Permanently remove account and all associated transactions.</p>
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

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-brand-box">
          {!collapsed ? (
            <div className="brand-header-group">
              <div className="brand-top-row">
                <div className="brand-logo-badge">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-16 0V6" />
                    <path d="M18 12h4" />
                  </svg>
                </div>
                <span className="brand-name">Expense Tracker</span>
              </div>
              <div className="brand-subtext">
                Crafted by Snehith Amirishetty
              </div>
            </div>
          ) : (
            <div
              className="brand-logo-badge collapsed-center"
              title="Expense Tracker - Crafted by Snehith Amirishetty"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-16 0V6" />
                <path d="M18 12h4" />
              </svg>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-collapse-btn"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className="nav-link-icon">{icon}</span>
              {!collapsed && <span className="nav-link-text">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-profile-preview">
              <div className="user-avatar-pill">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-text-meta">
                <div className="user-fullname-row">
                  <span className="user-fullname">{user?.name}</span>
                  {/* Interactive Edit Profile Button */}
                  <button
                    type="button"
                    className="user-edit-btn"
                    onClick={() => setProfileOpen(true)}
                    title="Edit name, password, or delete account"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="user-email-addr">{user?.email}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="sidebar-signout-btn"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="app-main-viewport">{children}</main>

      {/* Edit Profile & Account Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-brand">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-16 0V6" />
            <path d="M18 12h4" />
          </svg>
        </div>
        <div className="app-loading-spinner" />
        <p className="app-loading-text">Loading Expense Tracker...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
