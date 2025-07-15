import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from './assets/hero.png';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState({
    name: '',
    skills: [],
    availability: []
  });

  const [events, setEvents] = useState([
    { id: 1, name: 'Park clean up', date: 'July 20, 2025', location: 'Buffalo Park', accepted: false },
    { id: 2, name: 'Food Delivery', date: 'July 25, 2025', location: 'Food bank', accepted: false },
    { id: 3, name: 'Beach clean up', date: 'July 30, 2025', location: 'Galveston Beach', accepted: false },
    { id: 4, name: 'Tutor students', date: 'August 15, 2025', location: 'University of Houston', accepted: false },
  ]);

  useEffect(() => {
    //old, no backend
    //const name = localStorage.getItem('userName');
    //const skills = JSON.parse(localStorage.getItem('skills')) || [];
    //const availability = JSON.parse(localStorage.getItem('availability')) || [];
    //const isComplete = localStorage.getItem('profileComplete') === 'true';

    //if (name) {
     // setUser({ name, skills, availability });
    //}
   // setProfileComplete(isComplete);
    //Fetch real profile data from backend
     const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser || !localUser.username) {
      console.error("User not found in localStorage.");
      return;
    }

    fetch(`http://localhost:8080/api/users/profile/${localUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser({
            name: data.data.name,
            skills: data.data.skills || [],
            availability: data.data.availability || []
          });          
          setProfileComplete(true);
        } else {
          console.warn("Profile not found or incomplete");
          setProfileComplete(false);
        }
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setProfileComplete(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAcceptOrCancel = (eventId) => {setEvents(prev =>prev.map(ev =>ev.id === eventId ? { ...ev, accepted: !ev.accepted } : ev));
  };
  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#333', position: 'relative' }}>
      <div ref={dropdownRef} style={{ position: 'absolute', top: '1rem', right: '2rem' }}><button onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>☰ Menu </button>

        {dropdownOpen && (
          <div style={{
            background: '#fff',
            border: '1px solid #ccc',
            marginTop: '0.5rem',
            borderRadius: '5px',
            padding: '1rem',
            width: '240px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}><p><strong>Availability:</strong></p><ul style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
              {user.availability.length > 0 ? (user.availability.map((date, idx) => <li key={idx}>{date}</li>)) : (
              <li>No availability set</li>)}</ul><hr />
            <p onClick={() => handleNavigate('/notification')} style={{ cursor: 'pointer', color: '#dc3545', margin: '0.3rem 0' }}> Notification</p>
            <p onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer', color: '#dc3545', margin: '0.3rem 0' }}>Profile</p>
            <p onClick={() => handleNavigate('/volunteer-history')} style={{ cursor: 'pointer', color: '#dc3545', margin: '0.3rem 0' }}>History</p>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#333',
            fontSize: '1rem',
            marginBottom: '1rem',
            cursor: 'pointer'
          }}>← Back to Home</button>
          <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#007bff' }}>Dashboard</h1>
          <p style={{ fontSize: '1.1rem' }}>Welcome, ready to start your journey!</p></div>

        <div style={{ marginTop: '2rem' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Skills:</strong> {user.skills.join(', ')}</p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {profileComplete ? (
            <p style={{ color: 'green' }}>Profile complete</p>
          ) : (
            <p style={{ color: 'orange' }}>Profile incomplete, please complete your profile</p>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Matched Events</h2>
          {events.map(ev => (
            <div key={ev.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
              <p><strong>{ev.name}</strong></p>
              <p>{ev.date} — {ev.location}</p><button
                onClick={() => handleAcceptOrCancel(ev.id)}style={{
                  padding: '0.5rem 1rem',
                  background: ev.accepted ? '#dc3545' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>{ev.accepted ? 'Cancel' : 'Accept'}</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <img
          src={heroImage}
          alt="Volunteer Visual"
          style={{
            maxWidth: '500px',
            width: '100%',
            height: 'auto',
            borderRadius: '12px'
          }}
        />
      </div>
    </div>
  );
};

export default VolunteerDashboard;
