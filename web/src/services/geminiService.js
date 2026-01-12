// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: VITE_GEMINI_API_KEY is missing in .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * FEATURE B: Eco-Loop AI Coach
 * Generates a short, motivational tip based on user stats.
 * * @param {number} kmSaved - Total Kilometers saved by carpooling
 * @param {number} co2Saved - Total KG of CO2 saved
 * @returns {Promise<string>} A single sentence motivational string.
 */
export const generateEcoTip = async (kmSaved, co2Saved) => {
  try {
    const km = Math.round(kmSaved || 0);
    const co2 = Math.round(co2Saved || 0);

    if (km <= 5 && co2 <= 1) {
        return new Promise(resolve => 
            setTimeout(() => resolve("Take your first shared ride today to unlock AI-powered eco-insights!"), 800)
        );
    }

    const prompt = `
      Context: You are an enthusiastic AI coach for a carpooling app focused on sustainability.
      Data: This user has saved ${km} kilometers of driving and avoided ${co2} kg of CO2 emissions so far.
      
      Task: Generate a single, short, punchy, 1-sentence motivational "Green Fact" or specific comparison based on this data to encourage them.
      
      Examples of desired tone: 
      - "That's enough energy saved to charge over 500 smartphones!"
      - "You've offset the equivalent carbon of planting two new trees this month!"
      - "Incredible work; your choices are making the campus air cleaner every day."
      
      Constraint: Return ONLY the single sentence. Do not add quotation marks around the output.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/^"|"$/g, '').trim();

    return text;

  } catch (error) {
    console.error("Gemini Eco-Tip API Error:", error);
    return "Your sustainable choices are making a real difference. Keep it up!";
  }
};