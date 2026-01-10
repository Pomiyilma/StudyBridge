import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  // --- VERIFY CODE HANDLER ---
  const handleVerifyCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg);
        return;
      }

      setMessage("Code verified. Create your password.");
      setIsCodeVerified(true);
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again.");
    }
  };

  // --- COMPLETE REGISTRATION HANDLER ---
  const handleCompleteRegistration = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register-complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      alert("Registration complete! Please log in.");
      navigate("/"); // back to Account.jsx
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  return (
    <>
      {/* CSS inside JSX */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          min-height: 100vh;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: #ffffff;
          width: 100%;
          max-width: 420px;
          padding: 30px;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .container h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #1e293b;
        }
        .container input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 15px;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .container input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .container input[readonly] {
          background-color: #f1f5f9;
          cursor: not-allowed;
        }
        .container button {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .container button:hover {
          background: #1d4ed8;
        }
        .container button:active {
          transform: scale(0.98);
        }
        #message {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
        }
        #password-step {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .container {
            margin: 16px;
            padding: 24px;
          }
        }
      `}</style>

      {/* JSX */}
      <div className="container">
        {!isCodeVerified ? (
          <div id="verify-step">
            <h2>Verify Email</h2>
            <input type="email" value={email} readOnly />
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={handleVerifyCode}>Verify Code</button>
          </div>
        ) : (
          <div id="password-step">
            <h2>Create Password</h2>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button onClick={handleCompleteRegistration}>
              Complete Registration
            </button>
          </div>
        )}

        <p id="message" style={{ color: isCodeVerified ? "green" : "red" }}>
          {message}
        </p>
      </div>
    </>
  );
};

export default Verify;
