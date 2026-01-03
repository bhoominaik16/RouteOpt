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

  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    return savedUser || null;
  });

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

  useEffect(() => {
    const fetchCarbonStats = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "rides"),
          where("driverId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        let totalDistance = 0;
        let totalRides = 0;
        const monthlyData = {};

        snapshot.forEach((doc) => {
          const ride = doc.data();
          const distance = parseFloat(ride.route?.distance || 0);
          totalDistance += distance;
          totalRides++;

          if (ride.createdAt) {
            const month = ride.createdAt
              .toDate()
              .toLocaleString("default", { month: "short" });

            monthlyData[month] = (monthlyData[month] || 0) + distance * 0.12;
          }
        });

        setStats({
          greenPoints: Math.round(totalDistance * 10),
          co2Saved: (totalDistance * 0.12).toFixed(1),
          ridesCompleted: totalRides,
          rank: totalDistance > 50 ? 5 : 120,
        });

        setChartData(
          Object.keys(monthlyData).map((m) => ({
            name: m,
            saved: +monthlyData[m].toFixed(1),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonStats();
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = { ...user, profileImage: reader.result };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-semibold">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow text-center">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-100">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold">
                    {user.name?.[0] || "U"}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full"
              >
                ✏️
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Stat title="Green Points" value={stats.greenPoints} />
            <Stat title="CO₂ Saved (kg)" value={stats.co2Saved} />
            <Stat title="Rank" value={`#${stats.rank}`} />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold mb-4">Emission Savings</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="saved">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="#10b981" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white rounded-2xl p-6 shadow">
    <p className="text-xs text-slate-400 uppercase">{title}</p>
    <h4 className="text-3xl font-bold">{value}</h4>
  </div>
);

export default Profile;
