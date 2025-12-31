// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("");
  const location = useLocation();

  // Extract sourceId from query string (e.g., /dashboard?source=123)
  const params = new URLSearchParams(location.search);
  const sourceId = params.get("source");

  // Load topics from backend
  async function loadTopics() {
    try {
      const url = tag
        ? `${API_BASE}/api/topics?tag=${encodeURIComponent(tag)}`
        : `${API_BASE}/api/topics`;
      const res = await axios.get(url);
      setTopics(res.data);
    } catch (err) {
      console.error("Error loading topics:", err);
    }
  }

  useEffect(() => {
    loadTopics();
  }, [tag]);

  // Manual connect and navigate
  async function connectAndNavigate(targetId) {
    try {
      if (sourceId) {
        await axios.post(
          `${API_BASE}/api/topics/${sourceId}/connect/${targetId}`
        );
      }
      window.location.href = `/topics/${targetId}`;
    } catch (err) {
      console.error("Error connecting topics:", err);
    }
  }

  // Run rule-based auto-connect
  async function runAutoConnect() {
    try {
      setStatus("Running auto-connect...");
      await axios.post(`${API_BASE}/api/topics/auto-connect`);
      await loadTopics(); // refresh list
      setStatus("Auto-connect completed ✅");
    } catch (err) {
      console.error("Error running auto-connect:", err);
      setStatus("Auto-connect failed ❌");
    }
  }

  return (
    <div
      style={{
        padding: "50px",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <h1>Dashboard</h1>

      {/* Auto-connect */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={runAutoConnect}>Run Auto-Connect</button>
        {status && <p>{status}</p>}
      </div>

      {/* Tag filter */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Filter by tag e.g., math"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ padding: "6px", width: "250px" }}
        />
      </div>

      {/* Topic list */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {topics.map((t) => (
          <li
            key={t._id}
            style={{
              marginBottom: "16px",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => connectAndNavigate(t._id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              <h3 style={{ margin: 0 }}>{t.title}</h3>
            </button>
            <p>{t.description}</p>
            {t.tags?.length ? <small>Tags: {t.tags.join(", ")}</small> : null}

            {/* Connections as tags */}
            {t.connections?.length ? (
              <div style={{ marginTop: "8px" }}>
                <strong>Connected Topics: </strong>
                {Array.from(new Set(t.connections.map((c) => c._id))).map(
                  (id) => {
                    const conn = t.connections.find((c) => c._id === id);
                    return (
                      <button
                        key={id}
                        onClick={() =>
                          (window.location.href = `/topics/${conn._id}`)
                        }
                        style={{
                          margin: "2px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "#e0e0e0",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {conn.title} ({conn.reason || "rule"})
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <small>No connections yet</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
