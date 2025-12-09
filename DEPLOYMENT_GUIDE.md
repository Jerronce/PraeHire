# PraeHire Backend Deployment Guide

## Backend Setup Complete!

Your PraeHire backend has been successfully set up with:
- MongoDB integration for data persistence
- Google Gemini AI API integration
- JWT-based authentication
- AI routes for: Resume Analysis, Resume Tailoring, Interview Coaching, Cover Letter Generation

## Deploying to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your GitHub

### Step 2: Create New Web Service
1. Dashboard > New + > Web Service
2. Connect your GitHub repo (Jerronce/PraeHire)
3. Select main branch
4. Name: praehire-backend
5. Runtime: Node
6. Build Command: npm install
7. Start Command: npm run dev (or node backend/src/server.js)

### Step 3: Add Environment Variables
In Render dashboard, add:
- MONGO_URI: your MongoDB Atlas connection string
- JWT_SECRET: generate a random secret (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
- GEMINI_API_KEY: AIzaSyDj4g8jttY-xPsQ2JfP4ES8kz0ZcHPxNtk

### Step 4: Deploy
Click "Deploy" and wait for build to complete

## API Endpoints
Once deployed, your API will be available at: https://praehire-backend.onrender.com

### Auth Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### AI Endpoints (require JWT token)
- POST /api/ai/analyze-resume - Analyze resume
- POST /api/ai/tailor-resume - Tailor resume for job
- POST /api/ai/interview-coach - Get interview feedback
- POST /api/ai/cover-letter - Generate cover letter
- GET /api/ai/interview-sessions - Get all interview sessions

## Frontend Integration
Update your frontend API calls from Firebase to:
https://praehire-backend.onrender.com/api/...

Example:
```javascript
const response = await fetch('https://praehire-backend.onrender.com/api/ai/tailor-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ resumeText, jobDescription })
});
```
