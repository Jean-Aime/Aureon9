import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import MembershipPage from './pages/public/MembershipPage';
import TiersPage from './pages/public/TiersPage';
import FoundingPage from './pages/public/FoundingPage';
import OpportunitiesPage from './pages/public/OpportunitiesPage';
import PartnersPage from './pages/public/PartnersPage';
import RewardsPage from './pages/public/RewardsPage';
import VerificationPage from './pages/public/VerificationPage';
import RequestAccessPage from './pages/public/RequestAccessPage';
import AuthPage from './pages/public/AuthPage';
import MemberDashboard from './pages/MemberDashboard';
import AdminReviewModule from './pages/AdminReviewModule';
import AdminSettingsDashboard from './pages/AdminSettingsDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/tiers" element={<TiersPage />} />
            <Route path="/founding" element={<FoundingPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/request-access" element={<RequestAccessPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/verification-pending" element={<AuthPage />} />
          </Route>
          <Route path="/dashboard/member" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin-review" element={<ProtectedRoute><AdminReviewModule /></ProtectedRoute>} />
          <Route path="/dashboard/admin-settings" element={<ProtectedRoute><AdminSettingsDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
