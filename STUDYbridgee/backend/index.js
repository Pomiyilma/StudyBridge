const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- DEBUG LOGS ---
console.log("--- Environment Check ---");
console.log("Current Directory:", __dirname);
console.log(
  "MONGO_URI value:",
  process.env.MONGO_URI ? "FOUND ✅" : "NOT FOUND ❌"
);
console.log("------------------------");

// Routes
app.use("/books", require("./src/routes/books"));
app.use("/analyze", require("./src/routes/analyze"));
app.use("/api/search", require("./src/routes/search"));
app.use("/api/auth", require("./src/routes/auth"));

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.log("❌ MongoDB connection error:", err));
} else {
  console.log(
    "❌ CRITICAL ERROR: MONGO_URI is missing. Make sure your file is named exactly .env and is in the backend folder."
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StudyBridge Server running on port ${PORT}`);
});
