import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
<<<<<<< HEAD
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
=======
import Login from './pages/LoginPage';
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

>>>>>>> 11141db268087f3ba14c21b4c99067f18935ae89

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
<<<<<<< HEAD
        <Route path="/" element={<LoginPage/>}/>
        <Route path="/" element={<RegisterPage/>}/>
=======
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

>>>>>>> 11141db268087f3ba14c21b4c99067f18935ae89
      </Routes>
    </Router>
  );
}

export default App;