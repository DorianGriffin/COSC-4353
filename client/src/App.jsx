import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/LoginPage';
import VolunteerHistoryPage from './pages/VolunteerHistoryPage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;