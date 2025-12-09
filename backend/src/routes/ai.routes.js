// backend/src/routes/ai.routes.js

import express from 'express';
// FIX: Use ES Module import for Google AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// FIX: Use correct relative path (../) and extension (.js) for models
import Resume from '../models/Resume.js';
import InterviewSession from '../models/InterviewSession.js';

// No need to import middleware here, as it's handled in server.js

const router = express.Router();

// Initialize AI model using environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Changed to a faster model

// POST /api/ai/analyze-resume
router.post('/analyze-resume', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ message: 'Resume text required' });
        }

        const prompt = `Analyze this resume and provide feedback on: 1) Strengths, 2) Areas for improvement, 3) Key skills highlighted, 4) Missing sections. Resume: ${resumeText}`;
        const result = await model.generateContent({contents: prompt});
        const analysis = result.text; // Access text directly

        return res.json({ analysis });
    } catch (err) {
        console.error('Analyze resume error:', err);
        return res.status(500).json({ message: 'Error analyzing resume' });
    }
});

// POST /api/ai/tailor-resume
router.post('/tailor-resume', async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ message: 'Resume and job description required' });
        }

        const prompt = `Tailor this resume for the following job description. Output only the tailored resume text.\n\nOriginal Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;
        const result = await model.generateContent({contents: prompt});
        const tailoredResume = result.text; // Access text directly

        // Save tailored resume to database
        const newResume = await Resume.create({
            userId: req.user.id, // FIX: Use req.user.id (from JWT)
            originalText: resumeText,
            tailoredText: tailoredResume,
            jobDescription,
        });

        return res.json({ tailoredResume, resumeId: newResume._id });
    } catch (err) {
        console.error('Tailor resume error:', err);
        return res.status(500).json({ message: 'Error tailoring resume' });
    }
});

// POST /api/ai/interview-coach
router.post('/interview-coach', async (req, res) => {
    try {
        const { question, userAnswer, role } = req.body;
        if (!question || !userAnswer) {
            return res.status(400).json({ message: 'Question and answer required' });
        }

        const prompt = `You are an interview coach. A candidate for a ${role || 'software engineer'} position answered this interview question. Provide constructive feedback on their answer.\n\nQuestion: ${question}\n\nCandidate's Answer: ${userAnswer}\n\nProvide: 1) Strengths, 2) Areas to improve, 3) Better answer example, 4) Score out of 10.`;
        const result = await model.generateContent({contents: prompt});
        const feedback = result.text;

        // Save interview session
        const session = await InterviewSession.create({
            userId: req.user.id, // FIX: Use req.user.id (from JWT)
            question,
            userAnswer,
            feedback,
            role,
        });

        return res.json({ feedback, sessionId: session._id });
    } catch (err) {
        console.error('Interview coach error:', err);
        return res.status(500).json({ message: 'Error processing interview feedback' });
    }
});

// GET /api/ai/interview-sessions
router.get('/interview-sessions', async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json({ sessions });
    } catch (err) {
        console.error('Fetch sessions error:', err);
        return res.status(500).json({ message: 'Error fetching sessions' });
    }
});

// POST /api/ai/cover-letter
router.post('/cover-letter', async (req, res) => {
    try {
        const { resumeText, jobDescription, companyName } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ message: 'Resume and job description required' });
        }

        const prompt = `Generate a professional cover letter based on this resume and job description for a position at ${companyName || 'the company'}.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nGenerate a compelling, personalized cover letter.`;
        const result = await model.generateContent({contents: prompt});
        const coverLetter = result.text;

        return res.json({ coverLetter });
    } catch (err) {
        console.error('Cover letter error:', err);
        return res.status(500).json({ message: 'Error generating cover letter' });
    }
});

// FIX: Export the router as a DEFAULT export to satisfy server.js import
export default router;