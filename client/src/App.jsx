import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/LoginPage';
import VolunteerHistoryPage from './pages/VolunteerHistoryPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NotificationsPage from './pages/NotificationsPage';

import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import AdminEventManagement from './pages/AdminEventManagement';
import Admin from './pages/AdminPage';
import AdminVolunteerMatching from './pages/AdminVolunteerMatching';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<AdminEventManagement />} />
        <Route path="/adminvolunteermatching" element = {<AdminVolunteerMatching/>} />
        <Route path="/admin" element={<Admin/>}/>

      </Routes>
    </Router>
  );
}

export default App;