import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import '../CSS/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password In-Modal Flow States
  const [forgotModal, setForgotModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // Step 1: Verify Email, Step 2: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please verify your email and password.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalMsg('');

    if (!forgotEmail.trim()) {
      setModalError('Please enter your email');
      return;
    }

    setModalLoading(true);
    try {
      const res = await authAPI.verifyEmail(forgotEmail.trim().toLowerCase());
      setModalMsg(
        res.data.message || 'Email verified! Please set a new password.',
      );
      setModalStep(2); // Instantly switches modal to password fields
    } catch (err) {
      setModalError(
        err.response?.data?.message || 'No account found with this email',
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalMsg('');

    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }

    setModalLoading(true);
    try {
      const res = await authAPI.directResetPassword(
        forgotEmail.trim().toLowerCase(),
        newPassword,
      );
      setModalMsg(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        setForgotModal(false);
        setModalStep(1);
        setPassword('');
        setError('');
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setModalLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setModalStep(1);
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
    setModalMsg('');
    setForgotModal(true);
  };

  return (
    <div className="auth-viewport-wrapper">
      <div className="auth-card-container">
        {/* Top Logo Badge */}
        <div className="auth-badge-header">
          <div className="auth-brand-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <h1 className="auth-card-title">Welcome back</h1>
          <p className="auth-card-subtitle">
            Sign in to your financial dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert-box error" role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleLoginSubmit} className="auth-form-layout">
          <div className="auth-input-group">
            <label className="auth-input-label">Email Address</label>
            <div className="auth-input-field-wrap">
              <span className="auth-field-leading-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                required
                className="auth-text-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-input-label">Password</label>
              <button
                type="button"
                className="auth-link-btn"
                onClick={openForgotModal}
              >
                Forgot Password?
              </button>
            </div>
            <div className="auth-input-field-wrap">
              <span className="auth-field-leading-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="auth-text-input has-trailing-btn"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-loading-flex">
                <span className="auth-mini-spinner" /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Don't have an account? </span>
          <Link to="/register" className="auth-highlight-link">
            Create an account
          </Link>
        </div>
      </div>

      {/* In-Modal Email Verification & Password Reset */}
      {forgotModal && (
        <div
          className="auth-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setForgotModal(false)}
        >
          <div className="auth-modal-card">
            <div className="auth-modal-top">
              <h2 className="auth-modal-heading">
                {modalStep === 1 ? 'Verify Email' : 'Set New Password'}
              </h2>
              <button
                type="button"
                className="auth-modal-close-icon"
                onClick={() => setForgotModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="auth-modal-explainer">
              {modalStep === 1
                ? 'Enter your registered email address to verify your account.'
                : `Account verified for ${forgotEmail}. Set your new password below.`}
            </p>

            {modalError && (
              <div className="auth-alert-box error mb-3">
                <span>{modalError}</span>
              </div>
            )}

            {modalMsg && (
              <div className="auth-alert-box success mb-3">
                <span>{modalMsg}</span>
              </div>
            )}

            {/* Step 1: Verify Email Form */}
            {modalStep === 1 && (
              <form onSubmit={handleVerifyEmail} className="mt-3">
                <div className="auth-input-group">
                  <label className="auth-input-label">Registered Email</label>
                  <div className="auth-input-field-wrap">
                    <input
                      type="email"
                      required
                      className="auth-text-input no-icons"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-modal-actions-bar">
                  <button
                    type="button"
                    className="auth-btn-ghost"
                    onClick={() => setForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-submit-btn compact"
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Checking...' : 'Verify Email'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: New Password Form */}
            {modalStep === 2 && (
              <form onSubmit={handleResetPassword} className="mt-3">
                <div className="auth-input-group">
                  <label className="auth-input-label">New Password</label>
                  <div className="auth-input-field-wrap">
                    <input
                      type="password"
                      required
                      className="auth-text-input no-icons"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group mt-3">
                  <label className="auth-input-label">
                    Confirm New Password
                  </label>
                  <div className="auth-input-field-wrap">
                    <input
                      type="password"
                      required
                      className="auth-text-input no-icons"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-modal-actions-bar">
                  <button
                    type="button"
                    className="auth-btn-ghost"
                    onClick={() => setModalStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="auth-submit-btn compact"
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
