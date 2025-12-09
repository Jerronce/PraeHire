// backend/src/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    
    // FIX: Update role enum for PraeHire application logic
    role: { 
        type: String, 
        enum: ["candidate", "recruiter", "admin"], 
        default: "candidate" 
    },
    
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    isVerified: { type: Boolean, default: false }
}, { 
    timestamps: true 
});

const User = mongoose.model("User", userSchema);

// FIX: Export the model using default export for ES Module compatibility
export default User;