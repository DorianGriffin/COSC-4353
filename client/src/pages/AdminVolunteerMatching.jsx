'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [matchFound, getMatch] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const navigate = useNavigate();

  // Fetch events from the server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/", { credentials: "include"});
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvents();
  }, []);
  //fecth profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/profile", { credentials: "include" });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfileComplete(data.profileComplete);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  },[]);
  ///
  return (
    <div className="admin-container">
      <nav className="navbar">
        <div className="logo">VolunteerApp</div>
        <div className="nav-links">
          <button className="nav-button active" onClick={() => navigate('/adminvolunteermatching')}>Volunteer Matching</button>
          <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-button" onClick={() => navigate('/admin')}>Admin</button>
          <button className="nav-button primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      <div className="content">
        <h2>Profile</h2>
        <h2>Matched Events</h2>

      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonGroup: {
    marginTop: 15,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  }
};

export default AdminVolunteerMatching;
