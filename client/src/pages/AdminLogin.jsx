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
      setError("");
  
      const { username, password } = credentials;
  
      try {
        const response = await fetch("http://localhost:8080/api/admin/login", {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ username, password })
          });
  
          const data = await response.json();
  
          if (response.ok) {
              const user = data.user;
  
              // Check if user is an admin
              if (user.role === "admin") {
                  localStorage.setItem("adminUser", JSON.stringify(user));
                  navigate("/admin");
              } else {
                  setError("Access denied: Not an admin.");
              }
          } else {
              setError(data.message || "Login failed.");
          }
      } catch (err) {
          console.error("Login error:", err);
          setError("Server error. Please try again.");
      } finally {
          setLoading(false);
      }
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