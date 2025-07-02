import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import DatePicker from 'react-multi-date-picker';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    preferences: '',
    availability: []
  });
  const [message, setMessage] = useState('');

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const Skills = [
    'Strong work ethic', 'Teamwork', 'Tech Support', 'Communication', 'Problem-solving',
    'Diplomacy', 'Critical thinking', 'Open-mindedness', 'Work-life balance', 'Conflict management','Compassion',
    'Positive attitude','Empathy','collaboration','Continuous learning','Adaptability','flexibility'
  ];

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (dates) => {
    setFormData(prev => ({ ...prev, availability: dates.map(d => d.format("MMM D, YYYY")) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address1 || !formData.city || !formData.state || formData.skills.length === 0 || formData.availability.length === 0) {
      setMessage("Please fill all required fields");
      return;
    }

    if (formData.zip.length < 5) {
      setMessage("Zip code must be at least 5 characters long");
      return;
    }

    setMessage("Profile saved successfully!");
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const RequiredLabel = ({ children }) => (
    <label>
      {children} <span style={{ color: 'red' }}>*</span>
    </label>
  );

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card register-card">
          <button className="back-home-button" onClick={() => navigate("/")}>← Back to Home</button>

          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">Complete Your Profile</h1>
            <p className="auth-subtitle">Please complete your profile information.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <RequiredLabel>Full Name</RequiredLabel>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <RequiredLabel>Address 1</RequiredLabel>
              <input type="text" name="address1" value={formData.address1} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>Address 2</label>
              <input type="text" name="address2" value={formData.address2} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <RequiredLabel>City</RequiredLabel>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <RequiredLabel>State</RequiredLabel>
                <select name="state" value={formData.state} onChange={handleChange} className="form-input">
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <RequiredLabel>Zip Code</RequiredLabel>
              <input type="text" name="zip" value={formData.zip} onChange={handleChange} maxLength={9} className="form-input" />
            </div>

            <div className="form-group">
              <RequiredLabel>Skills (multiple select allowed)</RequiredLabel>
              <select name="skills" multiple value={formData.skills} onChange={handleChange} className="form-input">
                {Skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preferences</label>
              <textarea name="preferences" value={formData.preferences} onChange={handleChange} className="form-input"></textarea>
            </div>

            <div className="form-group">
              <RequiredLabel>Availability (multiple dates allowed)</RequiredLabel>
              <DatePicker
                multiple
                value={formData.availability}
                onChange={handleDateChange}
                format="MMM D, YYYY"
                className="form-input"
              />
            </div>

            {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}
            <button type="submit" className="auth-button">Save Profile</button>
          </form>
        </div>

        <div className="auth-side-panel">
          <div className="side-content">
            <h2>Make an Impact</h2>
            <p>Join thousands of volunteers making a difference in communities worldwide.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🤝</div>
                <div>
                  <h3>Connect</h3>
                  <p>Find opportunities that match your passion</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🌍</div>
                <div>
                  <h3>Impact</h3>
                  <p>Make a difference locally and globally</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <div>
                  <h3>Grow</h3>
                  <p>Develop skills while helping others</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

