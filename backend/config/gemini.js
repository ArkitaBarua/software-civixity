require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ Missing Gemini API key');
    console.error('Please set GEMINI_API_KEY in your .env file');
    process.exit(1);
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  console.log('✅ Gemini AI client initialized');
};

const getGeminiModel = () => {
  if (!model) {
    throw new Error('Gemini model not initialized. Call initializeGemini() first.');
  }
  return model;
};

const generateResponse = async (prompt, context = '') => {
  try {
    const model = getGeminiModel();
    
    const fullPrompt = `
You are a civic assistant for the Civixity platform. Answer user questions about their city, civic issues, and community engagement.

${context ? `Context from database: ${context}` : ''}

User question: ${prompt}

Instructions:
- Do NOT include greetings, pleasantries, or sign-offs.
- Do NOT use emojis.
- Respond directly and concisely, focusing only on the requested information.
- Use markdown formatting for headings, bold, italics, and lists to make the response visually appealing.

Response:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate AI response');
  }
};

module.exports = {
  initializeGemini,
  getGeminiModel,
  generateResponse
}; 