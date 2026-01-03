import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

const RideTaker = () => {
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    timeMode: 'immediate',
    routeChoice: 'fastest',
    genderPreference: false
  });

  // Mock Data: In a real app, this would be fetched from your Node.js Matching Engine
  const availableRides = [
    {
      id: 1,
      giverName: "Aditi Sharma",
      gender: "Female",
      verified: true,
      source: "Andheri West",
      destination: "IIT Bombay",
      time: "10:30 AM",
      totalSeats: 4,
      bookedSeats: 2,
    },
    {
      id: 2,
      giverName: "Rahul Verma",
      gender: "Male",
      verified: true,
      source: "Borivali",
      destination: "Corporate Hub",
      time: "09:00 AM",
      totalSeats: 3,
      bookedSeats: 1,
    }
  ];

  const handleSearch = () => {
    setSearching(true);
    toast.success("Finding optimized matches...");
  };

  return (
    <div className="min-h-screen bg-slate-50">      
      <div className="max-w-9xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT: Filter Panel (25%) --- */}
        <aside className="w-full md:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source</label>
                <input type="text" placeholder="Your location" className="w-full mt-1 px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</label>
                <input type="text" placeholder="College/Office" className="w-full mt-1 px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Window</label>
                <div className="flex gap-2 mt-1">
                  {['Immediate', 'Schedule'].map(t => (
                    <button key={t} onClick={() => setFilters({...filters, timeMode: t.toLowerCase()})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${filters.timeMode === t.toLowerCase() ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Route Preference</label>
                <select className="w-full mt-1 px-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none">
                  <option>Fastest Path</option>
                  <option>Eco-Friendly</option>
                  <option>Minimum Detour</option>
                </select>
              </div>

              {/* Gender Preference Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <span className="text-sm font-semibold text-slate-700">Same-Gender Only</span>
                <button 
                  onClick={() => setFilters({...filters, genderPreference: !filters.genderPreference})}
                  className={`w-10 h-5 rounded-full relative transition ${filters.genderPreference ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${filters.genderPreference ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <button 
                onClick={handleSearch}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-lg mt-4"
              >
                Search Rides
              </button>
            </div>
          </div>
        </aside>

        {/* --- RIGHT: Ride Cards (75%) --- */}
        <main className="w-full md:w-3/4">
          {!searching ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Enter your route details to find verified matches.</p>
            </div>
          ) : (
            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {availableRides.map((ride) => (
                <div key={ride.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Ride Giver Info */}
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">👤</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900">{ride.giverName}</h4>
                          {ride.verified && (
                            <span className="text-blue-500" title="Verified Member">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{ride.gender} • Verified</p>
                        <div className="mt-2 flex gap-1">
                          {/* Seat Vacancy Logic: Green = Booked, Gray = Vacant */}
                          {[...Array(ride.totalSeats)].map((_, i) => (
                            <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${i < ride.bookedSeats ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              👤
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="flex-grow md:px-8 border-l border-slate-50">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                        <p className="text-sm font-medium text-slate-600 truncate">{ride.source}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5" />
                        <p className="text-sm font-bold text-slate-900 truncate">{ride.destination}</p>
                      </div>
                    </div>

                    {/* Time & Action */}
                    <div className="text-right flex flex-col justify-between items-end">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">
                        {ride.time}
                      </div>
                      <button className="text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Details <span>→</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RideTaker;