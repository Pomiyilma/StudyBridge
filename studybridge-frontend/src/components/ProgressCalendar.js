// src/components/ConnectionList.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ConnectionList({ connections = [] }) {
  const navigate = useNavigate();

  if (!connections.length) {
    return <p>No links yet. (Run rebuild-links / add tags)</p>;
  }

  return (
    <div>
      {connections.map((c, idx) => (
        <div
          key={idx}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            marginTop: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/topics/${c.topicId?._id}`)}
        >
          <b>{c.topicId?.title}</b>
          <div>
            <small>Context: {c.subjectContext}</small>
          </div>
          <div>{c.reason}</div>
        </div>
      ))}
    </div>
  );
}
