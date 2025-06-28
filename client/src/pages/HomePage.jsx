import React from 'react';
import './HomePage.css';
import Login from './LoginPage';
import RegisterPage from './RegisterPage';
import heroImage from './assets/hero.png';

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">VolunteerApp</div>
        <div className="nav-links">
          <button className="nav-button" onClick={Login}>Login</button>
          <button className="nav-button primary" onClick ={RegisterPage}>Get Started</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-text">
          <h1>Make an Impact, Locally & Globally</h1>
          <p>Find volunteer opportunities that match your passion and skills.</p>
          <button className="cta-button">Join Now</button>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Helping hands" />
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 VolunteerApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
