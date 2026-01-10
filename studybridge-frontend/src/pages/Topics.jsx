import { useEffect, useState } from "react";

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/topics");
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  // 1️⃣ Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // 2️⃣ Auto-connect (RULE-BASED)
  const autoConnect = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:4000/api/topics/auto-connect", {
        method: "POST",
      });
      alert("Auto-connect completed");
      // Re-fetch topics after connections created
      await fetchTopics();
    } catch (err) {
      console.error("Auto-connect failed:", err);
      alert("Auto-connect failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={autoConnect} disabled={loading}>
        {loading ? "Processing..." : "Auto Connect"}
      </button>

      <h2>Topics</h2>
      <ul>
        {topics.map((t) => (
          <li key={t._id}>
            {t.title}{" "}
            {t.connections?.length > 0 && (
              <span>
                → Connected to: {t.connections.map((c) => c.title).join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Topics;
