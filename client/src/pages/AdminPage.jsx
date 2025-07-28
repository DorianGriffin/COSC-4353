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
            <div className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-content">
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage your volunteer platform from here</p>
                        </div>
                        <div className="admin-user-info">
                            <button 
                                onClick={() => navigate('/')} 
                                className="admin-home-btn"
                            >
                                Home
                            </button>
                            <span className="admin-welcome">Welcome, {adminUsername}</span>
                            <button onClick={handleLogout} className="admin-logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="admin-cards">
                    <div className="admin-card" onClick={() => navigate('/events')}>
                        <h3>Event Management</h3>
                        <p>Create and manage volunteer events</p>
                    </div>
                    
                    <div className="admin-card" onClick={() => navigate('/adminvolunteermatching')}>
                        <h3>Volunteer Matching</h3>
                        <p>Match volunteers with suitable opportunities</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;