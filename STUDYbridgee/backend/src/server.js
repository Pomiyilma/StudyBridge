const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");

// Serve static frontend files
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// --- OpenAI API Key ---
// You can access it anywhere in your routes via process.env.OPENAI_API_KEY
console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "FOUND ✅" : "MISSING ❌"
);

// --- Connect Email/Auth DB ---
const authDB = mongoose.createConnection(process.env.MONGO_URI_EMAIL);
authDB.on("connected", () => console.log("✅ Auth DB connected"));
authDB.on("error", (err) => console.error("❌ Auth DB error:", err));

// --- Connect Main Dashboard DB ---
const mainDB = mongoose.createConnection(process.env.MONGO_URI_MAIN);
mainDB.on("connected", () => console.log("✅ Main DB connected"));
mainDB.on("error", (err) => console.error("❌ Main DB error:", err));

// --- Routes ---
// Pass the corresponding DB connection to the routes
app.use("/api/auth", require("./routes/auth")(authDB));
// Example main dashboard route:
app.use("/books", require("./routes/books")(mainDB));
const searchRoutes = require("./routes/search")(mainDB);
app.use("/api/search", searchRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
