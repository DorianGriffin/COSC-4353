import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [adminUser, setAdminUser] = useState(null);

  // Check for admin authentication on component mount and localStorage changes
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminData = localStorage.getItem('adminUser');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          if (parsedAdmin.username && parsedAdmin.role === 'admin') {
            setAdminUser(parsedAdmin);
          } else {
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        setAdminUser(null);
      }
    };

    checkAdminAuth();

    // Listen for localStorage changes (when admin logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'adminUser') {
        checkAdminAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkAdminAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

    const [hydratedUser, setHydratedUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const stored = localStorage.getItem("user");
        setHydratedUser(stored ? JSON.parse(stored) : null);
    }, [location.pathname]);

  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/admineventmanagement",
    "/adminvolunteermatching",
    "/admin-login",
    "/events",
    "/admin",
  ];

  if (
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const handleUserLogout = () => {
    logout(); // Clears context and localStorage for regular users
    navigate("/login");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    navigate("/");
  };

  // Debug logging
  console.log('Navbar - Admin user:', adminUser);
  console.log('Navbar - Regular user:', user);

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

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {adminUser ? (
          // Admin is logged in
          <>
            <span style={{ marginRight: "1rem" }}>
              Welcome, {adminUser.username}
            </span>
            <button
              onClick={() => navigate("/admin")}
              style={{
                backgroundColor: "#E91E63",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                marginRight: "0.5rem",
              }}
            >
              Admin Dashboard
            </button>
            <button
              onClick={handleAdminLogout}
              style={{
                backgroundColor: "#9C27B0",
                border: "none",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : user || hydratedUser ? (
          // Regular user is logged in
          <>
            <span style={{ marginRight: "1rem" }}>
                              Welcome, {(user || hydratedUser)?.first_name || (user || hydratedUser)?.username}            </span>
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
              onClick={handleUserLogout}
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
        ) : (
          // No one is logged in
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
        )}
      </div>
    </nav>
  );
};

const navButtonStyle = {
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
};

export default Navbar;