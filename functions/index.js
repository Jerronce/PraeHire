const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");
const OpenAI = require("openai");

// 1. FIXED: Define the secret for the OpenAI API using the name from your Google Cloud Console
const openaiApiKey = defineSecret("praehire"); 

// Helper function to initialize OpenAI client
function getOpenAIClient(apiKey) {
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Tailor Resume Function
exports.tailorResume = onRequest(
  // 2. FIXED: Use the defined variable name 'openaiApiKey' in the secrets array
  {cors: true, secrets: [openaiApiKey]}, 
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {resumeText, jobDescription} = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({error: 'Missing required fields'});
    }

    try {
      const openai = getOpenAIClient(openaiApiKey.value());

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Tailor the provided resume to match the job description while maintaining accuracy and professionalism."
          },
          {
            role: "user",
            content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nPlease tailor this resume to match the job description. Keep the format professional and highlight relevant skills and experience.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const tailoredResume = completion.choices[0].message.content;
      res.json({tailoredResume});
    } catch (error) {
      logger.error('Error in tailorResume:', error);
      res.status(500).json({error: 'Failed to tailor resume'});
    }
  }
);

// Interview Chat Function
exports.interviewchat = onRequest(
  {cors: true, secrets: [openaiApiKey]},
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {message, conversationHistory, interviewType, difficulty} = req.body;

    if (!message) {
      return res.status(400).json({error: 'Message is required'});
    }

    try {
      const openai = getOpenAIClient(openaiApiKey.value());

      const systemPrompt = `You are an experienced interview coach conducting a ${interviewType || 'technical'} interview at ${difficulty || 'beginner'} level. Ask relevant questions, provide feedback, and help the candidate improve their interview skills. Be professional, encouraging, and provide constructive feedback.`;

      const messages = [
        {role: "system", content: systemPrompt},
        ...(conversationHistory || []),
        {role: "user", content: message}
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const reply = completion.choices[0].message.content;
      res.json({reply});
    } catch (error) {
      logger.error('Error in interviewchat:', error);
      res.status(500).json({error: 'Failed to process interview chat'});
    }
  }
);

// Analyze Resume Function
exports.analyzeResume = onRequest(
  {cors: true, secrets: [openaiApiKey]},
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {resumeText} = req.body;

    if (!resumeText) {
      return res.status(400).json({error: 'Resume text is required'});
    }

    try {
      const openai = getOpenAIClient(openaiApiKey.value());

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume reviewer. Analyze the resume and provide detailed feedback on strengths, weaknesses, and suggestions for improvement."
          },
          {
            role: "user",
            content: `Please analyze this resume and provide constructive feedback:\n\n${resumeText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const analysis = completion.choices[0].message.content;
      res.json({analysis});
    } catch (error) {
      logger.error('Error in analyzeResume:', error);
      res.status(500).json({error: 'Failed to analyze resume'});
    }
  }
);