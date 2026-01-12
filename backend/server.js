const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
require("dotenv").config();

const { verifyIDCard } = require("./services/gemini");

// Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer: store images in memory (best for AI APIs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Health check
app.get("/", (req, res) => {
  res.send("RouteOpt Backend is Running 🚀");
});

// ==============================
// 🔐 SMART ID VERIFICATION ROUTE (UPDATED)
// ==============================
app.post("/api/verify-id", upload.single("idCard"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        isValid: false,
        reason: "No image uploaded",
      });
    }

    // Get User ID from frontend (default to unknown if missing)
    const userId = req.body.userId || "unknown_user";

    console.log(`Processing ID verification for user: ${userId}...`);

    const result = await verifyIDCard(req.file.buffer, req.file.mimetype);

    // 1. If AI Verified Successfully
    if (result.isValid) {
      console.log("✅ AI Verified Successfully");
      return res.json(result);
    } 
    
    // 2. FALLBACK: If AI Failed -> Send to Admin Queue
    else {
      console.log("⚠️ AI Failed. Sending to Admin Queue...");

      // Save request to Firestore 'admin_requests' collection
      await db.collection("admin_requests").add({
        userId: userId,
        status: "pending",
        reason: result.reason || "AI Verification Failed",
        ai_response: result, // Store the raw AI response for debugging
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        // Store image as Base64 so Admin can view it later
        imageBase64: req.file.buffer.toString("base64"),
        imageType: req.file.mimetype
      });

      // Return "Pending" status to frontend instead of failure
      return res.json({ 
        isValid: false, 
        isPending: true, 
        message: "AI could not verify. Sent to Admin for manual review." 
      });
    }

  } catch (error) {
    console.error("Verification Error:", error.message);

    return res.status(500).json({
      isValid: false,
      reason: "Verification failed",
    });
  }
});

// ==============================
// 🚗 EXISTING RIDES ROUTE (UNCHANGED)
// ==============================
app.get("/api/rides/:domain", async (req, res) => {
  try {
    const domain = req.params.domain;

    const ridesRef = db.collection("rides");
    const snapshot = await ridesRef.where("orgDomain", "==", domain).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No rides found." });
    }

    const rides = [];
    snapshot.forEach((doc) => {
      rides.push({ id: doc.id, ...doc.data() });
    });

    return res.json(rides);
  } catch (error) {
    console.error("Rides Fetch Error:", error.message);
    return res.status(500).send(error.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});