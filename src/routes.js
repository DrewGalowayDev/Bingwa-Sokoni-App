import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './data/constants';

// Pages
import HomePage from './pages/HomePage';
import DealsPage from './pages/DealsPage';
import OrdersPage from './pages/OrdersPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';

/**
 * Application Routes Configuration
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.DEALS} element={<DealsPage />} />
      <Route path={`${ROUTES.DEALS}/:category`} element={<DealsPage />} />
      <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
      <Route path={ROUTES.WALLET} element={<WalletPage />} />
      <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
