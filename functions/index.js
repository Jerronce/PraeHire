const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");
const {GoogleGenerativeAI} = require("@google/generative-ai");

// 1. Define the secret using the name you set in Cloud Shell
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Tailor Resume Function
exports.tailorResume = onRequest(
  {cors: true, secrets: [geminiApiKey]},
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

    const {resumeText, jobDescription} = req.body;
    if (!resumeText || !jobDescription) return res.status(400).json({error: 'Missing fields'});

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert resume writer. Tailor this resume to match the job description.
      Job Description: ${jobDescription}
      Resume: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const tailoredResume = result.response.text();
      
      res.json({tailoredResume});
    } catch (error) {
      logger.error('Error in tailorResume:', error);
      res.status(500).json({error: 'Failed to tailor resume'});
    }
  }
);

// Interview Coach Function
exports.interviewCoach = onRequest(
  {cors: true, secrets: [geminiApiKey]},
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

    const {systemPrompt, userPrompt} = req.body;
    
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const fullPrompt = `${systemPrompt}\nCandidate says: ${userPrompt}`;
      const result = await model.generateContent(fullPrompt);
      
      res.json({ aiResponse: result.response.text() });
    } catch (error) {
      logger.error('Error in interviewCoach:', error);
      res.status(500).json({error: 'Failed to process coach session'});
    }
  }
);
