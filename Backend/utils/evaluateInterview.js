const axios = require("axios");

/**
 * Evaluate the interview transcript using OpenRouter AI
 * @param {Object} params
 * @param {string} params.roleName - The role being assessed
 * @param {string} params.projectTitle - Title of the project
 * @param {string} params.transcript - The transcript of the user's answers
 * @returns {Promise<Object>} - Object with score and summary
 */
const evaluateInterview = async ({ roleName, projectTitle, transcript }) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error("AI API Key is not configured in environment variables.");
  }

  const prompt = `You are an expert technical interviewer. Evaluate the candidate's performance for the role of "${roleName}" on a project called "${projectTitle}" based on the following transcript of their interview answers.
  
Transcript:
"${transcript}"

Evaluate their technical understanding, communication skills, and relevance to the role.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "score": (a number between 0 and 100),
  "summary": "(A brief 2-3 sentence summary of your evaluation highlighting strengths and weaknesses)"
}
`;

  try {
    const isGemini = OPENROUTER_API_KEY === process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY;
    const url = isGemini 
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
      : "https://openrouter.ai/api/v1/chat/completions";

    let content;

    if (isGemini) {
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        },
        { headers: { "Content-Type": "application/json" } }
      );
      content = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } else {
      const response = await axios.post(
        url,
        {
          model: "openrouter/auto",
          messages: [
            {
              role: "system",
              content: "You are a technical assessment grader. Always respond with valid JSON only, no markdown.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
            "X-Title": "ConnectSphere Assessment",
          },
        }
      );
      content = response.data.choices?.[0]?.message?.content?.trim();
    }

    if (!content) {
      throw new Error("Empty response from AI API");
    }

    // Strip markdown code blocks if present
    let cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const evaluation = JSON.parse(cleaned);

    if (typeof evaluation.score !== "number" || typeof evaluation.summary !== "string") {
      throw new Error("Invalid evaluation format from AI");
    }

    return evaluation;
  } catch (error) {
    console.error("Interview Evaluation Error:", error.response?.data || error.message);
    throw new Error(`Failed to evaluate interview: ${error.message}`);
  }
};

module.exports = evaluateInterview;
