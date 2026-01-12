const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyIDCard(imageBuffer, mimeType) {
  // FIXED: Using the "Lite Preview" model found in your available list.
  // "Lite" models usually have better free tier availability than standard Flash/Pro.
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
    Analyze this image. It is an Organizational ID Card (Student ID, Employee ID, or Library Card).
    
    CRITICAL INSTRUCTIONS:
    1. **ACCEPT** "Library Cards" as valid IDs if they have a Name, Photo, and Institution.
    2. Extract the Name and Institution Name.
    3. Do not fail just because the title is "Library Card".
    
    Return ONLY raw JSON (no markdown):
    {
      "isValid": boolean, 
      "name": "string",
      "institution": "string",
      "reason": "explanation"
    }
  `;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };

  try {
    console.log("Sending to Gemini (2.0 Flash Lite)...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return { isValid: false, reason: "AI Service Error: " + error.message };
  }
}

module.exports = { verifyIDCard };
