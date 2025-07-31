'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const localUser = JSON.parse(localStorage.getItem("user"));
  if (!localUser || !localUser.eventId) { }

  useEffect(() => {
    fetch(`http://localhost:8080/api/matching/ ${localUser.userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch matched events');
        return res.json();
      })
      .then(data => setEvents(data))
      .catch(err => setError(err.message));
  }, []);

  const handleCancelEvent = (eventId) => {
    // Add backend request here if desired
    alert(`Event ${eventId} canceled. Message sent to volunteers.`);
  };

  const handleMessageUsers = (eventId) => {
    // Could open a modal for message input
    alert(`Custom message to users for event ${eventId}`);
  };

  const handleAddVolunteer = (eventId) => {
    alert(`Manual add volunteer to event ${eventId}`);
  };

  const handleOverrideVolunteer = (eventId) => {
    alert(`Manual override volunteer for event ${eventId}`);
  };

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
        <h2>Matched Events</h2>
        {error && <p className="error">{error}</p>}
        {events.length === 0 && !error && <p>No matched events found.</p>}
        {events.map(event => (
          <div key={event.id} style={styles.card}>
            <h3>{event.name}</h3>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Required Skills:</strong> {event.skills?.join(', ')}</p>

            <h4>Matched Volunteers:</h4>
            <ul>
              {event.volunteers?.map(v => (
                <li key={v.id}>
                  {v.name} ({v.email}) - Skills: {v.skills?.join(', ')}
                </li>
              )) || <li>No volunteers matched</li>}
            </ul>

            <div style={styles.buttonGroup}>
              <button className="nav-button" onClick={() => handleAddVolunteer(event.id)}>Add Volunteer</button>
              <button className="nav-button" onClick={() => handleOverrideVolunteer(event.id)}>Override Volunteer</button>
              <button className="nav-button" onClick={() => handleMessageUsers(event.id)}>Message Users</button>
              <button className="nav-button" onClick={() => handleCancelEvent(event.id)}>Cancel Event</button>
            </div>
          </div>
        ))}
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
