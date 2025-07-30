import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  if (
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const handleLogout = () => {
    logout(); // Clears context and localStorage
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#3B0A45",
        padding: "1rem 2rem",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "600",
      }}
    >
      <div
        style={{ fontSize: "1.5rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        VolunteerApp
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {!user ? (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/admin-login")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Admin
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                backgroundColor: "#E91E63",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Get Started
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/volunteer-dashboard")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              Dashboard
            </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#9C27B0",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
