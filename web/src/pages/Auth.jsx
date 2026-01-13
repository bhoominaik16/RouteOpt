import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // 🔥 Icons for toggle

// 🔥 Firebase Imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// 🔥 Import the new Frontend ID Service
import { verifyIDCard } from "../services/gemini";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [idFile, setIdFile] = useState(null);

  // 👁️ Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // 🧠 LOGIC 2: Password Strength Calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };

    let score = 0;
    if (pass.length > 5) score++; // At least 6 chars
    if (pass.length > 7 && /[0-9]/.test(pass)) score++; // 8+ chars & number
    if (/[^A-Za-z0-9]/.test(pass)) score++; // Special char

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 2, label: "Medium", color: "bg-yellow-500" };
      case 3:
        return { score: 3, label: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 0, label: "Too Short", color: "bg-slate-200" };
    }
  };

  const passStrength = getPasswordStrength(formData.password);

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
      // 📝 SIGNUP LOGIC (Serverless)
      // ===========================
      else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (passStrength.score < 2) {
          // Enforce at least Medium strength
          throw new Error("Password is too weak. Please make it stronger.");
        }
        if (!idFile) {
          throw new Error("Please upload your Student ID Card.");
        }

        // 1. Verify ID (Direct Frontend Call)
        toast.loading("Scanning ID Card...", { id: "verifyToast" });

        const result = await verifyIDCard(idFile);

        toast.dismiss("verifyToast");

        // 2. LOGIC: Determine Status
        let isVerified = false;
        let verificationStatus = "pending";
        let institutionName = "";
        let studentName = name;
        let verificationReason = "Manual Review Required";

        if (result.isValid && isNameMatch(name, result.name)) {
          isVerified = true;
          verificationStatus = "verified";
          institutionName = result.institution;
          studentName = result.name;
          verificationReason = "Auto-verified by AI";
          toast.success("✅ ID Verified! Welcome.");
        } else if (result.isValid && !isNameMatch(name, result.name)) {
          isVerified = false;
          verificationStatus = "pending";
          verificationReason = `Name Mismatch: ID says '${result.name}'`;
          toast("⚠️ Name didn't match. Sent to Admin for review.", {
            icon: "⏳",
            duration: 5000,
          });
        } else {
          isVerified = false;
          verificationStatus = "pending";
          verificationReason = result.reason || "AI could not read ID";
          toast("⚠️ ID Scan unclear. Sent to Admin for review.", {
            icon: "⏳",
            duration: 5000,
          });
        }

        // 3. Create Firebase Account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const emailDomain = email.split("@")[1];

        // Convert file to base64 if pending
        let idImageBase64 = null;
        if (verificationStatus === "pending") {
          idImageBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(idFile);
          });
        }

        const newUserProfile = {
          uid: user.uid,
          name,
          email,
          gender,
          organization: institutionName || emailDomain,
          isVerified: isVerified,
          verificationStatus: verificationStatus,
          verificationReason: verificationReason,
          studentName: studentName,
          idCardImage: idImageBase64 || null,
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", user.uid), newUserProfile);

        if (verificationStatus === "pending") {
          await setDoc(doc(db, "admin_requests", user.uid), {
            userId: user.uid,
            status: "pending",
            reason: verificationReason,
            name: name,
            email: email,
            imageBase64: idImageBase64,
            timestamp: serverTimestamp(),
          });
        }

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

          {/* 🔥 PASSWORD FIELD WITH TOGGLE + STRENGTH */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 pr-12"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* STRENGTH BAR (Only for Signup) */}
            {!isLogin && formData.password && (
              <div className="mt-2 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex gap-1 h-1 mb-1">
                  <div
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      passStrength.score >= 1
                        ? passStrength.color
                        : "bg-slate-200"
                    }`}
                  ></div>
                  <div
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      passStrength.score >= 2
                        ? passStrength.color
                        : "bg-slate-200"
                    }`}
                  ></div>
                  <div
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      passStrength.score >= 3
                        ? passStrength.color
                        : "bg-slate-200"
                    }`}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span
                    className={`${
                      passStrength.score > 0
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    Strength
                  </span>
                  <span
                    className={`transition-colors duration-300 ${
                      passStrength.score === 1
                        ? "text-red-500"
                        : passStrength.score === 2
                        ? "text-yellow-500"
                        : passStrength.score === 3
                        ? "text-emerald-500"
                        : "text-slate-300"
                    }`}
                  >
                    {passStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <>
              {/* 🔥 CONFIRM PASSWORD FIELD WITH TOGGLE */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 pr-12"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
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
