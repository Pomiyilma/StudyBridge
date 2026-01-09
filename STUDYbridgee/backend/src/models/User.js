module.exports = (connection) => {
  const mongoose = require("mongoose");

  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpiry: Date,
    resetCode: String,
    resetCodeExpires: Date,
  });

  // This avoids recompiling the model if already exists
  return connection.models.User || connection.model("User", UserSchema);
};
