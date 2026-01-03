import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [genderFilter, setGenderFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch auth user + Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        No user data found
      </div>
    );
  }

  // Mock stats (can later come from Firestore)
  const stats = {
    greenPoints: 1250,
    co2Saved: "45.8 kg",
    ridesCompleted: 24,
    rank: 12,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="grow max-w-7xl mx-auto w-full px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase mx-auto mb-4 shadow-lg">
                {userData.name[0]}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {userData.name}
              </h2>
              <p className="text-slate-500 mb-6">{userData.email}</p>
              <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                Verified Organization Member
              </div>
            </div>

            {/* Safety Preferences */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-600"
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
                Safety Preferences
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Same-Gender Only
                  </p>
                  <p className="text-xs text-slate-400">
                    Only match with same-gender commuters
                  </p>
                </div>

                <button
                  onClick={() => setGenderFilter(!genderFilter)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    genderFilter ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      genderFilter ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg">
                <p className="text-emerald-100 text-sm uppercase mb-1">
                  Green Points
                </p>
                <h4 className="text-3xl font-black">{stats.greenPoints}</h4>
              </div>

              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <p className="text-slate-400 text-sm uppercase mb-1">
                  CO₂ Offset
                </p>
                <h4 className="text-3xl font-black text-slate-900">
                  {stats.co2Saved}
                </h4>
              </div>

              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <p className="text-slate-400 text-sm uppercase mb-1">
                  Org Rank
                </p>
                <h4 className="text-3xl font-black text-slate-900">
                  #{stats.rank}
                </h4>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border">
              <h3 className="font-bold mb-4">Carbon Reduction Overview</h3>
              <div className="h-48 bg-slate-50 rounded-2xl border-2 border-dashed flex items-center justify-center text-slate-400">
                Chart Placeholder
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border">
              <h3 className="font-bold mb-6">Upcoming Rewards</h3>
              <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-2xl border">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                  🅿️
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">
                    Reserved Parking Spot
                  </h4>
                  <p className="text-sm text-emerald-700">
                    Reach 2000 Green Points to unlock.
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-black text-emerald-600">62%</p>
                  <div className="w-24 h-2 bg-emerald-200 rounded-full">
                    <div className="w-[62%] h-full bg-emerald-600" />
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
