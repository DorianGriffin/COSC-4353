import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAdmin.css';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check if user is authorized (head admin)
    useEffect(() => {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUser = adminUser.username ? adminUser : user;
        
        const isHeadAdmin = currentUser.role === 'admin' && (currentUser.is_super_admin === 1 || currentUser.is_super_admin === true);
        
        if (!isHeadAdmin) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const { username, email, password, confirmPassword } = formData;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            setMessage('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setMessage('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/admin/create-admin', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Admin account created successfully!');
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(data.message || 'Failed to create admin account');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            setMessage('Server error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-admin-container">
            <nav className="admin-navbar">
                <div className="admin-nav-brand">
                    <div className="brand-icon">⚡</div>
                    <span className="brand-text">VolunteerApp Admin</span>
                </div>
                <div className="admin-nav-actions">
                    <button 
                        onClick={() => navigate('/admin')} 
                        className="nav-btn"
                        title="Back to Admin Dashboard"
                    >
                        <span className="btn-icon">←</span>
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </nav>

            <div className="create-admin-content">
                <div className="create-admin-card">
                    <div className="card-header">
                        <h1>Create New Admin Account</h1>
                        <p>Add a new administrator to help manage the volunteer platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="create-admin-form">
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Enter admin username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter admin email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password (min 8 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        {message && (
                            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                {isLoading ? 'Creating...' : 'Create Admin Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAdmin;