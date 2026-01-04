import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import QRCode from "react-qr-code"; 

const RideHistory = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('taker');
  
  const [requests, setRequests] = useState([]); 
  const [postedRides, setPostedRides] = useState([]); 
  
  const [payModalData, setPayModalData] = useState(null); 

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
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">My Activity</h1>

        {/* TABS */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('taker')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'taker' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Passenger Logs
          </button>
          <button 
            onClick={() => setActiveTab('giver')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'giver' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Driver Earnings
          </button>
        </div>

        <div className="space-y-4">
          
          {/* --- PASSENGER VIEW (COST VISIBILITY) --- */}
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
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Driver: {req.driverName || 'Unknown'}</p>
                </div>

                {/* 💰 UPDATED PAY BUTTON (Uses pricePerSeat from request) */}
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Trip Fare</p>
                    <button 
                        onClick={() => setPayModalData(req)}
                        disabled={req.status !== 'ACCEPTED'}
                        className={`px-6 py-3 font-bold rounded-xl shadow-lg transition flex items-center gap-2 ${
                            req.status === 'ACCEPTED' 
                            ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <span>💸</span> ₹{req.pricePerSeat || 0}
                    </button>
                </div>
              </div>
            ))
          )}

          {/* --- DRIVER VIEW (EARNINGS VISIBILITY) --- */}
          {activeTab === 'giver' && (
             postedRides.length === 0 ? <p className="text-slate-400 italic">You haven't posted any rides.</p> :
             postedRides.map((ride) => {
                // Calculate dynamic earnings per ride
                const rideEarnings = (ride.passengers?.length || 0) * (ride.pricePerSeat || 0);

                return (
                    <div key={ride.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                       <div>
                          <h3 className="font-bold text-slate-900 text-lg truncate max-w-[250px]">{ride.source} ➝ {ride.destination}</h3>
                          <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>📅 {ride.departureTime}</span>
                            <span>🛣️ {ride.distance} km</span>
                            <span>👤 {ride.passengers?.length || 0} Passengers</span>
                          </div>
                       </div>
                       
                       {/* EARNINGS DISPLAY */}
                       <div className="text-right bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-800 uppercase">Earned</p>
                          <p className="text-2xl font-black text-emerald-700 leading-none">₹{rideEarnings}</p>
                       </div>
                    </div>
                );
             })
          )}
        </div>
      </div>

      {/* 💰 PAYMENT MODAL (Uses payModalData.pricePerSeat) */}
      {payModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                <button onClick={() => setPayModalData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>

                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 mb-1">Scan to Pay</h3>
                    <p className="text-slate-500 text-xs mb-6 tracking-wide">Standard UPI Protocol</p>
                    
                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block shadow-inner mb-6">
                        <QRCode 
                            value={`upi://pay?pa=driver@upi&pn=RouteOptDriver&am=${payModalData.pricePerSeat || 0}&cu=INR`}
                            size={180}
                            viewBox={`0 0 180 180`}
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Amount</p>
                        <p className="text-4xl font-black text-slate-900">₹{payModalData.pricePerSeat || 0}</p>
                    </div>

                    <button 
                        onClick={() => { setPayModalData(null); alert("Payment verified!"); }}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-widest text-xs"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RideHistory;