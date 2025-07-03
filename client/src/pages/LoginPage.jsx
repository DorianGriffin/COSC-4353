"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
    setMessage("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const { username, password } = formData

    if (!username || !password) {
      setMessage("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful! Redirecting...");
      
        if (data.user.profile_completed) {
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          setTimeout(() => {
            navigate("/profile");
          }, 1500);
        }
      }
       else {
        setMessage(data.message || "Login failed")
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
        <div className="auth-card">
          <button className="back-home-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>

          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue making an impact</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Email or Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email or username"
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
                placeholder="Enter your password"
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/register")} className="switch-button">
                Create account
              </button>
            </p>
          </div>

          <div className="demo-info">
            <p className="demo-title">Demo Credentials:</p>
            <p className="demo-text">Username: test | Password: test</p>
          </div>
        </div>

        <div className="auth-side-panel">
          <div className="side-content">
            <h2>Welcome Back!</h2>
            <p>Continue your volunteer journey and make a difference in communities worldwide.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <div>
                  <h3>Your Dashboard</h3>
                  <p>Track your volunteer hours and impact</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📅</div>
                <div>
                  <h3>Manage Events</h3>
                  <p>View and manage your volunteer commitments</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🏆</div>
                <div>
                  <h3>Achievements</h3>
                  <p>See your volunteer milestones and badges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
