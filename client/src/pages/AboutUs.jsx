import React from 'react';
import './AboutUs.css'; // optional CSS file for custom styling
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About VolunteerApp</h1>
        <p>Empowering communities through meaningful volunteer connections</p>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          VolunteerApp connects passionate individuals with volunteer opportunities that create lasting change.
          Whether you're looking to help locally or globally, we provide the tools to match you with causes that
          align with your values, skills, and availability.
        </p>
      </div>

      <div className="about-section">
        <h2>Why We Exist</h2>
        <p>
          We believe that everyone has the power to make a difference. By bridging the gap between volunteers
          and organizations, we help build stronger communities and empower individuals to take action where
          it matters most.
        </p>
      </div>

      <div className="about-section">
        <h2>Who We Serve</h2>
        <ul>
          <li>🌍 Volunteers looking to give back</li>
          <li>🏢 Nonprofits and community organizations</li>
          <li>📊 Administrators managing volunteer programs</li>
        </ul>
      </div>

      <div className="about-cta">
        <button className="cta-button secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default AboutUs;