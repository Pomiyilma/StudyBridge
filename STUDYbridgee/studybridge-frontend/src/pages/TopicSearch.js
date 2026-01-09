// src/pages/TopicSearch.js
import { useState } from "react";
import api from "../../../backend/src/api/client";
import TopicCard from "../components/TopicCard";

export default function TopicSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    const { data } = await api.get("/topics/search", { params: { q } });
    setResults(data);
  };

  return (
    <div>
      <h2>Search Topics</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Keyword or tag"
      />
      <button onClick={search}>Search</button>
      <div>
        {results.map((t) => (
          <TopicCard key={t._id} topic={t} />
        ))}
      </div>
    </div>
  );
}
