const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    passwordHash: String,
    googleAuthId: String,
    roles: { type: [String], default: ["user"] },
    interests: [String],
    gradeLevel: String,
    streakCount: { type: Number, default: 0 },
    lastActiveDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
