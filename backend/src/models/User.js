const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
