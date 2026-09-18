import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Login successful
    navigate("/");
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo / Heading */}
        <div className="login-header">
          <div className="login-icon">🐾</div>

          <h1>Welcome Back</h1>

          <p>
            Sign in to continue helping paws find their way home.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Signup */}
        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Create one</Link>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;