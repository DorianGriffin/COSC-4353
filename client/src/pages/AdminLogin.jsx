import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Demo admin credentials - in production, this would be handled by a backend
    const ADMIN_CREDENTIALS = {
        username: 'admin@volunteer.com',
        password: 'admin123'
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate API call delay
        setTimeout(() => {
            if (credentials.username === ADMIN_CREDENTIALS.username && 
                credentials.password === ADMIN_CREDENTIALS.password) {
                
                // Store admin session
                localStorage.setItem('adminUser', JSON.stringify({
                    username: credentials.username,
                    role: 'admin',
                    loginTime: new Date().toISOString()
                }));
                
                navigate('/admin');
            } else {
                setError('Invalid username or password');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div className="admin-login-inner">
              <div className="admin-login-header">
                <h1>Welcome Back, Admin</h1>
                <p>Sign in to manage your volunteer platform</p>
              </div>
      
              <form onSubmit={handleSubmit} className="admin-login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter admin username"
                  />
                </div>
      
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter admin password"
                  />
                </div>
      
                {error && <div className="error-message">{error}</div>}
      
                <button
                  type="submit"
                  className="admin-login-button"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
      
              <div className="demo-credentials">
                <strong>Demo:</strong> Username: admin@volunteer.com | Password: admin123
              </div>
      
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#555",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
          <div className="admin-login-side">
            <h2>VolunteerApp Admin</h2>
            <p>Access powerful tools to manage events and volunteers.</p>
          </div>
        </div>
      );
      
};

export default AdminLogin;