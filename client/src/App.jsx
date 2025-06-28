import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminEventManagement from './pages/AdminEventManagement';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<AdminEventManagement />} />
      </Routes>
    </Router>
  );
}

export default App;