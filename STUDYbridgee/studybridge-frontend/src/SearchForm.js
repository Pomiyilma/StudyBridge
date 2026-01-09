import React, { useEffect, useState } from "react";

function SearchForm({ onSearch, externalTopic }) {
  const [topic, setTopic] = useState("");

  // This allows the search box to update automatically when 
  // a student clicks a "Related Concept" in the results!
  useEffect(() => {
    if (externalTopic) {
      setTopic(externalTopic);
    }
  }, [externalTopic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim() === "") return;
    onSearch(topic);
    // We don't clear the topic anymore so the user knows what they searched for
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", textAlign: "center" }}>
      <input
        type="text"
        placeholder="Search a topic (e.g. Energy)..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{
          padding: "12px",
          width: "70%",
          maxWidth: "400px",
          borderRadius: "8px 0 0 8px",
          border: "1px solid #3498db",
          outline: "none"
        }}
      />
      <button
        type="submit"
        style={{
          padding: "12px 25px",
          borderRadius: "0 8px 8px 0",
          border: "none",
          backgroundColor: "#3498db",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Build Bridge
      </button>
    </form>
  );
}

export default SearchForm;