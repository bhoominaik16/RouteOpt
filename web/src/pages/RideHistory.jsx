import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const RideHistory = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  
  const [myRequests, setMyRequests] = useState([]);
  const [myDrives, setMyDrives] = useState([]); // Stores rides where I am the driver
  const [activeTab, setActiveTab] = useState('taker'); // 'taker' or 'driver'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // 1. Fetch Requests I Sent (AS PASSENGER)
    const qRequests = query(
      collection(db, "ride_requests"),
      where("takerId", "==", user.uid)
    );

    // 2. Fetch Rides I Posted (AS DRIVER)
    const qDrives = query(
      collection(db, "rides"),
      where("driverId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reqs.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setMyRequests(reqs);
    });

    const unsubDrives = onSnapshot(qDrives, (snapshot) => {
      const drives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyDrives(drives);
      setLoading(false);
    });

    return () => {
      unsubRequests();
      unsubDrives();
    };
  }, [user]);

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Activity</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1">
          <button 
            onClick={() => setActiveTab('taker')}
            className={`pb-3 px-4 font-bold text-sm transition-all ${activeTab === 'taker' ? 'text-emerald-600 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Rides I'm Taking
          </button>
          <button 
            onClick={() => setActiveTab('driver')}
            className={`pb-3 px-4 font-bold text-sm transition-all ${activeTab === 'driver' ? 'text-emerald-600 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Rides I'm Driving
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
          
          {/* --- TAB 1: REQUESTS (PASSENGER) --- */}
          {activeTab === 'taker' && (
            <div className="divide-y divide-slate-50">
              {myRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">🙋‍♂️</div>
                  <h3 className="text-slate-900 font-bold">No requests sent</h3>
                  <button onClick={() => navigate('/ride-taker')} className="text-emerald-600 font-bold hover:underline mt-2">Find a Ride</button>
                </div>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {req.status === 'ACCEPTED' ? '✓' : req.status === 'REJECTED' ? '✕' : '⏳'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Request for {req.pickupLocation}</h3>
                        <p className="text-xs text-slate-500">Sent on {req.timestamp?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                         req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                         req.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                       }`}>{req.status}</span>
                       
                       {req.status === 'ACCEPTED' && (
                         <button onClick={() => navigate(`/ride-details/${req.rideId}`)} className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200">
                           View Ride
                         </button>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* --- TAB 2: PUBLISHED RIDES (DRIVER) --- */}
          {activeTab === 'driver' && (
            <div className="divide-y divide-slate-50">
              {myDrives.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">🚗</div>
                  <h3 className="text-slate-900 font-bold">You haven't posted any rides</h3>
                  <button onClick={() => navigate('/ride-giver')} className="text-emerald-600 font-bold hover:underline mt-2">Post a Ride</button>
                </div>
              ) : (
                myDrives.map((ride) => (
                  <div key={ride.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shrink-0">
                        📍
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{ride.source} → {ride.destination}</h3>
                        <p className="text-xs text-slate-500">
                           {ride.departureTime === 'NOW' ? 'Leaving Now' : new Date(ride.departureTime).toLocaleString()} • {ride.distance} km
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                       <div className="text-right mr-4">
                          <p className="text-xs font-bold text-slate-400 uppercase">Seats</p>
                          <p className="font-black text-slate-800">{ride.seatsAvailable} Left</p>
                       </div>
                       
                       {/* Link to Dashboard to manage requests */}
                       <button 
                         onClick={() => navigate('/ride-giver-dashboard')}
                         className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-lg"
                       >
                          Manage Requests
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RideHistory;