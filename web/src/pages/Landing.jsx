import React from 'react';
import { Link } from 'react-router-dom';
import dashboardPreview from '../assets/LandingImage.png';

const Landing = () => {
  const stats = [
    { label: 'CO₂ Saved', value: '1,284 kg', icon: '🌱', color: 'text-emerald-500' },
    { label: 'Active Commuters', value: '450+', icon: '👥', color: 'text-blue-500' },
    { label: 'Partner Colleges', value: '12', icon: '🏛️', color: 'text-purple-500' },
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
  
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 backdrop-blur-sm shadow-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Live at VESIT
            </span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1] mb-6">
            Commute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              With Purpose.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
            The exclusive carpooling network for your organization. Verified users, optimized routes, and real-time carbon tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/auth" 
              className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Find a Ride</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              See How It Works
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-slate-500">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover"/>
                </div>
              ))}
            </div>
            <p>Trusted by 450+ students</p>
          </div>
        </div>

        <div className="relative perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-[2.5rem] blur opacity-30 animate-pulse"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-4 transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out">
   
             <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 h-6 w-full bg-slate-100 rounded-full"></div>
             </div>
             <img 
               src={dashboardPreview}
               alt="App Interface" 
               className="rounded-xl w-full object-cover shadow-inner aspect-[4/3]"
             />
             
        
             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-emerald-100 p-2 rounded-lg text-2xl">🌱</div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">You Saved</p>
                  <p className="text-xl font-black text-slate-900">4.2 kg CO₂</p>
                </div>
             </div>
          </div>
        </div>
      </header>


      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need for a <br/>
            <span className="text-emerald-600">secure campus commute.</span>
          </h2>
          <p className="text-lg text-slate-600">
            We stripped away the noise of public ridesharing and built a platform focused on safety, reliability, and institutional trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
          
        
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">🛡️</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Domain-Locked Security</h3>
                <p className="text-slate-600 max-w-md">No strangers. We strictly restrict access to verified <span className="font-mono bg-slate-100 px-1 rounded text-slate-800">.edu</span> and company email domains.</p>
              </div>
              <div className="mt-8 flex gap-2">
                 <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">@ves.ac.in</div>
                 <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">@tcs.com</div>
                 <div className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-xs font-bold line-through">@gmail.com</div>
              </div>
            </div>
          </div>

    
          <div className="row-span-2 bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Collective Impact</h3>
                <p className="text-slate-400 text-sm">Real-time emissions saved by our community.</p>
             </div>
             <div className="relative z-10 space-y-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</p>
                  </div>
                ))}
             </div>
          </div>

 
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-4">👩‍🎓</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Women-First Filters</h3>
             <p className="text-slate-600 text-sm">Female students can choose to only view rides from other female drivers.</p>
          </div>

      
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
             <div className="relative z-10">
               <h3 className="text-xl font-bold text-slate-900 mb-2">Polyline Algo</h3>
               <p className="text-slate-600 text-sm">We find matches along your route, not just at the start point.</p>
             </div>
    
             <div className="absolute bottom-0 left-0 w-full h-24 flex items-end px-8 pb-8 gap-1">
                <div className="w-1/4 h-8 bg-emerald-200 rounded-t-lg"></div>
                <div className="w-1/4 h-16 bg-emerald-300 rounded-t-lg"></div>
                <div className="w-1/4 h-12 bg-emerald-400 rounded-t-lg"></div>
                <div className="w-1/4 h-20 bg-emerald-500 rounded-t-lg"></div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Landing;