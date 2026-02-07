import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from '../ui/NetworkStatusBadge';
import './AppLayout.css';

/**
 * AppLayout Component
 * 
 * Responsive layout shell:
 * - Mobile: Header + Content + BottomNav
 * - Desktop: Header + Sidebar + Content
 */
export const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Header */}
      <Header 
        onMenuClick={!isMobile ? toggleSidebar : undefined}
        showMenuButton={!isMobile}
      />

      {/* Main Container */}
      <div className="app-layout__container">
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            currentPath={location.pathname}
          />
        )}

        {/* Main Content */}
        <main className="app-layout__main">
          <div className="app-layout__content">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && <BottomNav currentPath={location.pathname} />}
    </div>
  );
};

export default AppLayout;
