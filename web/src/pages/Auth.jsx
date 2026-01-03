import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import dashboardPreview from "../assets/LandingImage.png";

const Landing = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    {
      label: "CO₂ Saved",
      value: "1,284 kg",
      icon: "🌱",
      color: "text-emerald-500",
    },
    {
      label: "Active Commuters",
      value: "450+",
      icon: "👥",
      color: "text-blue-500",
    },
    {
      label: "Partner Colleges",
      value: "12",
      icon: "🏛️",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* HERO */}
      <header className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase text-slate-600">
              Live at VESIT
            </span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-black leading-[1] mb-6">
            Commute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              With Purpose.
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-lg">
            The exclusive carpooling network for your organization. Verified
            users, optimized routes, and real-time carbon tracking.
          </p>

          <div className="flex gap-4">
            {user ? (
              <Link
                to="/"
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition"
              >
                Find a Ride
              </Link>
            )}

            <button className="px-8 py-4 rounded-2xl font-bold bg-white border shadow-sm hover:bg-slate-50 transition">
              See How It Works
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-slate-500">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white"
                />
              ))}
            </div>
            <p>Trusted by 450+ students</p>
          </div>
        </div>

        {/* Preview */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 blur opacity-30"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-4">
            <img
              src={dashboardPreview}
              alt="Dashboard Preview"
              className="rounded-xl w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Everything you need for a{" "}
            <span className="text-emerald-600">secure campus commute</span>
          </h2>
          <p className="text-lg text-slate-600">
            Built exclusively for institutional safety, reliability, and trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border shadow">
            <h3 className="text-2xl font-bold mb-2">Domain-Locked Security</h3>
            <p className="text-slate-600">
              Access restricted to verified institutional email domains only.
            </p>
          </div>

          <div className="row-span-2 bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Collective Impact</h3>
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-xl mb-3">
                <div className="flex justify-between">
                  <span>{stat.icon}</span>
                  <span className={`font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs uppercase text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-pink-50 rounded-3xl p-8 border text-center">
            <h3 className="text-xl font-bold mb-2">Women-First Filters</h3>
            <p className="text-slate-600 text-sm">
              Female riders can choose female-only ride visibility.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border">
            <h3 className="text-xl font-bold mb-2">Polyline Algorithm</h3>
            <p className="text-slate-600 text-sm">
              Matches rides along your route, not just start & end points.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
