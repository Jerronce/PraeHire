// backend/src/server.js

// 1. Module Imports
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Import local files
import connectDB from './config/db.js'; 
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js'; // Existing: Job Routes
import applicationRoutes from './routes/application.routes.js'; // NEW: Application Routes
import { protect } from './middleware/authMiddleware.js'; 

// Load environment variables from .env file
// FIX: Specify the path because .env is inside the src directory
dotenv.config({ path: './src/.env' }); 

// 2. Initialize App and Middleware
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Allows parsing of JSON request bodies

// 3. Connect to Database
connectDB(); 

// 4. Define Routes

// Root Route
app.get("/", (req, res) => {
    res.json({ message: "PraeHire backend is running" });
});

// Authentication Routes (e.g., /api/auth/register, /api/auth/login)
app.use("/api/auth", authRoutes);

// Job Routes (e.g., /api/jobs, /api/jobs/:id)
app.use("/api/jobs", jobRoutes); 

// Application Routes (e.g., /api/applications, /api/applications/:jobId)
app.use("/api/applications", applicationRoutes); // NEW: Register Application Routes

// Protected Route Example (Get Current User Info)
app.get("/api/me", protect, (req, res) => {
    res.json({ user: req.user });
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));