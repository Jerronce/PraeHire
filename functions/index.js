const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineSecret} = require('firebase-functions/params');

// Define the secret for the Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.tailorResume = onRequest(
  {cors: true, secrets: [geminiApiKey]},
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
      const apiKey = geminiApiKey.value();
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a professional resume writer. Tailor this resume to match the job description.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nProvide an optimized, professional resume tailored for this role.`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Gemini API error:', errorData);
        return res.status(response.status).json({
          error: errorData.error?.message || 'API request failed'
        });
      }

      const data = await response.json();
      const tailoredText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      res.json({tailoredResume: tailoredText});
    } catch (error) {
      logger.error('Error in tailorResume function:', error);
      res.status(500).json({error: 'Internal server error'});
    }
  }
);

// Interview Chat Function
exports.interviewChat = onRequest(
  {cors: true, secrets: [geminiApiKey]},
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {message} = req.body;

    if (!message) {
      return res.status(400).json({error: 'Missing message'});
    }

    try {
      const apiKey = geminiApiKey.value();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI interview assistant for PraeHire. Help users prepare for interviews by asking relevant interview questions and providing feedback. User message: ${message}`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Gemini API error:', errorData);
        return res.status(response.status).json({
          error: errorData.error?.message || 'API request failed'
        });
      }

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      res.json({response: aiResponse});
    } catch (error) {
      logger.error('Error in interviewChat function:', error);
      res.status(500).json({error: 'Internal server error'});
    }
  }
);
