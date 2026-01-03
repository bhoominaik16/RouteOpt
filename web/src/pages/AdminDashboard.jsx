import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRides: 0,
    totalCo2Saved: "0.0",
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // 1. DYNAMIC SOS FEED (Your working logic restored)
    const qAlerts = query(
      collection(db, "sos_alerts"),
      orderBy("timestamp", "desc")
    );
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      setAlerts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // 2. INTEGRATED STATS (Users, Rides, CO2)
    // Listen to Rides for dynamic CO2 and Active Ride count
    const unsubRides = onSnapshot(collection(db, "rides"), (snapshot) => {
      let totalKm = 0;
      let activeCount = 0;
      const monthlyMap = {};

      snapshot.docs.forEach((doc) => {
        const ride = doc.data();
        const distance = parseFloat(ride.distance || 0);
        totalKm += distance;

        // Active parameter: rides currently ongoing
        if (["requested", "accepted", "ongoing"].includes(ride.status))
          activeCount++;

        // Aggregate for Chart
        if (ride.createdAt) {
          const month = ride.createdAt
            .toDate()
            .toLocaleString("default", { month: "short" });
          if (!monthlyMap[month]) monthlyMap[month] = 0;
          monthlyMap[month] += distance * 0.12;
        }
      });

      setStats((prev) => ({
        ...prev,
        activeRides: activeCount,
        totalCo2Saved: (totalKm * 0.12).toFixed(1),
      }));

      setChartData(
        Object.keys(monthlyMap).map((m) => ({
          name: m,
          saved: parseFloat(monthlyMap[m].toFixed(1)),
        }))
      );
    });

    // Listen to Users for Total User count
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalUsers: snapshot.size }));
    });

    return () => {
      unsubAlerts();
      unsubRides();
      unsubUsers();
    };
  }, []);

  const resolveAlert = async (id, userName) => {
    try {
      const alertRef = doc(db, "sos_alerts", id);
      await updateDoc(alertRef, {
        status: "RESOLVED",
        dispatchedAt: serverTimestamp(),
      });
      toast.success(`Security dispatched for ${userName}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              Admin Dashboard
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Real-time Security & Impact Monitor
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              System: Secure
            </span>
          </div>
        </header>

        {/* DYNAMIC STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Active SOS"
            value={alerts.filter((a) => a.status === "ACTIVE").length}
            color="text-red-600"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            color="text-slate-800"
          />
          <StatCard
            title="Active Rides"
            value={stats.activeRides}
            color="text-emerald-600"
          />
          <StatCard
            title="CO₂ Saved"
            value={`${stats.totalCo2Saved}kg`}
            color="text-blue-600"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* EMERGENCY FEED (33% Width) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              🚨 Security Feed{" "}
              {loading && <span className="animate-spin text-sm">↻</span>}
            </h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                  Network Clear
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-3xl border-l-8 shadow-sm transition-all ${
                      alert.status === "ACTIVE"
                        ? "bg-red-50 border-red-500"
                        : "bg-white border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          alert.status === "ACTIVE"
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {alert.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {alert.timestamp?.toDate().toLocaleTimeString() ||
                          "Just now"}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900">
                      {alert.userName}
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-4 font-mono truncate">
                      {alert.uid}
                    </p>

                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps?q=${alert.location?.lat},${alert.location?.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl text-center hover:bg-slate-50 transition"
                      >
                        VIEW MAP
                      </a>
                      {alert.status === "ACTIVE" && (
                        <button
                          onClick={() => resolveAlert(alert.id, alert.userName)}
                          className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-100"
                        >
                          DISPATCH
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ANALYTICS TRENDS (66% Width) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
                Sustainability Analytics
              </h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorSaved"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        dy={10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="saved"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorSaved)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest font-bold animate-pulse">
                    Waiting for ride data...
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
                Protocol Note
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                All SOS alerts include user UID and verified email. Dispatching
                sends an immediate broadcast to local security units and logs
                the event for campus audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal reusable card component
const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {title}
    </p>
    <h3 className={`text-3xl font-black mt-1 ${color}`}>{value}</h3>
  </div>
);

export default AdminDashboard;
