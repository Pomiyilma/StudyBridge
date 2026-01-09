import React, { useState } from "react";
import axios from "axios";
import { setAuth } from "../state/auth"; // saves token + user in localStorage
import { useNavigate } from "react-router-dom"; // <-- import this
import "./account.css";

export default function LoginRegister() {
  const [active, setActive] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const navigate = useNavigate(); // <-- hook for navigation

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", registerData);
      setAuth(res.data); // save token + user
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      alert(
        "Registration failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", loginData);
      setAuth(res.data);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={`container ${active ? "active" : ""}`} id="container">
      {/* REGISTER FORM */}
      <div className="form-container register">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={registerData.name}
            onChange={(e) =>
              setRegisterData({ ...registerData, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />
          <button type="submit">Register</button>
        </form>
      </div>

      {/* LOGIN FORM */}
      <div className="form-container log-in">
        <form onSubmit={handleLogin}>
          <h1>Log In</h1>
          <span>or use your email and password</span>
          <input
            type="email"
            placeholder="Email"
            required
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <a href="#">Forgot Your Password?</a>
          <button type="submit">Log In</button>
        </form>
      </div>

      {/* TOGGLE PANELS */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome to StudyBridge!</h1>
            <p>Already have an account? Login to use all of site features</p>
            <button className="hidden" onClick={() => setActive(false)}>
              Log In
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>
              Don't have an account? Register with your personal details to use
              all of site features
            </p>
            <button className="hidden" onClick={() => setActive(true)}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
