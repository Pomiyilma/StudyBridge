const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

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

// --- ROUTES ---
// Auth routes (use Auth DB)
app.use("/api/auth", require("./routes/auth")(authDB));

// ⭐ Profile routes (also uses Auth DB)
app.use("/api/profile", require("./routes/profileRoutes")(authDB));

// Example main route
app.use("/books", require("./routes/books")(mainDB));

const searchRoutes = require("./routes/search")(mainDB);
app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
