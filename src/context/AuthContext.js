import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Authentication Context
 * Handles PIN-based login and user session management
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'bingwa_auth';
const PIN_KEY = 'bingwa_pin';
const USER_KEY = 'bingwa_user';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has set up PIN on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedPin = localStorage.getItem(PIN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      const sessionValid = sessionStorage.getItem(STORAGE_KEY);

      setHasPin(!!storedPin);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Auto-login if session is still valid
      if (sessionValid && storedPin) {
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Set up new PIN
  const setupPin = useCallback((pin, phoneNumber) => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be 4 digits' };
    }

    const userData = {
      phoneNumber,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(PIN_KEY, btoa(pin)); // Simple encoding (use bcrypt in production)
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    sessionStorage.setItem(STORAGE_KEY, 'true');
    
    setHasPin(true);
    setUser(userData);
    setIsAuthenticated(true);

    return { success: true };
  }, []);

  // Login with PIN
  const login = useCallback((pin) => {
    const storedPin = localStorage.getItem(PIN_KEY);
    
    if (!storedPin) {
      return { success: false, error: 'No PIN set up. Please register first.' };
    }

    if (btoa(pin) !== storedPin) {
      return { success: false, error: 'Incorrect PIN' };
    }

    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsAuthenticated(true);

    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return { success: true };
  }, []);

  // Logout
  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  // Change PIN
  const changePin = useCallback((oldPin, newPin) => {
    const storedPin = localStorage.getItem(PIN_KEY);
    
    if (btoa(oldPin) !== storedPin) {
      return { success: false, error: 'Current PIN is incorrect' };
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'New PIN must be 4 digits' };
    }

    localStorage.setItem(PIN_KEY, btoa(newPin));
    return { success: true };
  }, []);

  // Reset PIN (clears all data)
  const resetPin = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setHasPin(false);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user phone number
  const updatePhoneNumber = useCallback((phoneNumber) => {
    const userData = { ...user, phoneNumber };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, [user]);

  // Update user profile (name, email, etc.)
  const updateProfile = useCallback((updates) => {
    const userData = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  }, [user]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    hasPin,
    setupPin,
    login,
    logout,
    changePin,
    resetPin,
    updatePhoneNumber,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
