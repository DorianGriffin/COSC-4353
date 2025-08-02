import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {

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
}




  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [matches, getMatch] = useState([]);
  const [events, setEvents] = useState([]);
  const [matchFound, setMatchFound] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.user_id;

 //fetch matched event
    useEffect(() => {
  const fetchMatches = async () => {
    if (!userId) return; try {
      const response = await axios.get(
        `http://localhost:8080/api/matching/match-volunteer/${userId}`,
        { withCredentials: true }
      );
        getMatch(response.data.matchedEvents); 
        setMatchFound(response.data.matchedEvents.length > 0);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error(err);
    }
  };
    fetchMatches(); }, [userId]);

 const handleLogout = () => {
   // Clear any stored admin data
   localStorage.removeItem('admin');
   localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
   // Navigate back to home
   navigate('/');
 };

  ///
  return(
    <div className="admin-container">
      <nav className="admin-navbar">
        <div className="admin-logo">VolunteerApp Admin</div>
        <div className="admin-nav-links">
          <button className="nav-btn" onClick={() => navigate("/events")}>
            Manage Events
          </button>
          <button className="nav-btn active">Volunteer Matching</button>
          <button className="nav-btn" onClick={() => navigate("/")}>Back to Home</button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <h2>Volunteer Matched Events</h2>
        <p>Here you can view the events that have been matched with volunteers.</p>
          <div className = "matching-display-div">
                  <h3>Volunteer Match</h3>
                  <p><strong>Volunteer:</strong>Example</p>
                  <p><strong>Event Name:</strong></p>
                  <p><strong>Event Date:</strong></p>
                  <p><strong>Event Description: </strong></p>
                  <p><strong>Event Location:</strong></p>
                </div>
          { error && <p style={{ color: 'red' }}>{error}</p>}
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
<<<<<<< HEAD
export default AdminVolunteerMatching;
=======

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    backgroundColor: '#f9f9f9'
  }
};

export default AdminVolunteerMatching;
