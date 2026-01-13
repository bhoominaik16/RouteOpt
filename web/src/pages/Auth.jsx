import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 🔥 Firebase Imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [idFile, setIdFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧠 LOGIC 1: Fuzzy Name Matching
  const isNameMatch = (inputName, extractedName) => {
    if (!extractedName) return false;
    const cleanInput = inputName.toLowerCase().replace(/[^a-z]/g, "");
    const cleanExtracted = extractedName.toLowerCase().replace(/[^a-z]/g, "");
    return (
      cleanExtracted.includes(cleanInput) || cleanInput.includes(cleanExtracted)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, gender, password, confirmPassword } = formData;

    try {
      // ===========================
      // 🔐 LOGIN LOGIC
      // ===========================
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          localStorage.setItem("user", JSON.stringify(userData));
          toast.success("Logged in successfully");
          navigate("/");
        } else {
          toast.error("User data not found.");
        }
      }

      // ===========================
      // 📝 SIGNUP LOGIC (ALL FALLBACKS TO ADMIN)
      // ===========================
      else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!idFile) {
          throw new Error("Please upload your Student ID Card.");
        }

        // 1. Verify ID with Backend
        toast.loading("Scanning ID Card...", { id: "verifyToast" });

        const verifyData = new FormData();
        verifyData.append("idCard", idFile);
        verifyData.append("userId", "new_signup");

        const response = await fetch("http://localhost:5000/api/verify-id", {
          method: "POST",
          body: verifyData,
        });

        const result = await response.json();
        toast.dismiss("verifyToast");

        // 2. LOGIC: Determine Status (NEVER BLOCK, JUST PENDING)
        let isVerified = false;
        let verificationStatus = "pending"; // Default to pending
        let institutionName = "";
        let studentName = name; // Default to user input
        let verificationReason = "Manual Review Required";

        // --- SCENARIO A: Perfect Match ---
        if (result.isValid && isNameMatch(name, result.name)) {
          isVerified = true;
          verificationStatus = "verified";
          institutionName = result.institution;
          studentName = result.name;
          verificationReason = "Auto-verified by AI";
          toast.success("✅ ID Verified! Welcome.");
        }
        // --- SCENARIO B: Name Mismatch ---
        else if (result.isValid && !isNameMatch(name, result.name)) {
          isVerified = false;
          verificationStatus = "pending";
          verificationReason = `Name Mismatch: ID says '${result.name}'`;
          toast("⚠️ Name didn't match. Sent to Admin for review.", {
            icon: "⏳",
            duration: 5000,
          });
        }
        // --- SCENARIO C: AI Failed / Invalid / Blurry ---
        else {
          isVerified = false;
          verificationStatus = "pending";
          verificationReason = result.reason || "AI could not read ID";
          toast("⚠️ ID Scan unclear. Sent to Admin for review.", {
            icon: "⏳",
            duration: 5000,
          });
        }

        // 3. Create Firebase Account (Even if pending)
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const emailDomain = email.split("@")[1];

        const newUserProfile = {
          uid: user.uid,
          name,
          email,
          gender,
          organization: institutionName || emailDomain,
          isVerified: isVerified,
          verificationStatus: verificationStatus,
          verificationReason: verificationReason, // 🔥 Saved for Admin to see
          studentName: studentName,
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", user.uid), newUserProfile);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...newUserProfile,
            createdAt: new Date().toISOString(),
          })
        );

        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Authentication failed");
      toast.dismiss("verifyToast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin
              ? "Enter your credentials"
              : "Institutional Verification Required"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Full Name (As on ID)
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Gender
                </label>
                <select
                  name="gender"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                  onChange={handleChange}
                  value={formData.gender}
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Institution Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@university.edu"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                  onChange={handleChange}
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">
                  Upload Student/Employee ID{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setIdFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100
                      cursor-pointer border border-dashed border-slate-300 rounded-xl p-2"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                  If AI cannot verify this ID automatically, it will be sent to
                  Admin for approval.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-4 ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-200"
            }`}
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Login"
              : "Verify & Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold hover:underline transition-all"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
