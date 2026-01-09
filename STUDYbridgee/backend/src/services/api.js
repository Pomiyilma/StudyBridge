// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:4000/api"; // backend base URL

// Search topics
export async function searchTopics(q) {
  const res = await axios.get(
    `${API_BASE}/topics/search?q=${encodeURIComponent(q)}`
  );
  return res.data;
}

// Get single topic
export async function getTopic(id) {
  const res = await axios.get(`${API_BASE}/topics/${id}`);
  return res.data;
}
