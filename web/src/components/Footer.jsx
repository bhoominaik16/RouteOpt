import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Footer = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 border-t border-slate-800 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CTA — ONLY for logged out users */}
        {!user && (
          <div className="mb-16 text-center border-b border-slate-800 pb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to maximize your commute?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
              Join the closed-network community that saves time, money, and the
              planet.
            </p>
            <Link
              to="/auth"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              Get Started Free
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-sm">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-white font-bold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center shadow-inner">
                R
              </div>
              RouteOpt
            </div>
            <p className="text-slate-500 leading-relaxed">
              Secure, verified carpooling for educational and corporate
              campuses.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Find a Ride
                </Link>
              </li>
              <li>
                <a href="#impact" className="hover:text-emerald-400">
                  Impact Stats
                </a>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Stay Connected
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition"
              >
                <span className="text-slate-300">IG</span>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition"
              >
                <span className="text-slate-300">X</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All Systems Operational</span>
          </div>

          <div className="flex gap-6 mt-4 md:mt-0">
            <span>© 2026 RouteOpt Inc.</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
