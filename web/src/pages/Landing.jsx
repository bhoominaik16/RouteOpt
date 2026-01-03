import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import dashboardPreview from "../assets/LandingImage.png";

const Landing = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const stats = [
    { label: "CO₂ Reduced", value: "1,284 kg", icon: "🌱" },
    { label: "Verified Users", value: "450+", icon: "👥" },
    { label: "Daily Rides", value: "120+", icon: "🚗" },
  ];

  return (
    <div className="relative w-full bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[30rem] h-[30rem] bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[10%] w-[28rem] h-[28rem] bg-blue-300/30 rounded-full blur-3xl" />
      </div>

      {/* HERO */}
      <header className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        {/* LEFT */}
        <div className="space-y-8">
          {/* Soft trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-slate-600">
              Secure • Verified • Sustainable
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight">
            Commute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Smarter.
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            A trusted carpooling platform designed for close-knit communities.
            Safer rides, lower emissions, and smarter daily commutes.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={user ? "/ride-selection" : "/auth"}
              className="group px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-center"
            >
              {user ? "Find a Ride" : "Get Started"}
            </Link>

            <button className="px-8 py-4 rounded-2xl font-semibold text-slate-700 bg-white border hover:bg-slate-50 transition">
              Explore Features
            </button>
          </div>

          {/* Soft credibility row */}
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <span>✔ Verified users only</span>
            <span>✔ Real route matching</span>
            <span>✔ Privacy-first</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-[2.5rem] blur-xl opacity-30" />

          <div className="relative bg-white rounded-[2rem] p-4 shadow-2xl border">
            <img
              src={dashboardPreview}
              alt="App preview"
              className="rounded-xl w-full aspect-[4/3] object-cover"
            />
          </div>

          {/* Floating stat */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border flex items-center gap-3">
            <div className="text-2xl">🌍</div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">
                Impact Today
              </p>
              <p className="text-xl font-black text-slate-900">
                4.2 kg CO₂ saved
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* STATS STRIP */}
      <section className="pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <h3 className="text-2xl font-black">{s.value}</h3>
              </div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <Feature icon="🛡️" title="Trust-First Design" desc="Built for communities where safety and verification matter." />
          <Feature icon="👩‍🎓" title="Personalized Matching" desc="Filters that adapt to comfort and safety preferences." />
          <Feature icon="📍" title="Route Intelligence" desc="Matches based on real routes, not just locations." />
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-3xl border shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
