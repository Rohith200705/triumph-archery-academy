import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getToken, getStoredUser, clearSession } from './api.js';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewAdmission from './pages/NewAdmission.jsx';
import Reports from './pages/Reports.jsx';
import AdmissionDetail from './pages/AdmissionDetail.jsx';
import Settings from './pages/Settings.jsx';
import Ward from './pages/Ward.jsx';

export default function App() {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const location = useLocation();
  const isStaff = user && ['official', 'admin'].includes(user.role);

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register onLogin={setUser} />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const logout = () => {
    clearSession();
    setUser(null);
  };

  if (!isStaff) {
    return (
      <Routes location={location}>
        <Route path="/ward" element={<Ward onLogout={logout} />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Navigate to="/ward" replace />} />
        <Route path="/register" element={<Navigate to="/ward" replace />} />
        <Route path="*" element={<Navigate to="/ward" replace />} />
      </Routes>
    );
  }

  return (
    <Layout user={user} onLogout={logout}>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewAdmission />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<AdmissionDetail />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/ward" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
