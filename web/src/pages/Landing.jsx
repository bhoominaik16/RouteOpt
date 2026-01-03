import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import dashboardPreview from "../assets/LandingImage.png";

const Landing = () => {
  const [user, setUser] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((p) => (p + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "CO₂ Reduced", value: "1,284 kg" },
    { label: "Verified Users", value: "450+" },
    { label: "Daily Rides", value: "120+" },
  ];

  const premiumFeatures = [
    {
      title: "Priority Matching",
      desc: "Get matched faster using intelligent route scoring",
    },
    {
      title: "Advanced Filters",
      desc: "Fine-grained preferences for safety and comfort",
    },
    {
      title: "Premium Access",
      desc: "Early access to parking & campus ride zones",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* HERO */}
      <header className="pt-24 pb-28 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border text-xs font-semibold text-slate-600">
            Secure • Verified • Sustainable
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Commute <br />
            <span className="text-emerald-600">Smarter.</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-lg">
            A trusted carpooling platform for close-knit communities. Safer
            rides, lower emissions, and smarter daily commutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={user ? "/ride-selection" : "/auth"}
              className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition text-center"
            >
              {user ? "Find a Ride" : "Get Started"}
            </Link>

            <button className="px-8 py-4 rounded-xl border bg-white text-slate-700 hover:bg-slate-100 transition">
              Explore Features
            </button>
          </div>

          <div className="flex gap-6 text-sm text-slate-500">
            <span>✔ Verified users</span>
            <span>✔ Route-based matching</span>
            <span>✔ Privacy-first</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div className="absolute -inset-2 bg-emerald-200/30 rounded-3xl blur-2xl" />
          <div className="relative bg-white rounded-3xl p-4 shadow-2xl border">
            <img
              src={dashboardPreview}
              alt="App preview"
              className="rounded-2xl w-full aspect-[4/3] object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border">
            <p className="text-xs uppercase font-bold text-slate-500">
              Impact Today
            </p>
            <p className="text-xl font-bold text-emerald-600">
              4.2 kg CO₂ saved
            </p>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-3xl font-bold">{s.value}</h3>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM FEATURES */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-2">
            Coming Soon
          </p>
          <h2 className="text-4xl font-bold mb-3">Premium Features</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Extra control, better matching, and exclusive campus benefits.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {premiumFeatures.map((f, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">
            Why Choose <span className="text-emerald-600">Commute Smart</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Designed around safety, trust, and sustainability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            title="Trust-First Design"
            desc="Only verified community members can join."
            active={activeFeature === 0}
          />
          <Feature
            title="Personalized Matching"
            desc="Preferences that respect comfort and safety."
            active={activeFeature === 1}
          />
          <Feature
            title="Route Intelligence"
            desc="Matches along real routes, not just locations."
            active={activeFeature === 2}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="bg-emerald-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8">
            Join verified commuters making daily travel safer, cheaper, and
            greener.
          </p>

          <Link
            to={user ? "/ride-selection" : "/auth"}
            className="inline-block px-10 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-slate-100 transition"
          >
            {user ? "Start Riding" : "Join Free"}
          </Link>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ title, desc, active }) => (
  <div
    className={`bg-white p-8 rounded-2xl border shadow-sm transition ${
      active ? "ring-2 ring-emerald-500" : ""
    }`}
  >
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-slate-600">{desc}</p>
  </div>
);

export default Landing;
