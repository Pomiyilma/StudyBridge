// src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // ✅ add Link here
import Login from "./pages/Login";
import TopicSearch from "./pages/TopicSearch";
import TopicDetails from "./pages/TopicDetails";
import AdminSuggestions from "./pages/AdminSuggestions";
import Dashboard from "./pages/Dashboard";
import About from "./pages/AboutUs";
import Profile from "./pages/Profile";
import Topics from "./pages/Topics";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/topics" element={<Topics />} />
        <Route path="/" element={<TopicSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/topics/:id" element={<TopicDetails />} />
        <Route path="/admin/suggestions/:id" element={<AdminSuggestions />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
