import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 🔥 Firebase Imports
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const RideTaker = () => {
  const navigate = useNavigate();
  
  // 1. Get Current User (Taker)
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  const [searching, setSearching] = useState(false);
  const [rides, setRides] = useState([]); // Stores the fetched rides
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    timeMode: 'immediate',
    scheduledTime: '',
    genderPreference: false,
    sameInstitution: false 
  });

  // --- HELPER: Get Email Domain (e.g., 'ves.ac.in') ---
  const getDomain = (email) => {
    if (!email) return "";
    return email.split('@')[1].toLowerCase();
  };

  const handleSearch = async () => {
    if (!user) {
        toast.error("Please login to search for rides");
        navigate('/auth');
        return;
    }
    if (!filters.source || !filters.destination) {
      toast.error("Please enter source and destination");
      return;
    }

    setSearching(true);
    setLoading(true);
    toast.loading("Finding optimized matches...", { duration: 2000 });

    try {
      // 1. Fetch ALL Active Rides
      // (In a real app, you'd filter by location here, but for now we fetch all and filter in JS)
      const q = query(
        collection(db, "rides"), 
        where("status", "==", "ACTIVE"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedRides = [];
      const takerDomain = getDomain(user.email);

      querySnapshot.forEach((doc) => {
        const ride = { id: doc.id, ...doc.data() };
        const giverDomain = getDomain(ride.driverEmail);
        const isSameOrg = takerDomain === giverDomain;

        // --- 🛑 LOGIC 1: Exclude rides where Giver wants ONLY same org ---
        if (ride.sameInstitution && !isSameOrg) {
            return; // Skip this ride, the Taker is not eligible
        }

        // --- 🛑 LOGIC 2: Taker's Own Filters ---
        // A. Taker wants Same Institution Only
        if (filters.sameInstitution && !isSameOrg) {
            return; 
        }

        // B. Taker wants Same Gender Only
        // (Assuming user.gender and ride.driverGender exist. If not, we skip strict check)
        if (filters.genderPreference && user.gender) {
             // If ride doesn't have gender data, we usually exclude it or be lenient. 
             // Here we assume strict matching if data exists.
             if (ride.driverGender && ride.driverGender.toLowerCase() !== user.gender.toLowerCase()) {
                 return;
             }
        }

        // --- 🔍 LOGIC 3: Text Search Matching (Simple Includes) ---
        // We check if the ride's source/dest vaguely matches what Taker typed
        const searchSrc = filters.source.toLowerCase();
        const searchDest = filters.destination.toLowerCase();
        const rideSrc = ride.source.toLowerCase();
        const rideDest = ride.destination.toLowerCase();

        // Allow match if search term is found in ride details
        if (rideSrc.includes(searchSrc) || rideDest.includes(searchDest)) {
            // Add a flag for sorting later
            ride.isSameOrg = isSameOrg; 
            fetchedRides.push(ride);
        }
      });

      // --- 📊 LOGIC 4: Sorting (Priority to Same Org) ---
      fetchedRides.sort((a, b) => {
        // If 'a' is same org and 'b' is not, 'a' comes first (-1)
        if (a.isSameOrg && !b.isSameOrg) return -1;
        if (!a.isSameOrg && b.isSameOrg) return 1;
        return 0; // Otherwise keep original order (by time)
      });

      setRides(fetchedRides);

      if (fetchedRides.length === 0) {
          toast.error("No rides found for this route.");
      } else {
          toast.success(`Found ${fetchedRides.length} rides!`);
      }

    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to fetch rides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-9xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT: Filter Panel --- */}
        <aside className="w-full md:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-md font-bold text-slate-700 mb-2 ml-1">Source</label>
                <input 
                  type="text" placeholder="Your location" 
                  onChange={(e) => setFilters({...filters, source: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" 
                />
              </div>

              <div>
                <label className="block text-md font-bold text-slate-700 mb-2 ml-1">Destination</label>
                <input 
                  type="text" placeholder="College/Office" 
                  onChange={(e) => setFilters({...filters, destination: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" 
                />
              </div>

              <div>
                <label className="block text-md font-bold text-slate-700 mb-2 ml-1">Time Window</label>
                <div className="flex gap-2 mb-2">
                  {['Immediate', 'Schedule'].map(t => (
                    <button key={t} onClick={() => setFilters({...filters, timeMode: t.toLowerCase()})} className={`flex-1 py-2 text-md font-bold rounded-lg transition-all ${filters.timeMode === t.toLowerCase() ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{t}</button>
                  ))}
                </div>
                {filters.timeMode === 'schedule' && (
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setFilters({...filters, scheduledTime: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-emerald-500" 
                  />
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 text-md">Same-Gender Only</span>
                  <button 
                    type="button"
                    onClick={() => setFilters({...filters, genderPreference: !filters.genderPreference})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${filters.genderPreference ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${filters.genderPreference ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div>
                    <span className="font-bold text-blue-900 text-md block">Same Institution Only</span>
                    <p className="text-sm text-blue-700 leading-tight">Verify via campus email</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFilters({...filters, sameInstitution: !filters.sameInstitution})} 
                    className={`w-10 h-5 rounded-full relative transition-colors ${filters.sameInstitution ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${filters.sameInstitution ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-slate-900 text-md text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl active:scale-95 mt-4 disabled:bg-slate-400"
              >
                {loading ? "Searching..." : "Find Best Matches"}
              </button>
            </div>
          </div>
        </aside>

        {/* --- RIGHT: Ride Cards --- */}
        <main className="w-full md:w-3/4">
          {!searching ? (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4 text-slate-200">🔍</div>
              <p className="text-slate-400 font-bold text-lg tracking-tight">Enter your route details to find verified matches.</p>
            </div>
          ) : (
            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {rides.length === 0 && !loading && (
                 <div className="text-center p-10 text-slate-500">No rides found matching your criteria.</div>
              )}
              
              {rides.map((ride) => (
                <div key={ride.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  
                  {/* Priority Badge for Same Org */}
                  {ride.isSameOrg && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                        SAME ORGANIZATION
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Ride Giver Info */}
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white overflow-hidden">
                        {ride.driverImage ? (
                            <img src={ride.driverImage} alt={ride.driverName} className="w-full h-full object-cover" />
                        ) : (
                            "👤"
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900 text-lg">{ride.driverName}</h4>
                          <span className="text-blue-500" title="Verified Member">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {ride.driverGender || "Not Specified"} • {ride.isSameOrg ? "Colleague / Peer" : "External"}
                        </p>
                        <div className="mt-3 flex gap-1.5">
                          {/* Render Seats */}
                          {[...Array(ride.seatsAvailable || 1)].map((_, i) => (
                            <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] border bg-slate-50 text-slate-300 border-slate-100`}>
                              👤
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="flex-grow md:px-8 border-l border-slate-100">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 ring-4 ring-emerald-100" />
                        <p className="text-sm font-semibold text-slate-600 tracking-tight">{ride.source}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ring-4 ring-slate-100" />
                        <p className="text-sm font-black text-slate-900 tracking-tight">{ride.destination}</p>
                      </div>
                      <div className="mt-4 flex gap-4 text-xs text-slate-500 font-medium">
                         <span>📏 {ride.distance} km</span>
                         <span>⏱ {ride.duration} mins</span>
                      </div>
                    </div>

                    {/* Time & Action */}
                    <div className="text-right flex flex-col justify-between items-end min-w-[120px]">
                      <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-sm font-black shadow-sm border border-emerald-100">
                        {ride.departureTime === 'NOW' ? 'Leaving Now' : new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button 
                        onClick={() => navigate(`/ride-details/${ride.id}`)}
                        className="text-emerald-600 font-bold text-sm hover:text-emerald-700 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300"
                      >
                        View Details <span className="text-lg">→</span>
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