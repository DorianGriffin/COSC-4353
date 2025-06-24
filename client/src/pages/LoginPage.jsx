"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
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

    const { username, password, confirmPassword } = formData

    if (!username || !password) {
      setMessage("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? "/api/users/login" : "/api/users/register"
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(data.user))
          setMessage("Login successful! Redirecting...")
          setTimeout(() => {
            navigate("/dashboard") // Redirect to dashboard
          }, 1500)
        } else {
          setMessage("Registration successful! You can now login.")
          setIsLogin(true)
          setFormData({ username: "", password: "", confirmPassword: "" })
        }
      } else {
        setMessage(data.message || `${isLogin ? "Login" : "Registration"} failed`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setFormData({ username: "", password: "", confirmPassword: "" })
    setMessage("")
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">{isLogin ? "Welcome Back" : "Join VolunteerApp"}</h1>
            <p className="auth-subtitle">
              {isLogin ? "Sign in to continue making an impact" : "Start your volunteer journey today"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="Enter your username"
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

            {!isLogin && (
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
            )}

            {message && (
              <div className={`message ${message.includes("successful") ? "success" : "error"}`}>{message}</div>
            )}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={switchMode} className="switch-button">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="demo-info">
            <p className="demo-title">Demo Credentials:</p>
            <p className="demo-text">Username: test | Password: test</p>
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

export default LoginPage
