// VolunteerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from './assets/hero.png';

const skillMap = {
  1: "First Aid", 2: "Communication", 3: "CPR", 4: "Leadership", 5: "Organization",
  6: "Physical Labor", 7: "Teaching", 8: "Cooking", 9: "Driving", 10: "Technology",
  11: "Translation", 12: "Medical", 13: "Construction", 14: "Event Planning", 15: "Fundraising"
};

const urgencyRank = { high: 3, medium: 2, low: 1 };

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

  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmEventId, setConfirmEventId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

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
      try {
        const res = await fetch(`http://localhost:8080/api/matching/match/${user.userId}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setEvents(data.matchedEvents);
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

  const handleConfirm = (eventId, action, message) => {
    setConfirmEventId(eventId);
    setConfirmAction(action);
    setConfirmMessage(message);
  };

  const handleConfirmSubmit = () => {
    if (confirmAction === 'markComplete') {
      handleMarkComplete(confirmEventId);
    } else {
      // Simulate currentStatus based on action
      const simulatedCurrentStatus = confirmAction === 'accept' ? 'cancelled' : 'assigned';
      handleAcceptOrCancel(confirmEventId, simulatedCurrentStatus);
    }
    setConfirmEventId(null);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleAcceptOrCancel = async (eventId, currentStatus) => {
    let action;
    if (currentStatus === 'assigned' || currentStatus === 'accepted') {
      action = 'cancel';
    } else if (currentStatus === 'cancelled') {
      action = 'accept';
    }

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
            ? { ...ev, status: action === 'accept' ? 'accepted' : 'cancelled' }
            : ev
        )
      );
    } catch (err) {
      console.error('Error updating event status:', err);
    }
  };

  const handleMarkComplete = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/matching/events/${eventId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      setEvents(prev => prev.filter(ev => ev.event_id !== eventId));
    } catch (err) {
      console.error("Error marking event as completed:", err);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const nextEvent = events.length > 0
    ? [...events].sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))[0]
    : null;

  const mostUrgentEvent = events.length > 0
    ? [...events].sort((a, b) =>
        (urgencyRank[b.urgency_level?.toLowerCase()] || 0) -
        (urgencyRank[a.urgency_level?.toLowerCase()] || 0)
      )[0]
    : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#333', position: 'relative' }}>
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: '5rem',
          right: '2rem',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 2001
          }}
        >
          ☰ Menu
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '2.75rem',
              right: '0',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '1rem',
              width: '240px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 2001
            }}
          >
            <p><strong>Availability:</strong></p>
            <ul>
              {user.availability.length > 0
                ? user.availability.map((date, idx) => <li key={idx}>{date}</li>)
                : <li>No availability set</li>}
            </ul>
            <hr />
            <p onClick={() => handleNavigate('/notifications')} style={{ cursor: 'pointer', color: '#dc3545' }}>Notification</p>
            <p onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer', color: '#dc3545' }}>Edit Profile</p>
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

        {events.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ background: '#f0e7ff', padding: '1rem', borderRadius: '8px' }}>
                <h2>Next Event</h2>
                <p><strong>{nextEvent.name}</strong> — {new Date(nextEvent.start_datetime).toLocaleDateString()}</p>
              </div>
              <div style={{ background: '#f0e7ff', padding: '1rem', borderRadius: '8px' }}>
                <h2>Most Urgent Event</h2>
                <p><strong>{mostUrgentEvent.name}</strong> — {mostUrgentEvent.urgency_level}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2>Matched Events ({events.length})</h2>
          {events.length === 0 ? (
            <p style={{ color: '#666' }}>No matched events yet. Check back later or update your profile.</p>
          ) : (
            events.map(ev => (
              <div key={ev.event_id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                <h3 style={{ color: '#2c3e50' }}>{ev.name}</h3>
                <p>{ev.description}</p>
                <p><strong>Location:</strong> {ev.location}</p>
                <p><strong>Start:</strong> {new Date(ev.start_datetime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(ev.end_datetime).toLocaleString()}</p>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{
                    backgroundColor: ev.status === 'assigned' ? '#28a745' :
                      ev.status === 'cancelled' ? '#dc3545' :
                      ev.status === 'accepted' ? '#007bff' : '#6c757d',
                    color: 'white', borderRadius: '12px', padding: '4px 10px', fontSize: '0.8rem'
                  }}>
                    {ev.status || 'pending'}
                  </span>
                </div>

                <div>
                  {ev.status === 'assigned' && (
                    <>
                      <button onClick={() => handleConfirm(ev.event_id, 'cancel', 'Are you sure you want to cancel this event?')} style={{ ...btnStyle('#dc3545'), marginRight: '0.5rem' }}>Cancel</button>
                      <button onClick={() => handleConfirm(ev.event_id, 'accept', 'Do you want to accept this event?')} style={btnStyle('#007bff')}>Accept</button>
                    </>
                  )}

                  {ev.status === 'accepted' && (
                    <>
                      <button onClick={() => handleConfirm(ev.event_id, 'cancel', 'Are you sure you want to cancel this event?')} style={{ ...btnStyle('#dc3545'), marginRight: '0.5rem' }}>Cancel</button>
                      <button onClick={() => handleConfirm(ev.event_id, 'markComplete', 'Did you complete this event?')} style={btnStyle('#28a745')}>Mark Completed</button>
                    </>
                  )}

                  {ev.status === 'cancelled' && (
                    <button onClick={() => handleConfirm(ev.event_id, 'accept', 'Do you want to accept this event again?')} style={btnStyle('#007bff')}>
                      Accept Again
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <img src={heroImage} alt="Volunteer Visual" style={{ maxWidth: '500px', width: '100%', height: 'auto', borderRadius: '12px' }} />
      </div>

      {confirmEventId !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', padding: '2rem', borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)', textAlign: 'center'
          }}>
            <p style={{ marginBottom: '1rem' }}>{confirmMessage}</p>
            <button onClick={handleConfirmSubmit} style={{ ...btnStyle('#28a745'), marginRight: '1rem' }}>Yes</button>
            <button onClick={() => { setConfirmEventId(null); setConfirmAction(null); setConfirmMessage(''); }} style={btnStyle('#dc3545')}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle = (bg) => ({
  padding: '0.5rem 1rem',
  background: bg,
  color: '#fff',
  borderRadius: '5px',
  cursor: 'pointer',
  border: 'none'
});

export default VolunteerDashboard;


