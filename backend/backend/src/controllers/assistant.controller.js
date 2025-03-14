const OpenAI = require('openai');
const Assistant = require('../models/assistant.model');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle AI assistant queries
exports.handleQuery = async (req, res) => {
  try {
    const { query } = req.body;

    // Send query to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an immigration assistant. Provide clear and concise answers to immigration-related queries.'
        },
        { 
          role: 'user', 
          content: query 
        }
      ],
      max_tokens: 500,
    });

    // Save query and response to database
    const assistantEntry = await Assistant.create({
      query,
      response: response.choices[0].message.content,
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      response: assistantEntry.response,
    });
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process query',
    });
  }
};

// Get conversation history
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Assistant.find({ 
      user: req.user.id 
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

