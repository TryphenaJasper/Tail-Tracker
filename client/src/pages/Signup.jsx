import { useState } from "react"; 
import { useNavigate, Link } from "react-router-dom"; 
import { supabase } from "../services/supabaseClient"; 
import "../styles/Login.css"; 
 
function Signup() { 
  const navigate = useNavigate(); 
 
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [phone, setPhone] = useState(""); 
  const [location, setLocation] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 
 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [success, setSuccess] = useState("");
 
  const handleSignup = async (e) => { 
    e.preventDefault(); 
 
    setError(""); 
    setSuccess("");
    setLoading(true); 
 
    // Check passwords 
    if (password !== confirmPassword) { 
      setError("Passwords do not match."); 
      setLoading(false); 
      return; 
    } 
 
    if (password.length < 6) { 
      setError("Password must be at least 6 characters long."); 
      setLoading(false); 
      return; 
    } 
 
    try { 
      // Create Supabase Auth account 
      const { 
        data: { user }, 
        error: signupError, 
      } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            phone,
            location,
          },
        },
      }); 
 
      if (signupError) { 
        setError(signupError.message); 
        setLoading(false); 
        return; 
      } 
 
      if (!user) { 
        setError("Could not create account."); 
        setLoading(false); 
        return; 
      } 
 
      // Signup successful 
      setSuccess(
  "Account created successfully! Please check your email and confirm your account before signing in."
);
setLoading(false);
    } catch (err) { 
      console.error("Signup error:", err); 
      setError("Something went wrong. Please try again."); 
      setLoading(false); 
    } 
  }; 
 
  return ( 
    <div className="login-page"> 
 
      <div className="login-card"> 
 
        {/* Logo / Heading */} 
        <div className="login-header"> 
 
          <div className="login-icon">🐾</div> 
 
          <h1>Create Account</h1> 
 
          <p> 
            Join Tail Tracker and help paws find their way home. 
          </p> 
 
        </div> 
 
        {/* Signup Form */} 
        <form onSubmit={handleSignup} className="login-form"> 
 
          <div className="form-group"> 
            <label htmlFor="name">Full Name</label> 
 
            <input 
              type="text" 
              id="name" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            /> 
          </div> 
 
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
            <label htmlFor="phone">Phone</label> 
 
            <input 
              type="tel" 
              id="phone" 
              placeholder="Enter your phone number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            /> 
          </div> 
 
          <div className="form-group"> 
            <label htmlFor="location">Location</label> 
 
            <input 
              type="text" 
              id="location" 
              placeholder="Enter your location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
            /> 
          </div> 
 
          <div className="form-group"> 
            <label htmlFor="password">Password</label> 
 
            <input 
              type="password" 
              id="password" 
              placeholder="Create a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            /> 
          </div> 
 
          <div className="form-group"> 
            <label htmlFor="confirmPassword"> 
              Confirm Password 
            </label> 
 
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="Confirm your password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            /> 
          </div> 
 
          {/* Error message */} 
          {error && ( 
            <p className="login-error"> 
              {error} 
            </p> 
          )}
          {success && (
  <p className="login-success">
    {success}
  </p>
)}
 
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading} 
          > 
            {loading ? "Creating account..." : "Create Account"} 
          </button> 
 
        </form> 
 
        {/* Login */} 
        <div className="login-footer"> 
 
          <p> 
            Already have an account?{" "} 
            <Link to="/login">Sign in</Link> 
          </p> 
 
        </div> 
 
      </div> 
 
    </div> 
  ); 
} 
 
export default Signup;