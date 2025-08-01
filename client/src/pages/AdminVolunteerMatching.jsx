'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [matchFound, getMatch] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.user_id;

 //fetch matched event
    useEffect(() => {
      const fetchMatches = async () => {
        try {
          const response = await axios.get("http://localhost:8080/api/matches", { credentials: "include"});
          setMatches(response.data);
          getMatch(response.data.length > 0);
        } catch (err) {
          setError('Failed to fetch matches');
        }
      };
      fetchMatches();
    }, []);
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
        <h2>Volunteer Matched Events</h2>
        <p>Here you can view the events that have been matched with volunteers.</p>
          <div className = "matching-display-div">
                  <h3>Volunteer Match</h3>
                  <p><strong>Volunteer:</strong>Example</p>
                  <p><strong>Event Name:</strong></p>
                  <p><strong>Event Date:</strong></p>
                  <p><strong>Event Description:</strong></p>
                  <p><strong>Event Location:</strong></p>
                </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
            {matchFound ? (
              <form>
                {matches.map((match, index) => (
                  <div key={index} style={styles.card}>
                    <p><strong>Volunteer:</strong> {match.userName}</p>
                    <p><strong>Event:</strong> {match.eventName}</p>
                  </div>
                ))}
              </form>
            ) : (
              <p style={{ color: 'gray' }}>There is no match.</p>
            )}
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
    flexWrap: 'wrap',
  },
};

export default AdminVolunteerMatching;
