import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/components.css";

function Navbar() {
  const { user, loading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
  const success = await logout();

  if (success) {
    setShowMenu(false);

    navigate("/", {
      state: {
        message: "You have been logged out successfully."
      }
    });
  }
};

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="navbar-logo">
        🐾 Tail Tracker
      </Link>

      {/* Navigation */}
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/adoption">Adopt</Link>
        <Link to="/rescue">Rescue</Link>
        <Link to="/report">Report</Link>
      </div>

      {/* Profile / Login */}
      {!loading && (
        <div className="navbar-account-container">

          {/* Profile Button */}
          <button
            className="navbar-account-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="user-circle">👤</span>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="account-dropdown">

              {user ? (
                <>
                  <Link
                    to="/account"
                    className="dropdown-item"
                    onClick={() => setShowMenu(false)}
                  >
                    👤 View Profile
                  </Link>

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    ↪ Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  🔐 Login
                </Link>
              )}

            </div>
          )}

        </div>
      )}

    </nav>
  );
}

export default Navbar;