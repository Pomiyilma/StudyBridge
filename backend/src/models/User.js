module.exports = (connection) => {
  const mongoose = require("mongoose");

  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // optional initially

    grade: { type: Number, default: null },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxLength: 300 },

    isVerified: { type: Boolean, default: false },

    verificationCode: Number,
    verificationCodeExpiry: Date,

    resetCode: String,
    resetCodeExpires: Date,
  });

  // Optional: password is required only for verified users
  UserSchema.path("password").validate(function (value) {
    if (this.isVerified && !value) {
      throw new Error("Password is required for verified users");
    }
  }, null);

  return connection.models.User || connection.model("User", UserSchema);
};
