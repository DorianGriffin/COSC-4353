import React, { useEffect, useState } from 'react';
import './AdminPage.css'
import { useNavigate } from 'react-router-dom';
//when button is clicked, increase the number of notifications by 1. Message: "New notification received"

const AdminPage = () => {
    const navigate = useNavigate();
    const [showCard, setShowCard] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState({
            to: '',
            subject: '',
            message: '',
        });

    const handleToggle = () => {
        setShowCard(!showCard);
    };
    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/admin-login');
    };
    const handleChange = (e) => {
        setEmail({
         ...email,
            [e.target.name]: e.target.value,
            });
     };
    const handleSubmit = (e) => {
                e.preventDefault();
                // Example: You would send `email` to your backend here using fetch or axios
                console.log('Sending email:', email);
                alert('Email sent!');
                setShowForm(false);
            };
    // Get admin user data with fallback
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const adminUsername = adminUser.username || 'Admin';
    
    return (
        <div className="admin-container">
            {/* Top Navigation Bar */}
            <nav className="admin-navbar">
                <div className="admin-nav-brand">
                    <div className="brand-icon"></div>
                    <span className="brand-text">VolunteerApp Admin</span>
                </div>
                <div className="admin-nav-actions">
                    <button 
                        onClick={() => navigate('/')} 
                        className="nav-btn"
                        title="Go to Home"
                    >
                        <span className="btn-icon">🏠</span>
                        <span>Home</span>
                    </button>
                    <div className="admin-user-badge">
                        <div className="user-avatar">
                            {adminUsername.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{adminUsername}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <span className="btn-icon">🚪</span>
                    </button>
                     <button onClick={() => navigate('/notifications')} className="notification-btn" title="notifications">
                        <span className="btn-icon">🔔</span>
                    </button>
                </div>
            </nav>

            <div className="admin-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Welcome back, {adminUsername}! 👋
                        </h1>
                        <p className="welcome-subtitle">
                            Manage your volunteer platform and make a difference in your community
                        </p>
                    </div>
                </div>
                
                {/* Main Action Cards */}
                <div className="admin-cards">
                    <div className="admin-card primary" onClick={() => navigate('/events')}>
                        <div className="card-header">
                            <div className="card-icon">📅</div>
                            <div className="card-badge">Popular</div>
                        </div>
                        <div className="card-content">
                            <h3>Event Management</h3>
                            <p>Create, edit, and manage volunteer events. Track participation and organize community activities.</p>
                        </div>
                        <div className="card-footer">
                            <span className="card-action">Manage Events →</span>
                        </div>
                    </div>
                    
                    <div className="admin-card secondary" onClick={() => navigate('/adminvolunteermatching')}>
                        <div className="card-header">
                            <div className="card-icon">🤝</div>
                            <div className="card-badge">Smart</div>
                        </div>
                        <div className="card-content">
                            <h3>Volunteer Matching</h3>
                            <p>Intelligently match volunteers with suitable opportunities based on skills and availability.</p>
                        </div>
                        <div className="card-footer">
                            <span className="card-action">View Matches →</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-action-buttons">
                        <button className="quick-btn" onClick={() => navigate('/events')}>
                            <span className="btn-icon">➕</span>
                            Create New Event
                        </button>
                        <button className="quick-btn" onClick={() => navigate('/adminvolunteermatching')}>
                            <span className="btn-icon">🔄</span>
                            Run Matching Algorithm
                        </button>
                            <button className="quick-btn" onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
                                  <span className="btn-icon">✉️</span>
                                {showForm ? 'Cancel' : 'Send Email'} </button>
                                    {showForm && (
                                        <form onSubmit={handleSubmit} style={{
                                        marginTop: '20px',
                                        border: '1px solid #ccc',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        maxWidth: '600px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label>To:</label><br />
                                            <input
                                            type="email"
                                            name="to"
                                            value={email.to}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '90%', padding: '8px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label>Subject:</label><br />
                                            <input
                                            type="text"
                                            name="subject"
                                            value={email.subject}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '90%', padding: '8px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label>Message:</label><br />
                                            <textarea
                                            name="message"
                                            value={email.message}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            style={{ width: '90%', padding: '8px' }}
                                            ></textarea>
                                        </div>
                                        
                                        <button type="submit" style={{ padding: '10px 20px' }}>Send</button>
                                        </form>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;