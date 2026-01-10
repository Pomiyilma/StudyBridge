// src/pages/TopicDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function TopicDetails() {
  const { id } = useParams(); // current topic ID
  const [topic, setTopic] = useState(null);

  async function loadTopic() {
    try {
      const res = await axios.get(`http://localhost:4000/api/topics/${id}`);
      setTopic(res.data);
    } catch (err) {
      console.error("Error fetching topic:", err);
    }
  }

  useEffect(() => {
    loadTopic();
  }, [id]);

  // ✅ Directly connect to another topic
  async function connectTo(targetId) {
    try {
      await axios.post(
        `http://localhost:4000/api/topics/${id}/connect/${targetId}`
      );
      await loadTopic(); // refresh with new connection
    } catch (err) {
      console.error("Error connecting topics:", err);
    }
  }

  if (!topic) return <p>Loading...</p>;

  return (
    <div>
      <h1>{topic.title}</h1>
      <p>{topic.description}</p>

      <h3>Connections</h3>
      {topic.connections?.length ? (
        <ul>
          {topic.connections.map((conn) => (
            <li key={conn._id}>
              {/* Clicking here will connect AND navigate */}
              <button
                onClick={() => connectTo(conn._id)}
                style={{ marginRight: "8px" }}
              >
                Connect to {conn.title}
              </button>
              <Link to={`/topics/${conn._id}`}>{conn.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No connections yet.</p>
      )}

      {/* Navigate to Dashboard with sourceId */}
      <div style={{ marginTop: 20 }}>
        <Link to={`/dashboard?source=${id}`}>
          <button>Connect this topic to another</button>
        </Link>
      </div>
    </div>
  );
}
