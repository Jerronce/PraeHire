// backend/src/server.js

// 1. Module Imports and Environment Configuration
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// FIX: Specify the path for dotenv since .env is inside the src directory
// This must run before environment variables are accessed.
dotenv.config({ path: './src/.env' }); 

// Import local files using ES Module syntax
import connectDB from './config/db.js'; 
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
// FIX: Import the protect middleware as a default export 
// (or ensure your middleware exports it as 'protect' if you use named imports)
import { protect } from './middleware/authMiddleware.js'; 


// 2. Initialize App and Middleware
const app = express();

app.use(cors()); 
app.use(express.json()); 

// 3. Database Connection
connectDB(); 

// 4. Define Routes

// Root Route
app.get("/", (req, res) => {
    res.json({ message: "PraeHire Backend is running" });
});

// Primary Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", protect, aiRoutes); // Protected by JWT
app.use("/api/jobs", protect, jobRoutes); // Protected by JWT
app.use("/api/applications", protect, applicationRoutes); // Protected by JWT

// Protected Route Example (Get Current User Info)
app.get("/api/me", protect, (req, res) => {
    res.json({ user: req.user });
});

// 5. Error Handling Middleware
// This catches errors thrown by asynchronous functions in Express
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
    });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Note: No 'module.exports = app;' when using ES Modules.