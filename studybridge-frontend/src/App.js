import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Account from "./pages/account_temp";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/verify_temp";
import ForgetPassword from "./pages/ForgetPassword";
import ProfileDashboard from "./components/ProfileDashboard"; // ⭐ Updated path

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Login / Register */}
        <Route path="/account" element={<Account />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/account" />}
        />

        {/* ⭐ Protected Profile Dashboard */}
        <Route
          path="/profile"
          element={token ? <ProfileDashboard /> : <Navigate to="/account" />}
        />

        {/* Verify */}
        <Route path="/verify" element={<Verify />} />

        {/* Forget Password */}
        <Route path="/forgetPassword" element={<ForgetPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
