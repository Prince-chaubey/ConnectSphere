const axios = require("axios");
const pdfParse = require("pdf-parse");

/**
 * Analyzes a resume without using AI by performing keyword matching and text parsing.
 * 
 * @param {Object} params - Analysis parameters
 * @param {string} params.resumeUrl - The URL to the PDF resume
 * @param {string} params.roleName - The name of the role being applied for
 * @param {string} params.roleDescription - The description of the role
 * @param {string[]} params.skillsRequired - Array of skills required for the role
 * @param {string[]} params.applicantSkills - Array of skills the applicant claims to have
 * @returns {Promise<Object>} The analysis result including score, summary, strengths, and gaps
 */
const analyzeResume = async ({
  resumeUrl,
  roleName,
  roleDescription,
  skillsRequired = [],
  applicantSkills = [],
}) => {
  try {
    // 1. Fetch the resume buffer
    const response = await axios.get(resumeUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    // 2. Extract text from PDF
    const pdfData = await pdfParse(response.data);
    const resumeText = pdfData.text.toLowerCase().replace(/\s+/g, " ");

    // 3. Perform Keyword Matching
    const matched = [];
    const gaps = [];

    // Prioritize searching for required skills
    skillsRequired.forEach((skill) => {
      if (!skill) return;
      // Using word boundaries \b to ensure we match whole words (e.g., "AI" not inside "Main")
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedSkill.toLowerCase()}\\b`, "i");

      if (regex.test(resumeText)) {
        matched.push(skill);
      } else {
        gaps.push(skill);
      }
    });

    // 4. Calculate Match Score
    const totalRequired = skillsRequired.length || 1;
    const score = Math.round((matched.length / totalRequired) * 100);

    // 5. Detect Experience (Simple Regex heuristic)
    const expRegex = /(\d+)\+?\s*years?\s*(?:of)?\s*experience/i;
    const expMatch = resumeText.match(expRegex);
    const detectedExp = expMatch ? `${expMatch[1]}+ years` : "No specific duration detected";

    // 6. Construct results compatible with existing UI
    return {
      score: score,
      summary: `Applicant matches ${matched.length}/${totalRequired} required skills for ${roleName}. ${detectedExp !== "No specific duration detected" ? `Claimed experience: ${detectedExp}.` : "Manual review for experience suggested."}`,
      strengths: matched,
      gaps: gaps,
    };
  } catch (error) {
    console.error("Local Resume Analysis Error:", error.message);
    throw new Error(`Resume Analysis Failed: ${error.message}`);
  }
};

module.exports = analyzeResume;