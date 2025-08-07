import React, { useEffect, useState } from 'react';
import './AdminPage.css'
import { useNavigate } from 'react-router-dom';
import VolunteerReportDownload from './VolunteerReportDownload.jsx';

const AdminPage = () => {
    const navigate = useNavigate();
    const [showCard, setShowCard] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showAdminList, setShowAdminList] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
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
        localStorage.removeItem('user');
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
        console.log('Sending email:', email);
        alert('Email sent!');
        setShowForm(false);
    };

    // Fetch all admins
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/admin/list', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok) {
                setAdmins(data.admins || []);
            } else {
                setMessage(data.message || 'Failed to fetch admins');
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            setMessage('Error fetching admin list');
        } finally {
            setLoading(false);
        }
    };

    // Delete admin
    const handleDeleteAdmin = async (adminId, adminUsername) => {
        if (!window.confirm(`Are you sure you want to delete admin "${adminUsername}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/delete-admin/${adminId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Admin deleted successfully');
                fetchAdmins(); // Refresh the list
            } else {
                setMessage(data.message || 'Failed to delete admin');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            setMessage('Error deleting admin');
        }
    };

    // Toggle admin list visibility and fetch if needed
    const handleToggleAdminList = () => {
        if (!showAdminList) {
            fetchAdmins();
        }
        setShowAdminList(!showAdminList);
    };

    // Get admin user data from both possible storage locations
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Use adminUser first, then fallback to user
    const currentUser = adminUser.username ? adminUser : user;
    
    // Debug logging (remove in production)
    console.log('AdminUser from localStorage:', adminUser);
    console.log('RegularUser from localStorage:', user);
    console.log('Current user:', currentUser);
    
    // Check if user is head admin (super admin) - SINGLE DECLARATION
    const isHeadAdmin = (currentUser.role === 'admin' && (currentUser.is_super_admin === 1 || currentUser.is_super_admin === true));
    
    console.log('Is head admin:', isHeadAdmin);
    
    const adminUsername = currentUser.username || 'Admin';
    
    return (
        <div className="admin-container">
            {/* Top Navigation Bar */}
            <nav className="admin-navbar">
                <div className="admin-nav-brand">
                    <div className="brand-icon">⚡</div>
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
                    {isHeadAdmin && (
                        <div className="admin-card tertiary" onClick={() => navigate('/create-admin')}>
                            <div className="card-header">
                                <div className="card-icon">🛠️</div>
                                <div className="card-badge">Super Admin</div>
                            </div>
                            <div className="card-content">
                                <h3>Create New Admin</h3>
                                <p>Register new admin users to manage the platform.</p>
                            </div>
                            <div className="card-footer">
                                <span className="card-action">Go to Admin Creator →</span>
                            </div>
                        </div>
                    )}

                    {isHeadAdmin && (
                        <div className="admin-card tertiary" onClick={handleToggleAdminList}>
                            <div className="card-header">
                                <div className="card-icon">👥</div>
                                <div className="card-badge">Super Admin</div>
                            </div>
                            <div className="card-content">
                                <h3>Manage Admins</h3>
                                <p>View and manage existing admin accounts on the platform.</p>
                            </div>
                            <div className="card-footer">
                                <span className="card-action">
                                    {showAdminList ? 'Hide Admin List ↑' : 'View Admin List →'}
                                </span>
                            </div>
                        </div>
                    )}

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

                {/* Admin Management Section */}
                {isHeadAdmin && showAdminList && (
                    <div className="admin-management-section">
                        <h2 className="section-title">Admin Management</h2>
                        
                        {message && (
                            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        {loading ? (
                            <p>Loading admins...</p>
                        ) : admins.length === 0 ? (
                            <p>No admins found.</p>
                        ) : (
                            <div className="admin-list">
                            {admins.map((admin) => (
                              <div key={admin.user_id} className="admin-item">
                                <div className="admin-info">
                                  <div className="admin-avatar">
                                    {admin.username?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <div className="admin-details">
                                    <h4>{admin.username}</h4>
                                    <p>{admin.email}</p>
                                    <span className="admin-role">
                                      {Boolean(admin.is_super_admin) ? 'Head Admin' : 'Admin'}
                                    </span>
                                  </div>
                                </div>
                                <div className="admin-actions">
                                  {!Boolean(admin.is_super_admin) && (
                                    <button
                                      onClick={() => handleDeleteAdmin(admin.user_id, admin.username)}
                                      className="delete-admin-btn"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  {Boolean(admin.is_super_admin) && (
                                    <span className="protected-admin">Protected</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-action-buttons">
                        {isHeadAdmin && (
                            <button className="quick-btn" onClick={() => navigate('/create-admin')}>
                                <span className="btn-icon">👤</span>
                                Create Admin Account
                            </button>
                        )}
                        {isHeadAdmin && (
                            <button className="quick-btn" onClick={handleToggleAdminList}>
                                <span className="btn-icon">👥</span>
                                {showAdminList ? 'Hide' : 'Manage'} Admins
                            </button>
                        )}
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
                            {showForm ? 'Cancel' : 'Send Email'}
                        </button>
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

                <div className="volunteer-report-section">
                    <VolunteerReportDownload />
                </div>
            </div>
        </div>
    );
};

export default AdminPage;