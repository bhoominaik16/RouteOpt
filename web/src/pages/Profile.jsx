import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [genderFilter, setGenderFilter] = useState(false);

  // User State
  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    return savedUser || null;
  });

  // --- DEMO DATA (Fallback if Firebase is empty) ---
  const DEMO_STATS = {
    greenPoints: 1250,
    co2Saved: "45.8",
    ridesCompleted: 24,
    rank: 12,
  };

  const DEMO_CHART = [
    { name: "Oct", saved: 12.5 },
    { name: "Nov", saved: 18.2 },
    { name: "Dec", saved: 15.1 },
    { name: "Jan", saved: 8.5 },
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
            const month = date.toLocaleString("default", { month: "short" });
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += distance * 0.12;
          }
        });

        const co2Total = (totalDistance * 0.12).toFixed(1);
        const points = Math.round(totalDistance * 10);

        setStats({
          greenPoints: points,
          co2Saved: co2Total,
          ridesCompleted: totalRides,
          rank: points > 500 ? 5 : 120,
        });

        const formattedChartData = Object.keys(monthlyData).map((month) => ({
          name: month,
          saved: parseFloat(monthlyData[month].toFixed(1)),
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
        localStorage.setItem("user", JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600">Please log in to view your profile</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: Profile Card --- */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Profile Image Logic */}
              <div className="relative mx-auto w-32 h-32 mb-6 z-10">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-emerald-100/50 group-hover:ring-emerald-200 transition-all duration-300">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold uppercase">
                      {user.name ? user.name[0] : "U"}
                    </div>
                  )}
                </div>
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-1 right-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 ring-4 ring-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {user.name}
                </h2>
                <p className="text-slate-500 mb-6 text-sm">{user.email}</p>

                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200/50 shadow-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified Member
                </div>
              </div>
            </div>

            {/* Safety Toggle - Enhanced */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className="text-lg">Safety Preferences</span>
              </h3>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Same-Gender Only
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match with {user.gender || "same-gender"} only
                  </p>
                </div>
                <button
                  onClick={() => setGenderFilter(!genderFilter)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner ${
                    genderFilter
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200"
                      : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${
                      genderFilter ? "left-7" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Stats & Graphs --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Bento Grid Stats - Enhanced */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600 p-7 rounded-3xl text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-6 -mb-6"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🌱</span>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                      Green Points
                    </p>
                  </div>
                  <h4 className="text-5xl font-black mb-2">
                    {stats.greenPoints}
                  </h4>
                  <div className="flex items-center gap-1.5 text-emerald-200">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs font-semibold">Lifetime Total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-white/60 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full -mr-10 -mt-10 opacity-60 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">☁️</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      CO₂ Offset
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h4 className="text-5xl font-black text-slate-900">
                      {stats.co2Saved}
                    </h4>
                    <span className="text-lg font-bold text-slate-500">kg</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full">
                    <span className="text-emerald-600 text-xl">🌳</span>
                    <p className="text-xs font-bold text-emerald-700">
                      {Math.ceil(parseFloat(stats.co2Saved) * 2)} trees planted
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-white/60 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full -mr-8 -mt-8 opacity-60 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      Org Rank
                    </p>
                  </div>
                  <h4 className="text-5xl font-black text-slate-900 mb-2">
                    #{stats.rank}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Top 15% of Commuters
                  </p>
                </div>
              </div>
            </div>

            {/* 2. REAL-TIME CHART SECTION - Enhanced */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Emission Savings Trend
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Your impact over the last few months
                  </p>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Saved
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    Avg
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium">
                      Loading Chart Data...
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f1f5f9", radius: 8 }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                          padding: "12px 16px",
                          background: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(12px)",
                        }}
                        labelStyle={{ fontWeight: 700, color: "#0f172a" }}
                      />
                      <Bar dataKey="saved" radius={[8, 8, 0, 0]} barSize={48}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.saved > 5
                                ? "url(#greenGradient)"
                                : "#cbd5e1"
                            }
                          />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient
                          id="greenGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 3. Rewards Progress - Enhanced */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-300">
              <h3 className="font-bold text-slate-900 mb-6 text-xl flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                Unlockable Rewards
              </h3>
              <div className="relative overflow-hidden">
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent rounded-2xl border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-white to-emerald-50 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white ring-2 ring-emerald-100">
                    🅿️
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="font-bold text-emerald-900 tracking-tight text-lg">
                          Reserved Parking Spot
                        </h4>
                        <p className="text-xs text-emerald-600/80 font-medium mt-0.5">
                          Next Tier Reward
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black bg-gradient-to-br from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                          {Math.min(
                            100,
                            Math.round((stats.greenPoints / 2000) * 100)
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
                        style={{
                          width: `${Math.min(
                            100,
                            (stats.greenPoints / 2000) * 100
                          )}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-right font-semibold flex items-center justify-end gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {2000 - stats.greenPoints} more points needed
                    </p>
                  </div>
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
