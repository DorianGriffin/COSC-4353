import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Login from './pages/LoginPage';
import { AuthProvider } from './pages/AuthContext'
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPassword from "./pages/ResetPassword"
import VolunteerHistoryPage from './pages/VolunteerHistoryPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NotificationsPage from './pages/NotificationsPage';

import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import AdminEventManagement from './pages/AdminEventManagement';
import Admin from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import AdminVolunteerMatching from './pages/AdminVolunteerMatching';

function App() {
  return (
    <AuthProvider> 
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<AdminEventManagement />} />
          <Route path="/adminvolunteermatching" element={<AdminVolunteerMatching />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/" element={<LoginPage/>}/>
        <Route path="/" element={<RegisterPage/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<AdminEventManagement />} />
        <Route path="/adminvolunteermatching" element = {<AdminVolunteerMatching/>} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;