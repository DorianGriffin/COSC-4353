import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from './assets/hero.png';

const skillMap = {
  1: "Teamwork",
  2: "Communication",
  3: "Problem-solving",
  4: "Empathy",
  5: "Adaptability",
  6: "Critical thinking",
  7: "Conflict resolution",
  8: "Positive attitude"
};

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState({
    userId: null,
    name: '',
    skills: [],
    availability: []
  });

  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/profile/me", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();

        const skills = (data.skills || []).map(skillObj =>
          skillObj.skill_id ? skillMap[skillObj.skill_id] || `Skill ${skillObj.skill_id}` : `Skill ${skillObj}`
        );

        setUser({
          userId: data.profile.user_id,
          name: data.profile?.fullName || "Volunteer",
          skills,
          availability: data.availability || []
        });
        console.log(" user.userId:", data.profile.user_id); 
        setProfileComplete(true);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileComplete(false);
        navigate("/profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchMatchedEvents = async () => {
      if (!user.userId) return;
      console.log(` Fetching events for user ${user.userId}`);
      try {
        const res = await fetch(`http://localhost:8080/api/matching/match/${user.userId}`, { credentials: 'include' });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setEvents(data.matchedEvents); // expects status field like: ev.status
      } catch (err) {
        console.error("Error fetching matched events:", err);
      }
    };

    fetchMatchedEvents();
  }, [user.userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  CHANGED: now takes `currentStatus` instead of `accepted`
  const handleAcceptOrCancel = async (eventId, currentStatus) => {
    console.log(`Handling ${currentStatus === 'assigned' ? 'cancel' : 'accept'} for event ${eventId}`);
    const action = currentStatus === 'assigned' ? 'cancel' : 'accept';
 //  toggle based on status

    try {
      const res = await fetch(`http://localhost:8080/api/matching/events/${eventId}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      });


      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      setEvents(prev =>
        prev.map(ev =>
          ev.event_id === eventId
          ? { ...ev, status: action === 'accept' ? 'assigned' : 'cancelled' } //  update status
            : ev
        )
      );
    } catch (err) {
      console.error('Error updating event status:', err);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#333', position: 'relative' }}>
      <div ref={dropdownRef} style={{ position: 'absolute', top: '1rem', right: '2rem' }}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          ☰ Menu
        </button>

        {dropdownOpen && (
          <div style={{ background: '#fff', border: '1px solid #ccc', marginTop: '0.5rem', borderRadius: '5px', padding: '1rem', width: '240px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <p><strong>Availability:</strong></p>
            <ul>
              {user.availability.length > 0
                ? user.availability.map((date, idx) => <li key={idx}>{date}</li>)
                : <li>No availability set</li>}
            </ul>
            <hr />
            <p onClick={() => handleNavigate('/notifications')} style={{ cursor: 'pointer', color: '#dc3545' }}>Notification</p>
            <p onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer', color: '#dc3545' }}>Profile</p>
            <p onClick={() => handleNavigate('/volunteer-history')} style={{ cursor: 'pointer', color: '#dc3545' }}>History</p>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <button onClick={() => navigate("/")} style={{ background: 'transparent', border: 'none', color: '#333', fontSize: '1rem', cursor: 'pointer' }}>
          ← Back to Home
        </button>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#007bff' }}>Dashboard</h1>
        <p style={{ textAlign: 'center' }}>Welcome, ready to start your journey!</p>

        <div style={{ marginTop: '2rem' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Skills:</strong> {user.skills.join(', ')}</p>
          <p style={{ color: profileComplete ? 'green' : 'orange' }}>
            {profileComplete ? 'Profile complete' : 'Profile incomplete, please complete your profile'}
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Matched Events</h2>
          {events.map(ev => (
            <div key={ev.event_id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
              <p><strong>{ev.name}</strong></p>
              <p>{new Date(ev.start_datetime).toLocaleDateString()} — {ev.City}, {ev.State}</p>

              {/*  Display status from eventassignments */}
              <p>Status: <strong>{ev.status || 'Not responded'}</strong></p>

              {/*  Updated button to use ev.status instead of ev.accepted */}
              <button
                onClick={() => handleAcceptOrCancel(ev.event_id, ev.status)} //  pass status to handler
                style={{
                  padding: '0.5rem 1rem',
                  background: ev.status === 'assigned' ? '#dc3545' : '#007bff',
                  color: '#fff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {ev.status === 'assigned' ? 'Cancel' : 'Accept'}

              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <img src={heroImage} alt="Volunteer Visual" style={{ maxWidth: '500px', width: '100%', height: 'auto', borderRadius: '12px' }} />
      </div>
    </div>
  );
};

export default VolunteerDashboard;
