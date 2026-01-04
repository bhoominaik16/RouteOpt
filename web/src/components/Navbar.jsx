import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const [localData, setLocalData] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncLocalData = () => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        setLocalData(savedUser);
      }
    };

    window.addEventListener("userUpdated", syncLocalData);
    window.addEventListener("storage", syncLocalData);

    return () => {
      window.removeEventListener("userUpdated", syncLocalData);
      window.removeEventListener("storage", syncLocalData);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setLocalData(null);
      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Logged out successfully");
      setShowDropdown(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    /* 🔥 UPDATED UI: Deep Slate Gradient with Emerald Accent for high contrast against white pages */
    <nav className="sticky top-0 z-[1000] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-emerald-500 px-8 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-white/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
            <img
              src="/Logo.png"
              alt="RouteOpt Logo"
              className="w-8 h-8 object-contain brightness-0 invert"
            />
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase italic">
            RouteOpt
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Start a Ride button - Emerald contrast against the dark nav */}
              <Link
                to="/ride-selection"
                className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/40 text-xs"
              >
                Start a Ride
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 hover:bg-white/10 rounded-full transition outline-none"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-900 font-bold uppercase shadow-sm border-2 border-emerald-400 overflow-hidden bg-emerald-50">
                    {localData?.profileImage ? (
                      <img
                        src={localData.profileImage}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">
                        {localData?.name ? localData.name[0] : user.email[0]}
                      </span>
                    )}
                  </div>

                  <svg
                    className={`w-4 h-4 text-emerald-400 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        User Account
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {localData?.name || "User"}
                      </p>
                    </div>
                    <ul>
                      <li>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/ride-giver-dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Driver Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/history"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Rides History
                        </Link>
                      </li>
                      <li className="border-t border-slate-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-emerald-500 text-slate-900 px-8 py-2.5 rounded-lg font-black uppercase tracking-widest shadow-xl hover:bg-emerald-400 transition-all text-xs"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
