import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [genderFilter, setGenderFilter] = useState(false);

  // User State
  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser || null;
  });

  // --- DEMO DATA (Fallback if Firebase is empty) ---
  const DEMO_STATS = {
    greenPoints: 1250,
    co2Saved: '45.8',
    ridesCompleted: 24,
    rank: 12
  };

  const DEMO_CHART = [
    { name: 'Oct', saved: 12.5 },
    { name: 'Nov', saved: 18.2 },
    { name: 'Dec', saved: 15.1 },
    { name: 'Jan', saved: 8.5 },
  ];

  const [stats, setStats] = useState(DEMO_STATS);
  const [chartData, setChartData] = useState(DEMO_CHART);
  const [loading, setLoading] = useState(true);

  // --- HYBRID FETCH: Real Data first, fallback to Demo ---
  useEffect(() => {
    const fetchCarbonStats = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "rides"),
          where("driverId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        
        // IF NO REAL RIDES FOUND -> KEEP DEMO DATA
        if (querySnapshot.empty) {
           console.log("No real rides found, using Demo Data");
           setLoading(false);
           return; 
        }

        // IF REAL DATA EXISTS -> CALCULATE IT
        let totalDistance = 0;
        let totalRides = 0;
        const monthlyData = {}; 

        querySnapshot.forEach((doc) => {
          const ride = doc.data();
          const distance = parseFloat(ride.route?.distance || 0);
          totalDistance += distance;
          totalRides += 1;

          if (ride.createdAt) {
             const date = ride.createdAt.toDate();
             const month = date.toLocaleString('default', { month: 'short' });
             if (!monthlyData[month]) monthlyData[month] = 0;
             monthlyData[month] += (distance * 0.12);
          }
        });

        const co2Total = (totalDistance * 0.12).toFixed(1);
        const points = Math.round(totalDistance * 10);

        setStats({
          greenPoints: points,
          co2Saved: co2Total,
          ridesCompleted: totalRides,
          rank: points > 500 ? 5 : 120
        });

        const formattedChartData = Object.keys(monthlyData).map(month => ({
          name: month,
          saved: parseFloat(monthlyData[month].toFixed(1))
        }));
        
        setChartData(formattedChartData);

      } catch (error) {
        console.error("Error fetching stats, using fallback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonStats();
  }, [user]);


  // --- Helper Functions ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        const updatedUser = { ...user, profileImage: base64Image };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!user) return <div className="p-10 text-center">Please log in to view profile.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: Profile Card --- */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative">
               
               {/* Profile Image Logic */}
               <div className="relative mx-auto w-28 h-28 mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-emerald-50">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-4xl font-bold uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                  )}
                </div>
                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 mb-4">{user.email}</p>
              
              <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                Verified Member
              </div>
            </div>

            {/* Safety Toggle */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Safety Preferences
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Same-Gender Only</p>
                  <p className="text-xs text-slate-400">Match with {user.gender || 'same-gender'} only</p>
                </div>
                <button 
                  onClick={() => setGenderFilter(!genderFilter)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${genderFilter ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${genderFilter ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Stats & Graphs --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Bento Grid Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">🌱</div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Green Points</p>
                <h4 className="text-4xl font-black">{stats.greenPoints}</h4>
                <p className="text-xs mt-2 text-emerald-200 font-medium">Lifetime Total</p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">CO₂ Offset</p>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-900">{stats.co2Saved}</h4>
                        <span className="text-sm font-bold text-slate-500">kg</span>
                    </div>
                    <p className="text-xs mt-2 text-emerald-600 font-bold flex items-center gap-1">
                       <span className="bg-emerald-100 px-1 rounded">Equivalent to</span> {Math.ceil(parseFloat(stats.co2Saved) * 2)} trees planted
                    </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Org Rank</p>
                <h4 className="text-4xl font-black text-slate-900">#{stats.rank}</h4>
                <p className="text-xs mt-2 text-slate-500">Top 15% of Commuters</p>
              </div>
            </div>

            {/* 2. REAL-TIME CHART SECTION */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-bold text-slate-900 text-lg">Emission Savings Trend</h3>
                    <p className="text-sm text-slate-500">Your impact over the last few months</p>
                 </div>
                 <div className="flex gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Saved</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Avg</span>
                 </div>
              </div>
              
              <div className="h-64 w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">Loading Chart Data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip 
                            cursor={{ fill: '#f1f5f9', radius: 4 }} 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="saved" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.saved > 5 ? '#10b981' : '#cbd5e1'} />
                            ))}
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 3. Rewards Progress */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Unlockable Rewards</h3>
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-100">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-50">🎁</div>
                <div className="flex-grow">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                        <h4 className="font-bold text-emerald-900 tracking-tight">Reserved Parking Spot</h4>
                        <p className="text-xs text-emerald-600/80">Next Tier Reward</p>
                     </div>
                     <span className="text-lg font-black text-emerald-600">
                        {Math.min(100, Math.round((stats.greenPoints / 2000) * 100))}%
                     </span>
                  </div>
                  <div className="w-full h-3 bg-emerald-100/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, (stats.greenPoints / 2000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-right">{2000 - stats.greenPoints} more points needed</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;