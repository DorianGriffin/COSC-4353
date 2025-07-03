import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {user && (
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      )}
    </nav>
  );
};

export default Navbar;
