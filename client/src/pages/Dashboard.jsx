"use client"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Segoe UI, sans-serif" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>Welcome to Your Dashboard!</h1>
        <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Hello {user.username}! You have successfully logged in to VolunteerApp.
        </p>

        <div
          style={{
            backgroundColor: "#f0f4ff",
            padding: "1.5rem",
            borderRadius: "10px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#1e3a8a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Find Opportunities
            </button>
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              My Profile
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Dashboard
