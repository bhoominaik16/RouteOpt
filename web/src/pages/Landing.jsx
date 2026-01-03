import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar'; // Adjust path if needed

const Landing = () => {
  const stats = [
    { label: 'Total CO₂ Saved', value: '1,284 kg', icon: '🌱' },
    { label: 'Active Commuters', value: '450+', icon: '👥' },
    { label: 'Institutional Partners', value: '12', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* --- Hero Section --- */}
      <header className="relative pt-16 pb-24 px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-50 rounded-full">
            Revolutionizing Campus Commute
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            Share your ride, <span className="text-emerald-600 underline decoration-emerald-200">save the planet.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            The exclusive carpooling network for your organization. Verified users, optimized routes, and real-time carbon tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-slate-800 transition shadow-xl">
              Join Your Organization
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-700 border-2 border-slate-200 hover:bg-slate-50 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-100 rounded-3xl rotate-3 scale-95 opacity-50 blur-lg"></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1527090534107-59a3cb0a550d?q=80&w=2070&auto=format&fit=crop" 
               alt="App Mockup" 
               className="rounded-xl w-full object-cover aspect-video"
             />
          </div>
        </div>
      </header>

      {/* --- Aggregate Stats Section --- */}
      <section id="impact" className="bg-slate-50 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Collective Impact</h2>
            <p className="text-slate-600">Real-time data from across all registered organizations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-black text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
              Safety and Efficiency <br />Built for Institutions.
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Verified Matching', desc: 'Strictly restricted to .edu and company domains.' },
                { title: 'Optimized Routes', desc: 'AI-powered pickup points to minimize detour time.' },
                { title: 'Emergency SOS', desc: 'One-tap alerts to campus security with live location.' }
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{f.title}</h4>
                    <p className="text-slate-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-emerald-600 rounded-3xl flex items-center justify-center text-white font-bold p-6 text-center">
              Female-Only Matching Filters
            </div>
            <div className="h-64 bg-slate-900 rounded-3xl mt-8 flex items-center justify-center text-white font-bold p-6 text-center">
              Automated Cost Splitting
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;