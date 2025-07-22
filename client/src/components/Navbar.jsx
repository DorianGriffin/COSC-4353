import { useNavigate, Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    // Hide Navbar on landing, login, and register pages
    if (
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password"||
        location.pathname.startsWith("/reset-password")
    ) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem("user");
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


            <div>
                {user ? (
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: "#7D3C98",
                            border: "none",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Log Out
                    </button>
                ) : null}
            </div>
        </nav>
    );
};

export default Navbar;
