const functions = require('firebase-functions');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // API key from environment - NOT hard-coded
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

exports.interviewCoach = functions.https.onRequest(async (req, res) => {
  // Allow CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    // 1. Validate request
    if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Only POST requests allowed' });
    }
    
    const { systemPrompt, userPrompt } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
    }
    
    // 2. Validate input size
    if (systemPrompt.length > 50000 || userPrompt.length > 5000) {
      return res.status(400).json({ error: 'Input too large' });
    }
    
    // 3. Check if API key exists
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // 4. Call Gemini API with the key from environment
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: systemPrompt + '\n\nUser: ' + userPrompt
            }
          ]
        }
      ]
    });
    
    // 5. Extract and return response safely
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    return res.json({ aiResponse });
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    return res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});
