import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './routes';
import { NetworkProvider } from './context/NetworkContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppControlProvider, useAppControl } from './context/AppControlContext';
import { ToastProvider } from './components/ui/Toast';
import { LoginScreen } from './components/auth/LoginScreen';
import AppBlockedScreen from './components/control/AppBlockedScreen';

/**
 * Main Application Component
 * 
 * Architecture:
 * - AppControlProvider: Remote app control (enable/disable/maintenance)
 * - AuthProvider: Handles PIN-based authentication
 * - NetworkProvider: Manages online/offline state globally
 * - ThemeProvider: Handles light/dark mode
 * - NotificationProvider: In-app notifications
 * - ToastProvider: Global notification system
 * - AppLayout: Responsive shell (sidebar for desktop, bottom tabs for mobile)
 */

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isBlocked, isLoading: isControlLoading } = useAppControl();

  // Show loading while checking app control
  if (isControlLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Connecting...</p>
      </div>
    );
  }

  // Show blocked screen if app is disabled
  if (isBlocked) {
    return <AppBlockedScreen />;
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppControlProvider>
        <AuthProvider>
          <NetworkProvider>
            <NotificationProvider>
              <ToastProvider>
                <Router>
                  <AuthenticatedApp />
                </Router>
              </ToastProvider>
            </NotificationProvider>
          </NetworkProvider>
        </AuthProvider>
      </AppControlProvider>
    </ThemeProvider>
  );
}

export default App;
