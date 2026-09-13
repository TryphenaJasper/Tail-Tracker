import { Link } from "react-router-dom";
import "../styles/components.css";

function Navbar() {
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

      {/* Account */}
      <Link to="/account" className="navbar-account">
        <span className="user-circle">👤</span>
        
      </Link>

    </nav>
  );
}

export default Navbar;