import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // 1. Initialize user and token from storage to avoid loading flicker
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null,
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // 2. Clear authentication session
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // 3. Save session helper
  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
  };

  // 4. Validate and load current user profile
  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getProfile();
      const currentUser = res.data.user || res.data.data;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (err) {
      console.error(
        'Session validation failed:',
        err?.response?.data || err.message,
      );
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 5. Register handler
  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: receivedToken, user: receivedUser } =
      res.data.data || res.data;
    handleAuthSuccess(receivedToken, receivedUser);
    return receivedUser;
  };

  // 6. Login handler
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: receivedToken, user: receivedUser } =
      res.data.data || res.data;
    handleAuthSuccess(receivedToken, receivedUser);
    return receivedUser;
  };

  // 7. Update profile in state helper (optional convenience for profile edits)
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        register,
        login,
        logout,
        updateUser,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
