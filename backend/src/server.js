require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'PraeHire Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);
app.use('/api/applications', authMiddleware, applicationRoutes);

// Protected route example
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;