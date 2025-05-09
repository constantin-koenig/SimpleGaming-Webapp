// Routendefinitionen
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Öffentliche Seiten
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';

// Auth-Seiten
import AuthCallback from './pages/auth/AuthCallback';

// Mitgliederseiten
import Dashboard from './pages/member/Dashboard';
import Profile from './pages/member/Profile';
import Buddies from './pages/member/Buddies';
import Events from './pages/member/Events';

// Admin-Seiten
import AdminDashboard from './pages/admin/AdminDashboard';

// Geschützte Route für Mitglieder
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Laden...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Geschützte Route für Admins
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Laden...</div>;
  }
  
  if (!user || !user.roles || !user.roles.includes('admin')) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Öffentliche Routen */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Auth-Routen */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Geschützte Mitgliederrouten */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/buddies" element={
        <ProtectedRoute>
          <Buddies />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />
      
      {/* Admin-Routen */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      {/* Fallback-Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;