import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

const RideHistory = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [activeTab, setActiveTab] = useState("taker");

  const [requests, setRequests] = useState([]);
  const [postedRides, setPostedRides] = useState([]);
  const [payModalData, setPayModalData] = useState(null);

  // 🔥 Cost Calculation Helper
  const getDynamicCost = (distance) => {
    const dist = parseFloat(distance || 0);
    return Math.round(20 + dist * 10);
  };

  /* 🔥 UPDATED: Saves UPI to the USER profile instead of the ride */
  const handleUpdateGlobalUPI = async (upiId) => {
    if (!upiId) return toast.error("Please enter a UPI ID");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { driverUpi: upiId });

      // Update local storage so the UI reflects the change immediately
      const updatedUser = { ...user, driverUpi: upiId };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Global UPI ID updated for all your rides!");
    } catch (error) {
      console.error("Error updating global UPI:", error);
      toast.error("Failed to update UPI ID");
    }
  };

  /* 🔥 UPDATED: Fetches UPI from the DRIVER'S user document */
  const handlePassengerPay = async (req) => {
    try {
      // Look up the Driver's user document using driverId
      const driverRef = doc(db, "users", req.driverId);
      const driverSnap = await getDoc(driverRef);

      const latestUpi = driverSnap.exists()
        ? driverSnap.data().driverUpi
        : null;
      const fare = req.pricePerSeat || getDynamicCost(req.distance || 0);

      setPayModalData({
        ...req,
        fare,
        driverUpi: latestUpi,
      });
    } catch (error) {
      console.error("Error fetching Driver UPI:", error);
      toast.error("Could not fetch driver payment details");
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "ride_requests"),
      where("takerId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rides"), where("driverId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setPostedRides(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">
          My Activity
        </h1>

        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 mb-8 w-fit">
          <button
            onClick={() => setActiveTab("taker")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "taker"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Passenger
          </button>
          <button
            onClick={() => setActiveTab("giver")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "giver"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Driver
          </button>
        </div>

        {/* 🔥 NEW: Global UPI Setting (Shows only on Driver Tab) */}
        {activeTab === "giver" && (
          <div className="bg-emerald-900 text-white p-6 rounded-2xl mb-8 shadow-lg border border-emerald-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="font-bold text-lg">Global Payment Settings</h2>
              <p className="text-emerald-200 text-xs uppercase font-bold tracking-widest">
                Set once for all your rides
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                id="global-upi-input"
                placeholder="yourname@upi"
                defaultValue={user.driverUpi || ""}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 flex-1 md:w-64"
              />
              <button
                onClick={() =>
                  handleUpdateGlobalUPI(
                    document.getElementById("global-upi-input").value
                  )
                }
                className="bg-emerald-500 text-slate-900 font-black text-[10px] uppercase px-6 py-2.5 rounded-lg hover:bg-emerald-400 transition"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* --- PASSENGER VIEW --- */}
          {activeTab === "taker" &&
            (requests.length === 0 ? (
              <p className="text-slate-400 italic">No ride requests found.</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        req.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {req.status}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-2">
                      Pickup: {req.pickupLocation}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold">
                      Driver: {req.driverName}
                    </p>
                  </div>
                  {req.status === "ACCEPTED" && (
                    <button
                      onClick={() => handlePassengerPay(req)}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      <span>💸</span> Pay Fare
                    </button>
                  )}
                </div>
              ))
            ))}

          {/* --- DRIVER VIEW --- */}
          {activeTab === "giver" &&
            (postedRides.length === 0 ? (
              <p className="text-slate-400 italic">No rides posted.</p>
            ) : (
              postedRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                  <h3 className="font-bold text-slate-900 text-lg">
                    {ride.source} ➝ {ride.destination}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>📅 {ride.departureTime}</span>
                    <span className="text-emerald-600 font-bold">
                      💰 Earned: ₹
                      {(ride.passengers?.length || 0) *
                        (ride.pricePerSeat || getDynamicCost(ride.distance))}
                    </span>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>

      {/* 💰 PAYMENT MODAL */}
      {payModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-sm w-full shadow-2xl relative">
            <button
              onClick={() => setPayModalData(null)}
              className="absolute top-4 right-4 text-slate-400"
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">Payment</h3>
              <p className="text-slate-500 text-xs mb-6">
                Paying Driver:{" "}
                <span className="text-emerald-600 font-bold">
                  {payModalData.driverName}
                </span>
              </p>
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block mb-6">
                <QRCode
                  value={`upi://pay?pa=${
                    payModalData.driverUpi || "merchant@upi"
                  }&pn=${payModalData.driverName}&am=${
                    payModalData.fare
                  }&cu=INR`}
                  size={180}
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl mb-4">
                <p className="text-4xl font-black text-slate-900">
                  ₹{payModalData.fare}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  UPI: {payModalData.driverUpi || "Not set by driver"}
                </p>
              </div>
              <button
                onClick={() => setPayModalData(null)}
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl"
              >
                I have Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideHistory;
