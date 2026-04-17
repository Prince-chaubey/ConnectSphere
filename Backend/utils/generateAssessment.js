const axios = require("axios");

/**
 * Generate 30 multiple-choice assessment questions using OpenRouter AI
 * @param {Object} params
 * @param {string} params.roleName     - The role being assessed (e.g., "Frontend Developer")
 * @param {string[]} params.skills     - Array of skills required for the role
 * @param {string} params.projectTitle - Title of the project
 * @returns {Promise<Array>}           - Array of question objects
 */
const generateAssessment = async ({ roleName, skills, projectTitle }) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured in environment variables.");
  }

  const skillList = skills && skills.length > 0 
    ? skills.slice(0, 8).join(", ")
    : roleName; // fallback to roleName if no skills provided

  const prompt = `You are an expert technical interviewer. Generate exactly 30 multiple-choice questions to assess a candidate applying for the role of "${roleName}" in a project called "${projectTitle}".

The assessment should test these skills: ${skillList}.

Each question must be practical and relevant to the role. Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "skill": "skill name this tests"
  }
]

Rules:
- "correct" is the 0-based index of the correct option (0, 1, 2, or 3)
- Make questions moderately challenging but fair
- Vary the skills tested across questions
- Keep questions concise and unambiguous
- Return ONLY the JSON array, nothing else`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",  // Automatically selects the best functioning model on your OpenRouter tier
        messages: [
          {
            role: "system",
            content:
              "You are a technical assessment generator. Always respond with valid JSON only, no markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "ConnectSphere Assessment",
        },
        timeout: 90000, // 90 seconds timeout for 30 questions
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Empty response from OpenRouter API");
    }

    // Strip markdown code blocks if present
    let cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch (parseError) {
      // If JSON is truncated, find the last complete object and close the array
      const lastBracketIndex = cleaned.lastIndexOf('}');
      if (lastBracketIndex !== -1) {
        try {
          const fixedJson = cleaned.substring(0, lastBracketIndex + 1) + ']';
          questions = JSON.parse(fixedJson);
        } catch (fallbackError) {
          throw new Error("Invalid or heavily truncated question format from AI.");
        }
      } else {
        throw new Error("Invalid question format from AI.");
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid question format from AI");
    }

    return questions.slice(0, 30);
  } catch (error) {
    console.error(
      "Assessment Generation Error:",
      error.response?.data || error.message
    );
    throw new Error(`Failed to generate assessment: ${error.message}`);
  }
};

module.exports = generateAssessment;
