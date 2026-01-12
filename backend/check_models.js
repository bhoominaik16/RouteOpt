// backend/check_models.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    // This fetches the list of all models available to your API Key
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // We use a dummy init to get the client, then access the underlying API

    console.log("Checking available models for your Key...");
    console.log("---------------------------------------");

    // Note: The SDK doesn't always expose a simple list method,
    // so we will test the most common modern ones manually.

    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    for (const modelName of candidates) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        // Try a tiny request to see if it exists
        await testModel.generateContent("Test");
        console.log(`✅ AVAILABLE: ${modelName}`);
      } catch (e) {
        if (e.message.includes("404")) {
          console.log(`❌ NOT FOUND: ${modelName}`);
        } else {
          // If it's not a 404 (e.g. 403 or other), it might exist but be blocked
          console.log(
            `⚠️ EXISTS BUT ERROR: ${modelName} (${e.message.split("[")[0]})`
          );
        }
      }
    }
    console.log("---------------------------------------");
  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
  }
}

check();
