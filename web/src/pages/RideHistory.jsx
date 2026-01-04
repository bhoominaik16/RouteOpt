import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import QRCode from "react-qr-code"; // 📦 QR Code Library

const RideHistory = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('taker');
  
  const [requests, setRequests] = useState([]); // Rides I requested (Passenger)
  const [postedRides, setPostedRides] = useState([]); // Rides I posted (Driver)
  
  const [payModalData, setPayModalData] = useState(null); // Controls the Payment Modal

  // 1. Fetch Requests (Passenger View)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "ride_requests"), where("takerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // 2. Fetch Posted Rides (Driver View)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rides"), where("driverId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
        setPostedRides(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Activity</h1>

        {/* TABS */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('taker')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'taker' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Passenger
          </button>
          <button 
            onClick={() => setActiveTab('giver')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'giver' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Driver
          </button>
        </div>

        {/* LIST VIEW */}
        <div className="space-y-4">
          
          {/* --- PASSENGER VIEW --- */}
          {activeTab === 'taker' && (
            requests.length === 0 ? <p className="text-slate-400 italic">No ride requests found.</p> :
            requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                     }`}>
                        {req.status}
                     </span>
                     <span className="text-xs text-slate-400 font-medium">
                        {req.timestamp?.toDate().toLocaleDateString()}
                     </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Pickup: {req.pickupLocation}</h3>
                  <p className="text-sm text-slate-500">Driver: {req.driverName || 'Unknown'}</p>
                </div>

                {/* 💰 PAY BUTTON (Only if Accepted) */}
                {req.status === 'ACCEPTED' && (
                    <button 
                        onClick={() => setPayModalData(req)}
                        className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                        <span>💸</span> Pay ₹{req.price || 0}
                    </button>
                )}
              </div>
            ))
          )}

          {/* --- DRIVER VIEW --- */}
          {activeTab === 'giver' && (
             postedRides.length === 0 ? <p className="text-slate-400 italic">You haven't posted any rides.</p> :
             postedRides.map((ride) => (
                <div key={ride.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <h3 className="font-bold text-slate-900">{ride.source} ➝ {ride.destination}</h3>
                   <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>📅 {ride.departureTime}</span>
                      <span>💰 Earned: ₹{(ride.passengers?.length || 0) * (ride.pricePerSeat || 0)}</span>
                   </div>
                </div>
             ))
          )}
        </div>
      </div>

      {/* 💰 PAYMENT MODAL (QR CODE) */}
      {payModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                <button 
                    onClick={() => setPayModalData(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    ✕
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        💸
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Payment</h3>
                    <p className="text-slate-500 text-sm mb-6">Scan with any UPI App (GPay/Paytm)</p>
                    
                    {/* QR Code Container */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block shadow-inner mb-6">
                        <QRCode 
                            // Standard UPI Link Format
                            value={`upi://pay?pa=driver@upi&pn=RouteOptDriver&am=${payModalData.price || 0}&cu=INR`}
                            size={180}
                            viewBox={`0 0 180 180`}
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Amount</p>
                        <p className="text-4xl font-black text-slate-900">₹{payModalData.price || 0}</p>
                    </div>

                    <button 
                        onClick={() => {
                            setPayModalData(null);
                            // In a real app, you would verify payment API status here
                            alert("Payment marked as done! (Demo)");
                        }}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
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