// src/pages/AdminSuggestions.js
import { useEffect, useState } from "react";
import api from "../api/client";
import { getUser } from "../state/auth";

export default function AdminSuggestions({ topicId }) {
  const [suggestions, setSuggestions] = useState([]);
  const user = getUser();
  const isAdmin = user?.roles?.includes("admin");

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) return;
      const { data } = await api.post(`/admin/suggest/${topicId}`);
      setSuggestions(data);
    };
    load();
  }, [topicId, isAdmin]);

  const approve = async (s) => {
    await api.post("/admin/approve", s);
    alert("Approved");
  };

  if (!isAdmin) return <p>Forbidden</p>;

  return (
    <div>
      <h3>AI-Assisted Suggestions</h3>
      {suggestions.map((s) => (
        <div key={s.toTopicId}>
          <span>{s.reason}</span>
          <button onClick={() => approve(s)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
