import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

        useEffect(() => {
        fetch("http://localhost:8080/api/matching/admin/matches")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch matched events");
                return res.json();
            })
            .then(data => {
                setMatches(data.matches);
                                data.matches.forEach(match => {

                    if (!match.status || match.status !== 'assigned') {
                        handleAccept(match.userName, match.eventName, match.userId, match.eventId);
                    }
                });
            })
            .catch(err => {
                console.error(err);
                setError("Failed to fetch matched events.");
            });
    }, []);

    const handleAccept = async (userName, eventName, userId, eventId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/matching/events/${eventId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });


            if (!response.ok) throw new Error("Failed to accept event");

            console.log(`Accepted event ${eventName} for ${userName}`);
        } catch (err) {
            console.error(err);
            alert("Error accepting event");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    return (
        <div className="admin-container">
            <nav className="admin-navbar">
                <div className="admin-logo">VolunteerApp Admin</div>
                <div className="admin-nav-links">
                    <button className="nav-btn" onClick={() => navigate("/events")}>Manage Events</button>
                    <button className="nav-btn active">Volunteer Matching</button>
                    <button className="nav-btn" onClick={() => navigate("/")}>Back to Home</button>
                    <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="admin-content">
                <h2>All Volunteer Matches</h2>
                <p>Below is the list of matched volunteers and events based on their skills, availability, and location.</p>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {matches.length > 0 ? (
                    matches.map((match, index) => (
                        <div key={index} style={styles.card}>
                            <p><strong>Volunteer:</strong> {match.userName}</p>
                            <p><strong>Event:</strong> {match.eventName}</p>
                            <p><strong>Date:</strong> {match.eventDate}</p>
                            <p><strong>Description:</strong> {match.eventDescription}</p>
                            <p><strong>Location:</strong> {match.eventLocation}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'gray' }}>No volunteer matches found.</p>
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
    }
};

export default AdminVolunteerMatching;
