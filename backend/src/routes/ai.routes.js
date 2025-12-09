const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// POST /api/ai/analyze-resume
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text required' });
    }

    const prompt = `Analyze this resume and provide feedback on: 1) Strengths, 2) Areas for improvement, 3) Key skills highlighted, 4) Missing sections. Resume: ${resumeText}`;
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

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
    const result = await model.generateContent(prompt);
    const tailoredResume = result.response.text();

    // Save tailored resume to database
    const newResume = await Resume.create({
      userId: req.user.userId,
      originalText: resumeText,
      tailoredText: tailoredResume,
      jobDescription,
      createdAt: new Date()
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
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    // Save interview session
    const session = await InterviewSession.create({
      userId: req.user.userId,
      question,
      userAnswer,
      feedback,
      role,
      createdAt: new Date()
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
    const sessions = await InterviewSession.find({ userId: req.user.userId }).sort({ createdAt: -1 });
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
    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text();

    return res.json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    return res.status(500).json({ message: 'Error generating cover letter' });
  }
});

module.exports = router;