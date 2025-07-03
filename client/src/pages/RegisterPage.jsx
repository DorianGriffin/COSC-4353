"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const SERVER_URL = "http://localhost:8080"

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setMessage("") // Clear message when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const { username, email, password, confirmPassword, firstName, lastName } = formData

    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
      setMessage("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Registration successful! Redirecting to login...")
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setMessage(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card register-card">
          {/* Back to Home Button */}
          <button className="back-home-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>

          {/* Header */}
          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">Join VolunteerApp</h1>
            <p className="auth-subtitle">Start your volunteer journey today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes("successful") ? "success" : "error"}`}>{message}</div>
            )}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="auth-switch">
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/login")} className="switch-button">
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Side Panel */}
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
  )
}

export default RegisterPage
