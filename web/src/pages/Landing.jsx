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
    { label: 'CO₂ Saved', value: '1,284 kg', icon: '🌱', color: 'text-emerald-500' },
    { label: 'Active Commuters', value: '450+', icon: '👥', color: 'text-blue-500' },
    { label: 'Partner Colleges', value: '12', icon: '🏛️', color: 'text-purple-500' },
  ];

  // Mock data for the leaderboard
  const topCommuters = [
    { name: "Arjun Mehta", institution: "VESIT", co2: "42.5kg", rank: 1, avatar: "👨‍💻" },
    { name: "Sanya Iyer", institution: "VESIT", co2: "38.2kg", rank: 2, avatar: "👩‍🔬" },
    { name: "Rahul Verma", institution: "TCS", co2: "31.9kg", rank: 3, avatar: "👨‍💼" },
  ];

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* HERO SECTION - Keep existing code */}
      <header className="pt-24 pb-28 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
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
            <a href="#features" className="px-8 py-4 rounded-xl border bg-white text-slate-700 hover:bg-slate-100 transition text-center">
              Explore Features
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-2 bg-emerald-200/30 rounded-3xl blur-2xl" />
          <div className="relative bg-white rounded-3xl p-4 shadow-2xl border">
            <img src={dashboardPreview} alt="App preview" className="rounded-2xl w-full aspect-[4/3] object-cover" />
          </div>
        </div>
      </header>

      {/* NEW LEADERBOARD SECTION */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Top <span className="text-emerald-600">Green Commuters</span> <br/>
              of the Month
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Join the leaderboard and earn eco-badges for every ride you share. Verified impact by verified commuters.
            </p>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-2xl">🏆</span>
              <p className="text-sm font-medium text-emerald-800">
                Arjun is leading this month with <span className="font-bold">42.5kg</span> CO₂ saved!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topCommuters.map((commuter, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                  commuter.rank === 1 
                  ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-md' 
                  : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    commuter.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                    commuter.rank === 2 ? 'bg-slate-100 text-slate-500' : 
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {commuter.rank}
                  </div>
                  <div className="text-3xl">{commuter.avatar}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{commuter.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{commuter.institution}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">{commuter.co2}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Saved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Keep existing code */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need for a <br/>
            <span className="text-emerald-600">secure campus commute.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* ... existing feature cards ... */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">🛡️</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Domain-Locked Security</h3>
                <p className="text-slate-600 max-w-md">No strangers. We strictly restrict access to verified email domains.</p>
              </div>
            </div>
          </div>

          <div className="row-span-2 bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Collective Impact</h3>
                <p className="text-slate-400 text-sm">Real-time emissions saved by our community.</p>
             </div>
             <div className="relative z-10 space-y-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xl text-white">{stat.icon}</span>
                      <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-100 transition-all flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-4">👩‍🎓</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Women-First Filters</h3>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 transition-all relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Polyline Algo</h3>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-24 flex items-end px-8 pb-8 gap-1">
                <div className="w-1/4 h-8 bg-emerald-200 rounded-t-lg"></div>
                <div className="w-1/4 h-16 bg-emerald-300 rounded-t-lg"></div>
                <div className="w-1/4 h-20 bg-emerald-500 rounded-t-lg"></div>
             </div>
          </div>
        </div>
      </section>

      

    </div>
  );
};

export default Landing;