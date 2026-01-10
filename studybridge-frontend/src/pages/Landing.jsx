import { useNavigate } from "react-router-dom";
import "../css/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div id="sb-landing-wrap">
      {/* Navbar stays at the top */}
      <nav className="sb-nav">
        <div
          style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-1px" }}
        >
          StudyBridge
        </div>
        <button
          onClick={() => navigate("/account")}
          className="sb-btn"
          style={{ padding: "12px 25px", fontSize: "0.85rem" }}
        >
          CREATE FREE ACCOUNT
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="hero-content">
        <h1 className="vibrant-title">
          BRIDGE THE <br /> SCIENCES
        </h1>
        <p
          style={{
            fontSize: "1.3rem",
            color: "#94a3b8",
            maxWidth: "800px",
            margin: "0 auto 50px",
          }}
        >
          Designed for Ethiopia's future scientists. Connect Biology, Chemistry,
          and Physics to excel in your National Entrance Exam.
        </p>
      </main>

      {/* Feature Grid with Moving Images */}
      <section className="sb-grid">
        <div className="sb-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3079/3079237.png"
            alt="Biology"
          />
          <h2 style={{ fontSize: "1.8rem" }}>BIOLOGY</h2>
          <p style={{ color: "#64748b", marginTop: "10px" }}>
            Mastering life systems.
          </p>
        </div>
        <div className="sb-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/9376/9376483.png"
            alt="Chemistry"
          />
          <h2 style={{ fontSize: "1.8rem" }}>CHEMISTRY</h2>
          <p style={{ color: "#64748b", marginTop: "10px" }}>
            The logic of reactions.
          </p>
        </div>
        <div className="sb-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3593/3593461.png"
            alt="Physics"
          />
          <h2 style={{ fontSize: "1.8rem" }}>PHYSICS</h2>
          <p style={{ color: "#64748b", marginTop: "10px" }}>
            Mathematical movement.
          </p>
        </div>
      </section>

      {/* Integrated About Section */}
      <section className="about-box">
        <h2
          style={{
            fontSize: "2.5rem",
            marginBottom: "20px",
            color: "var(--neon-blue)",
          }}
        >
          Why StudyBridge?
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#cbd5e1",
            maxWidth: "900px",
            margin: "0 auto 30px",
            lineHeight: "1.8",
          }}
        >
          In Ethiopia, students often learn subjects as isolated topics.
          StudyBridge uses modern visualization and interconnected curricula to
          show how these subjects work together. Master the Grade 12 National
          Exam by understanding the <b>Science Synergy.</b>
        </p>
        <button
          onClick={() => navigate("/account")}
          className="sb-btn"
          style={{
            background: "none",
            border: "2px solid white",
            boxShadow: "none",
          }}
        >
          JOIN US
        </button>
      </section>

      <footer className="footer">
        © 2026 StudyBridge Ethiopia 🇪🇹 • Built for Excellence.
      </footer>
    </div>
  );
}
