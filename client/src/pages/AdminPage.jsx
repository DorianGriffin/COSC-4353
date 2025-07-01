"use client"

import React from 'react';
import './AdminPage.css'
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();
    return (
        <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">VolunteerApp</div>
        <div className="nav-links">
          <button className="nav-button" onClick={() => navigate('/about')}>About</button>
          <button className="nav-button" onClick={() => navigate('/opportunities')}>Opportunities</button>
          <button className="nav-button" onClick={() => navigate('/events') }>Event Managament</button>
          <button className="nav-button" onClick={() => navigate('/adminvolunteermatching') }>Volunteer Matching</button>
          <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-button" onClick={() => navigate('/admin')}>Admin</button>
          <button className="nav-button primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav> 
      </div>
    );
};

export default AdminPage