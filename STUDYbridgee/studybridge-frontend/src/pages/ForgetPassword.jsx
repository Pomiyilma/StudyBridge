import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/account.css"; // Using your existing CSS for consistency

function ForgetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: reset password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1: Send verification code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return setMessage("Please enter your email.");
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage("Code sent to your email!");
      } else {
        setMessage(data.error || data.msg || "Failed to send code.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) return setMessage("Please enter the code you received.");
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/verify-reset-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await res.json();
      console.log("VERIFY RESPONSE:", res.ok, data);
      if (res.ok) {
        setStep(3);
        setMessage("Code verified! Enter your new password.");
      } else {
        setMessage(data.error || data.msg || "Invalid code.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return setMessage("Please fill both password fields.");
    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successfully!");
        setTimeout(() => {
          navigate("/account"); // Redirects back to your Login/Register page
        }, 2000);
      } else {
        setMessage(data.error || data.msg || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container active"
      id="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="form-container"
        style={{ left: 0, width: "100%", opacity: 1, zIndex: 5 }}
      >
        {/* We use a standard form tag to match your account.css button/input styles */}
        <form
          onSubmit={
            step === 1
              ? handleSendCode
              : step === 2
              ? handleVerifyCode
              : handleResetPassword
          }
        >
          <h1>
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify Code"}
            {step === 3 && "New Password"}
          </h1>

          <span style={{ margin: "10px 0", color: "#333" }}>
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && `Code sent to ${email}`}
            {step === 3 && "Create a strong new password"}
          </span>

          {message && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "5px",
                fontSize: "13px",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              {message}
            </div>
          )}

          {step === 1 && (
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {step === 2 && (
            <input
              type="text"
              placeholder="6-Digit Code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          )}

          {step === 3 && (
            <>
              <input
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading
              ? "Processing..."
              : step === 1
              ? "Send Code"
              : step === 2
              ? "Verify"
              : "Reset Password"}
          </button>

          <a
            href="/account"
            onClick={() => navigate("/account")}
            style={{ marginTop: "15px" }}
          >
            Back to Login
          </a>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
