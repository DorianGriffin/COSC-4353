"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const SERVER_URL = "http://localhost:8080"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setIsLoading(true)

    if (!email) {
      setMessage("Please enter your email")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Reset link sent! Check your email (or dev console).")
      } else {
        setMessage(data.message || "Failed to send reset link")
      }
    } catch (err) {
      console.error("Error:", err)
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
            <h1 className="auth-title">Forgot Your Password?</h1>
            <p className="auth-subtitle">We'll send a reset link to your email</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Registered Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes("sent") ? "success" : "error"}`}>{message}</div>
            )}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Remember your password?{" "}
              <button type="button" onClick={() => navigate("/login")} className="switch-button">
                Back to Login
              </button>
            </p>
          </div>
        </div>

        <div className="auth-side-panel">
          <div className="side-content">
            <h2>Reset and Reconnect</h2>
            <p>Don’t worry! Resetting your password is quick and easy.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <div>
                  <h3>Secure Reset</h3>
                  <p>We'll guide you through the reset process safely</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💡</div>
                <div>
                  <h3>Regain Access</h3>
                  <p>Get back to volunteering in no time</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🤗</div>
                <div>
                  <h3>We're Here</h3>
                  <p>Need help? Just reach out anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword