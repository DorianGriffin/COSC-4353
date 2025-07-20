"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./ResetPassword.css" // Optional: use to style as needed

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useParams()
  const navigate = useNavigate()

  const SERVER_URL = "http://localhost:8080"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (!newPassword || !confirmPassword) {
      return setMessage("All fields are required")
    }

    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match")
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${SERVER_URL}/api/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setMessage(data.message || "Something went wrong.")
      }
    } catch (err) {
      console.error(err)
      setMessage("Server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card" style={{ maxWidth: "500px" }}>
          <h1 className="auth-title">Reset Your Password</h1>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="auth-switch">
            <p>Back to{" "}
              <button onClick={() => navigate("/login")} className="switch-button">
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword