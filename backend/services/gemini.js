const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyIDCard(imageBuffer, mimeType) {
  // FIXED: Updated to use the specific Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this image. It is an Organizational ID Card (Student ID or Employee ID).
    
    CRITICAL EXTRACTION TASK:
    1. **Extract Name**: Find the full name of the person.
    2. **Extract Institution**: Find the name of the college, university, or company.
    3. **Validity Check**: Mark as 'isValid: true' if it looks like a real ID card with a photo and name.
    
    Return ONLY raw JSON (no markdown):
    {
      "isValid": boolean, 
      "name": "string", 
      "institution": "string",
      "reason": "explanation if invalid"
    }
  `;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };

  try {
    console.log("Sending to Gemini (2.5 Flash)...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean markdown formatting if present
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error.message);
    // Return pending so admin can manually check if AI fails
    return { isValid: false, isPending: true, reason: "AI Extraction Failed" };
  }
}

module.exports = { verifyIDCard };
