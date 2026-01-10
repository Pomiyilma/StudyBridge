import React, { useState } from "react";
import "../css/account.css";
import { useNavigate } from "react-router-dom";
const Account = () => {
  const navigate = useNavigate();

  const [isRegisterActive, setIsRegisterActive] = useState(true);
  const [registerForm, setRegisterForm] = useState({ name: "", email: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // --- REGISTER HANDLER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email } = registerForm;

    if (!name || !email) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Registration failed");
        return;
      }

      alert("Verification code sent to your email");
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;

    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  return (
    <div
      className={`container ${isRegisterActive ? "active" : ""}`}
      id="container"
    >
      {/* REGISTER FORM */}
      <div className="form-container register">
        <form onSubmit={handleRegister}>
          <h1>Create account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            placeholder="Name"
            value={registerForm.name}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
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
            required
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />
          <a href="/forgetPassword">Forgot Your Password ?</a>
          <button type="submit">Log In</button>
        </form>
      </div>

      {/* TOGGLE PANEL */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome to StudyBridge!</h1>
            <p>Already have an account? Login to use all of site features</p>
            <button
              className="hidden"
              id="login-id"
              type="button"
              onClick={() => setIsRegisterActive(false)}
            >
              Log in
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>
              Don't have an account? Register with your personal details to use
              all of site features
            </p>
            <button
              className="hidden"
              id="register-id"
              type="button"
              onClick={() => setIsRegisterActive(true)}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
