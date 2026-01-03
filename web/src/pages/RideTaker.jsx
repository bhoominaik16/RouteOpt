import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

// 🔥 Firebase
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const RideTaker = () => {
  const [user, setUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [rides, setRides] = useState([]);

  const [filters, setFilters] = useState({
    source: "",
    destination: "",
    genderPreference: false,
  });

  // 🔐 Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("Please login to find rides");
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 🔍 Fetch rides from Firestore
  const handleSearch = async () => {
    setSearching(true);

    try {
      const snapshot = await getDocs(collection(db, "rides"));
      let fetchedRides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 👩‍🦱 Gender preference filter
      if (filters.genderPreference) {
        fetchedRides = fetchedRides.filter(
          (ride) => ride.genderPreference === true
        );
      }

      setRides(fetchedRides);
      toast.success("Matching rides found");
    } catch (err) {
      toast.error("Failed to fetch rides");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-9xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* FILTERS */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-24">
            <h3 className="text-xl font-bold mb-6">Filters</h3>

            <div className="space-y-4">
              <input
                placeholder="Source"
                className="w-full px-4 py-2 bg-slate-50 rounded-xl"
                onChange={(e) =>
                  setFilters({ ...filters, source: e.target.value })
                }
              />

              <input
                placeholder="Destination"
                className="w-full px-4 py-2 bg-slate-50 rounded-xl"
                onChange={(e) =>
                  setFilters({ ...filters, destination: e.target.value })
                }
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Same-Gender Only</span>
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      genderPreference: !filters.genderPreference,
                    })
                  }
                  className={`w-10 h-5 rounded-full relative ${
                    filters.genderPreference ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${
                      filters.genderPreference ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
              >
                Search Rides
              </button>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <main className="w-full md:w-3/4">
          {!searching ? (
            <div className="bg-white p-20 text-center rounded-3xl border border-dashed">
              <p className="text-slate-400">Enter details to find rides</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {rides.length === 0 && (
                <p className="text-slate-400 text-center">
                  No matching rides found
                </p>
              )}

              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white p-6 rounded-3xl border shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{ride.driverEmail}</h4>
                      <p className="text-sm text-slate-500">
                        {ride.source} → {ride.destination}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        Seats: {ride.seats}
                      </p>
                      <p className="text-xs text-slate-400">{ride.departure}</p>
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
