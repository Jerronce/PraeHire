// backend/src/routes/auth.routes.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// FIX: Use correct relative path (../) and extension (.js) for models
import User from "../models/User.js"; 

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });
        
        // FIX: Ensure User model is accessed via default export
        const existing = await User.findOne({ email });
        
        if (existing) return res.status(409).json({ message: "User already exists" });
        
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, firstName, lastName });
        
        return res.status(201).json({ id: user._id, email: user.email });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // FIX: Ensure User model is accessed via default export
        const user = await User.findOne({ email });
        
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        
        // FIX: Check property on user object (e.g., user.passwordHash)
        const isMatch = await bcrypt.compare(password, user.passwordHash); 
        
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        
        // FIX: Ensure user object returns correct properties
        return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

// FIX: Export the router using default export for ES Module compatibility
export default router;