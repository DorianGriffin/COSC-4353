import React from 'react';
import './HomePage.css';

import heroImage from './assets/hero.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug: Let's see what user looks like
  console.log('HomePage - user:', user);

  const features = [
    {
      icon: "🤝",
      title: "Connect with Purpose",
      description: "Find meaningful volunteer opportunities that align with your values and interests."
    },
    {
      icon: "🌍",
      title: "Global Impact",
      description: "Make a difference in communities worldwide through local and international projects."
    },
    {
      icon: "📈",
      title: "Track Your Impact",
      description: "Monitor your volunteer hours and see the real difference you're making."
    },
    {
      icon: "👥",
      title: "Join a Community",
      description: "Connect with like-minded volunteers and build lasting friendships."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Volunteers" },
    { number: "500+", label: "Organizations" },
    { number: "50K+", label: "Hours Volunteered" },
    { number: "25+", label: "Countries" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Environmental Volunteer",
      text: "VolunteerApp helped me find the perfect opportunity to contribute to ocean cleanup efforts. I've made amazing friends and feel like I'm truly making a difference!",
      avatar: "👩‍🦰"
    },
    {
      name: "Michael Chen",
      role: "Education Volunteer",
      text: "Teaching kids through this platform has been incredibly rewarding. The matching system found me opportunities that perfectly fit my schedule and skills.",
      avatar: "👨‍🏫"
    },
    {
      name: "Emma Davis",
      role: "Community Organizer",
      text: "As an organization, we've found amazing volunteers through this platform. The quality of matches and commitment level is outstanding.",
      avatar: "👩‍💼"
    }
  ];

  return (
    <div className="home-container">
    

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">🌟 Join 10,000+ Volunteers Worldwide</div>
            <h1>Make an Impact, <span className="highlight">Locally & Globally</span></h1>
            <p>Find volunteer opportunities that match your passion and skills. Connect with organizations making a real difference in communities around the world.</p>
            <div className="hero-buttons">
              <button className="cta-button primary" onClick={() => navigate(user ? '/volunteer-dashboard' : '/login')}>
                {user ? 'Go to Dashboard' : 'Start Volunteering'}
                <span className="button-icon">→</span>
              </button>
              {user && (
                <button className="cta-button secondary" onClick={() => navigate('/volunteer-dashboard')}>
                  View Dashboard
                </button>
              )}
              {!user && (
              <button className="cta-button secondary" onClick={() => navigate('/about')}>
                Learn More
              </button>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <img src={heroImage || "/placeholder.svg"} alt="Helping hands" />
              <div className="floating-card">
                <div className="card-icon">💝</div>
                <div className="card-text">
                  <div className="card-title">Impact Made</div>
                  <div className="card-value">50,000+ Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose VolunteerApp?</h2>
            <p>Discover what makes our platform the perfect place to start your volunteer journey</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just three simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Sign Up</h3>
                <p>Create your profile and tell us about your interests and availability</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Find Opportunities</h3>
                <p>Browse and discover volunteer opportunities that match your skills</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Make Impact</h3>
                <p>Start volunteering and track your positive impact on communities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Volunteers Say</h2>
            <p>Real stories from people making a difference</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of volunteers who are already making an impact in their communities</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">VolunteerApp</div>
              <p>Connecting passionate volunteers with meaningful opportunities worldwide.</p>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>For Volunteers</h4>
              <ul>
                <li><a href="#">Find Opportunities</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Success Stories</a></li>
                <li><a href="#">Resources</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Organizations</h4>
              <ul>
                <li><a href="#">Post Opportunities</a></li>
                <li><a href="#">Manage Volunteers</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 VolunteerApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
