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

  // 🧠 LOGIC 1: Fuzzy Name Matching (Robust)
  const isNameMatch = (inputName, extractedName) => {
    if (!extractedName) return false;

    // Normalize: lowercase, remove special chars, trim extra spaces
    // "Neha Kadam" -> "nehakadam"
    const cleanInput = inputName.toLowerCase().replace(/[^a-z]/g, "");
    const cleanExtracted = extractedName.toLowerCase().replace(/[^a-z]/g, "");

    // Check if one contains the other
    return (
      cleanExtracted.includes(cleanInput) || cleanInput.includes(cleanExtracted)
    );
  };

  // 🧠 LOGIC 2: Institution & Email Matching
  const isInstitutionMatch = (email, institutionName) => {
    if (!institutionName) return true; // Be lenient if AI missed the college name

    // "name@somaiya.edu" -> "somaiya"
    const emailDomain = email.split("@")[1]?.split(".")[0]?.toLowerCase();
    const cleanInstitution = institutionName.toLowerCase();

    // Check if domain part is inside the institution name
    return cleanInstitution.includes(emailDomain);
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
      // 📝 SIGNUP LOGIC (Strict)
      // ===========================
      else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!idFile) {
          throw new Error("Please upload your Student ID Card.");
        }

        // 1. Verify ID with Backend
        toast.loading("Scanning ID Card details...", { id: "verifyToast" });

        const verifyData = new FormData();
        verifyData.append("idCard", idFile);
        verifyData.append("userId", "new_signup");

        const response = await fetch("http://localhost:5000/api/verify-id", {
          method: "POST",
          body: verifyData,
        });

        const result = await response.json();
        toast.dismiss("verifyToast");

        // 2. LOGIC: Determine Verification Status
        let isVerified = false;
        let verificationStatus = "unverified";
        let institutionName = "";
        let studentName = name;

        // --- SCENARIO A: AI Says Valid ---
        if (result.isValid) {
          // Check Name Match
          if (!isNameMatch(name, result.name)) {
            throw new Error(
              `Name Mismatch! ID says: "${result.name}" but you typed: "${name}".`
            );
          }

          // Check Email/Institution Match (Optional Warning)
          if (!isInstitutionMatch(email, result.institution)) {
            toast("Note: Your email domain doesn't match the ID institution.", {
              icon: "ℹ️",
              duration: 5000,
            });
          }

          // If passed
          isVerified = true;
          verificationStatus = "verified";
          institutionName = result.institution;
          studentName = result.name; // Use the official name from ID
          toast.success("✅ ID Verified! Name matched.");
        }

        // --- SCENARIO B: AI Unsure (Pending) ---
        else if (result.isPending) {
          // Allow signup, but mark unverified
          isVerified = false;
          verificationStatus = "pending";
          toast("⚠️ AI couldn't read ID. Sent to Admin for manual check.", {
            icon: "⏳",
          });
        }

        // --- SCENARIO C: AI Says Invalid ---
        else {
          throw new Error(
            "Invalid ID Card. Please upload a clear Student/Employee ID."
          );
        }

        // 3. Create Firebase Account
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
          organization: institutionName || emailDomain, // Use detected institution if available
          isVerified: isVerified,
          verificationStatus: verificationStatus,
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
              {/* Full Name */}
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

              {/* Gender */}
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

          {/* Email */}
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

          {/* Password */}
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
              {/* Confirm Password */}
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

              {/* 🔥 MANDATORY ID UPLOAD */}
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
                  We check if your <b>Name</b> and <b>Email Domain</b> match
                  this ID.
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
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
