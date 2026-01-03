import React from "react";
import { Link } from "react-router-dom";
import dashboardPreview from "../assets/LandingImage.png";

const Landing = () => {
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
      label: "Partner Institutions",
      value: "12",
      icon: "🏛️",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
      </div>

      {/* HERO */}
      <header className="pt-16 pb-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-xs font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live at VESIT
          </span>

          <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
            Commute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              With Purpose.
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-10 max-w-lg">
            A verified carpooling platform for colleges and organizations. Save
            money, reduce emissions, and commute safely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/auth"
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 transition"
            >
              Get Started
            </Link>

            <button className="px-8 py-4 rounded-2xl font-bold text-slate-700 bg-white border shadow-sm hover:bg-slate-50 transition">
              See How It Works
            </button>
          </div>

          <p className="mt-10 text-sm text-slate-500 font-semibold">
            Trusted by 450+ verified students
          </p>
        </div>

        {/* Right */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl blur opacity-30"></div>
          <div className="relative bg-white rounded-3xl p-4 shadow-2xl border">
            <img
              src={dashboardPreview}
              alt="Dashboard preview"
              className="rounded-2xl w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Built for{" "}
            <span className="text-emerald-600">safe campus commutes</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            No strangers. Only verified institutions. Designed for trust,
            efficiency, and sustainability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="font-bold text-xl mb-2">Institution-Only Access</h3>
            <p className="text-slate-600 text-sm">
              Only verified college and company emails can join.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <div className="text-3xl mb-4">👩‍🎓</div>
            <h3 className="font-bold text-xl mb-2">Women-First Filters</h3>
            <p className="text-slate-600 text-sm">
              Choose same-gender rides for added comfort and safety.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <div className="text-3xl mb-4">📍</div>
            <h3 className="font-bold text-xl mb-2">Route-Based Matching</h3>
            <p className="text-slate-600 text-sm">
              Matches riders along your route, not just start and end points.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
