import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates personalized guidance based on user profile and case details.
 * @param {Object} userProfile - User profile data.
 * @param {Object} caseDetails - Case details.
 * @returns {Promise<string>} AI-generated guidance.
 */
export const getPersonalizedGuidance = async (userProfile, caseDetails) => {
  const prompt = `Based on the following user profile and case details, provide personalized guidance:
User Profile: ${JSON.stringify(userProfile)}
Case Details: ${JSON.stringify(caseDetails)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

/**
 * Predicts potential challenges based on case details.
 * @param {Object} caseDetails - Case details.
 * @returns {Promise<string>} AI-generated predictions.
 */
export const predictCaseChallenges = async (caseDetails) => {
  const prompt = `Predict potential challenges for the following case: ${JSON.stringify(caseDetails)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

/**
 * Assists with form completion based on user input and case details.
 * @param {Object} formData - Form data.
 * @param {Object} caseDetails - Case details.
 * @returns {Promise<string>} AI-generated assistance.
 */
export const assistFormCompletion = async (formData, caseDetails) => {
  const prompt = `Assist with completing the following form based on the case details: ${JSON.stringify(formData)} Case Details: ${JSON.stringify(caseDetails)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

