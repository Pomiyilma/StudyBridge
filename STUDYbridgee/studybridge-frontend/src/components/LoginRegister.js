import React, { useState } from "react";
import axios from "axios";
import { setAuth } from "../state/auth";

export default function LoginRegister() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });
      console.log("Login response:", res.data); // ✅ debug
      setAuth(res.data); // saves { token, user } in localStorage
      alert(`Welcome ${res.data.user?.name}`); // safe access
    } catch (err) {
      alert("Login failed: " + err.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) =>
          setLoginData({ ...loginData, password: e.target.value })
        }
      />
      <button type="submit">Login</button>
    </form>
  );
}
