import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 🔥 Firebase Imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          localStorage.setItem("user", JSON.stringify(userData));
          toast.success("Logged in successfully");
          navigate("/"); // Navigating to Landing as requested in target UI
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

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const emailDomain = email.split("@")[1];

        const newUserProfile = {
          uid: user.uid,
          name,
          email,
          gender,
          organization: emailDomain,
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", user.uid), newUserProfile);
        
        // Save to LocalStorage for immediate UI sync
        localStorage.setItem("user", JSON.stringify({ 
          ...newUserProfile, 
          createdAt: new Date().toISOString() 
        }));

        toast.success("Account created successfully");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered. Please login.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else if (err.code === 'auth/weak-password') {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2">
            Enter your institutional details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                  onChange={handleChange}
                />
              </div>

              {/* Gender Dropdown Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Gender</label>
                <select
                  name="gender"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                  onChange={handleChange}
                  value={formData.gender}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Institution Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@university.edu"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password Field (Sign up only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                onChange={handleChange}
              />
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 mt-2 shadow-emerald-200"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Footer */}
        <p className="mt-8 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-emerald-600 font-bold hover:underline transition-all"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;