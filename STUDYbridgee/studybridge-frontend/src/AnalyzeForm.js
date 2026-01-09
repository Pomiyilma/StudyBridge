import React, { useState } from "react";

function AnalyzeForm() {
  const [toc, setToc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!toc.trim()) {
      alert("Please paste a Table of Contents");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ toc })
      });

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError("Failed to connect to backend");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>StudyBridge – TOC Analyzer</h1>

      <textarea
        rows="6"
        placeholder="Paste your Table of Contents here..."
        value={toc}
        onChange={(e) => setToc(e.target.value)}
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />

      <br /><br />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Detected Relationships</h2>

          {result.relationships.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px"
              }}
            >
              <h3>{item.topicA} ↔ {item.topicB}</h3>

              <p><strong>{item.topicA}:</strong> {item.descriptionA}</p>
              <p><strong>{item.topicB}:</strong> {item.descriptionB}</p>

              <p><strong>Relationship:</strong> {item.relationship}</p>

              <ul>
                {item.resources.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalyzeForm;
