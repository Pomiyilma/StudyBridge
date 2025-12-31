// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/resources", require("./routes/resources"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/admin", require("./routes/admin"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on ${port}`));
