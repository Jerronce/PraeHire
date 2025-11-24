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

// Resume Analysis Function - Analyzes resume and provides comprehensive feedback
exports.analyzeResume = onRequest(
  {cors: true, secrets: [geminiApiKey]},
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {resumeText, jobDescription} = req.body;

    if (!resumeText) {
      return res.status(400).json({error: 'Missing resume text'});
    }

    try {
      const apiKey = geminiApiKey.value();
      
      // Create comprehensive prompt for resume analysis
      let analysisPrompt = `You are a professional resume analyst and career advisor. Analyze the following resume and provide detailed feedback in JSON format.

Resume:
${resumeText}
`;

      if (jobDescription && jobDescription.trim()) {
        analysisPrompt += `\nJob Description:
${jobDescription}

Please tailor the analysis and optimization for this specific job.
`;
      }

      analysisPrompt += `
Provide your response in the following JSON format:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "recommendations": "detailed recommendations text",
  "keywords": ["keyword1", "keyword2", ...],
  "optimizedResume": "full optimized resume text tailored for the job"
}

For the optimizedResume field, provide a complete, professionally formatted resume that is optimized for the job description (if provided) or improved based on best practices. Make it ATS-friendly and highlight relevant skills and achievements.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: analysisPrompt
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

      // Try to parse JSON from the response
      // The AI might return markdown code blocks, so we need to extract the JSON
      let jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/);
      if (!jsonMatch) {
        jsonMatch = aiResponse.match(/```\s*([\s\S]*?)```/);
      }
      
      let analysisData;
      try {
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : aiResponse.trim();
        analysisData = JSON.parse(jsonStr);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON:', parseError);
        // Return a fallback response
        analysisData = {
          score: 75,
          strengths: ['Professional formatting', 'Clear structure'],
          improvements: ['Add more quantifiable achievements', 'Include keywords from job description'],
          recommendations: aiResponse,
          keywords: [],
          optimizedResume: 'Unable to generate optimized resume. Please try again.'
        };
      }

      // Ensure all required fields exist
      const result = {
        score: analysisData.score || 75,
        strengths: analysisData.strengths || [],
        improvements: analysisData.improvements || [],
        recommendations: analysisData.recommendations || 'No specific recommendations.',
        keywords: analysisData.keywords || [],
        optimizedResume: analysisData.optimizedResume || resumeText
      };

      res.json(result);
    } catch (error) {
      logger.error('Error in analyzeResume function:', error);
      res.status(500).json({error: 'Internal server error: ' + error.message});
    }
  }
);
