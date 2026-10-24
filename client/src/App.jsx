import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getToken, getStoredUser, clearSession } from './api.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewAdmission from './pages/NewAdmission.jsx';
import Reports from './pages/Reports.jsx';
import AdmissionDetail from './pages/AdmissionDetail.jsx';

export default function App() {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const location = useLocation();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={setUser} />} />
      </Routes>
    );
  }

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <Layout user={user} onLogout={logout}>
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewAdmission />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<AdmissionDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
