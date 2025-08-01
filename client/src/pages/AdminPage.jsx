import React from 'react';
import './AdminPage.css'
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/admin-login');
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;