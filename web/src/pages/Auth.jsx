import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 🔥 Firebase Imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // Added getDoc
import { auth, db } from "../firebase";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, gender, password, confirmPassword } = formData;

    try {
      // ===========================
      // 🔐 LOGIN LOGIC
      // ===========================
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data (including organization) from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Save to LocalStorage so Profile & Ride Filters work immediately
          localStorage.setItem("user", JSON.stringify(userData));
          
          toast.success("Logged in successfully");
          navigate("/ride-selection");
        } else {
          toast.error("User data not found in database.");
        }
      }

      // ===========================
      // 📝 SIGNUP LOGIC
      // ===========================
      else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 2. Extract Organization from Email
        // Example: "john@ves.ac.in" -> "ves.ac.in"
        const emailDomain = email.split("@")[1];

        const newUserProfile = {
          uid: user.uid,
          name,
          email,
          gender,
          organization: emailDomain, // 👈 Storing the extracted domain
          createdAt: serverTimestamp(),
        };

        // 3. Save to Firestore
        await setDoc(doc(db, "users", user.uid), newUserProfile);

        // 4. Save to LocalStorage (for immediate app usage)
        // We convert timestamp to null or string for localStorage to avoid JSON errors
        localStorage.setItem("user", JSON.stringify({ ...newUserProfile, createdAt: new Date().toISOString() }));

        toast.success("Account created successfully");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      // specific error handling for common firebase errors
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered. Please login.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border"
                onChange={handleChange}
                required
              />

              <select
                name="gender"
                className="w-full px-4 py-3 rounded-xl border bg-white"
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Institution Email"
            className="w-full px-4 py-3 rounded-xl border"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border"
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-xl border"
              onChange={handleChange}
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;