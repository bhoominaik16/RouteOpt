import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// 🔥 Firebase Imports
import { db } from '../firebase';
import { 
  collection, query, where, onSnapshot, 
  doc, updateDoc, increment, arrayUnion, orderBy, limit 
} from 'firebase/firestore';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});

const RideGiverDashboard = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentRideRoute, setCurrentRideRoute] = useState([]);
  const [rideDetails, setRideDetails] = useState(null);
  const [confirmedPassengers, setConfirmedPassengers] = useState([]);

  // 1. FETCH ACTIVE RIDE & CONFIRMED PASSENGERS
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "rides"),
      where("driverId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        const rideData = rideDoc.data();
        setRideDetails({ id: rideDoc.id, ...rideData });
        setConfirmedPassengers(rideData.passengers || []); // Sync confirmed list
        
        if (rideData.routeGeometry) {
          const polyline = rideData.routeGeometry.map(p => [p.lat, p.lng]);
          setCurrentRideRoute(polyline);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. LISTEN FOR PENDING REQUESTS
  useEffect(() => {
    if (!user) return;
    const q = query(
        collection(db, "ride_requests"),
        where("driverId", "==", user.uid),
        where("status", "==", "PENDING")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveRequests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setRequests(liveRequests);

        // Update selected request if it still exists in the list, otherwise pick first
        if (liveRequests.length > 0) {
            const stillExists = liveRequests.find(r => r.id === selectedRequest?.id);
            if (!stillExists) setSelectedRequest(liveRequests[0]);
        } else {
            setSelectedRequest(null);
        }
    });
    return () => unsubscribe();
  }, [user, selectedRequest]);

  // Improved Coordinate Helper
  const extractPosition = (item) => {
    if (!item) return null;
    // 1. Try actual coordinates
    if (item.pickupCoords && typeof item.pickupCoords.lat === 'number') {
      return [item.pickupCoords.lat, item.pickupCoords.lng];
    }
    // 2. Fallback for demo (middle of route if coords missing)
    if (currentRideRoute.length > 2) {
        return currentRideRoute[Math.floor(currentRideRoute.length / 2)];
    }
    return null;
  };

  const handleAccept = async () => {
    if (!selectedRequest || !rideDetails) return;
    const toastId = toast.loading("Adding to ride...");
    try {
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), { status: "ACCEPTED" });
        await updateDoc(doc(db, "rides", rideDetails.id), {
            seatsAvailable: increment(-1),
            passengers: arrayUnion({
                uid: selectedRequest.takerId,
                name: selectedRequest.takerName,
                pickupCoords: selectedRequest.pickupCoords || null, // Ensure coords move to ride doc
                pickupLocation: selectedRequest.pickupLocation
            })
        });
        toast.success(`Accepted ${selectedRequest.takerName}!`, { id: toastId });
    } catch (error) {
        toast.error("Failed to accept.");
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;
    try {
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), { status: "REJECTED" });
        toast("Request declined", { icon: '👋' });
    } catch (error) {
        toast.error("Error declining");
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">      
      <div className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        
        {/* --- LEFT COLUMN --- */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
          {/* Confirmed List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[40%]">
            <div className="p-4 bg-emerald-50/50 border-b border-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">Confirmed Members</h3>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
                {confirmedPassengers.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 text-xs">
                            <p className="font-bold text-slate-800 truncate">{p.name}</p>
                            <p className="text-slate-400 truncate uppercase text-[9px]">📍 {p.pickupLocation || "Joined"}</p>
                        </div>
                    </div>
                ))}
                {confirmedPassengers.length === 0 && <p className="text-[10px] text-slate-400 text-center py-4 italic">Waiting for members...</p>}
            </div>
          </div>

          {/* Waitlist */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col flex-grow overflow-hidden">
            <div className="p-5 border-b border-slate-50"><h3 className="text-md font-bold text-slate-900">Waitlist</h3></div>
            <div className="overflow-y-auto flex-grow p-4 space-y-3">
              {requests.map((req) => (
                <div key={req.id} onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedRequest?.id === req.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                >
                  <h4 className="font-bold text-slate-900 text-sm">{req.takerName}</h4>
                  <span className="text-[9px] text-slate-500 font-medium uppercase mt-1 block tracking-tighter">📍 Pickup: {req.pickupLocation || "View on map"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          {selectedRequest && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row justify-between items-center animate-in fade-in slide-in-from-top-4">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">👋</div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none mb-1">{selectedRequest.takerName}</h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase">New Requesting at: {selectedRequest.pickupLocation}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDecline} className="px-5 py-2 rounded-xl font-bold bg-slate-100 text-slate-500 hover:bg-red-50 text-xs uppercase">Decline</button>
                    <button onClick={handleAccept} className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white shadow-lg text-xs uppercase">Accept</button>
                </div>
            </div>
          )}

          <div className="flex-grow bg-slate-200 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-xl relative min-h-0">
            <MapContainer center={[19.1291, 72.9095]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {currentRideRoute.length > 0 && (
                <>
                  <Polyline positions={currentRideRoute} color="#EF4444" weight={6} opacity={0.6} />
                  <Marker position={currentRideRoute[0]} icon={redIcon}><Popup>Start</Popup></Marker>
                  <Marker position={currentRideRoute[currentRideRoute.length - 1]} icon={redIcon}><Popup>End</Popup></Marker>
                </>
              )}

              {/* 🟢 FIXED POINTERS: Confirmed Members */}
              {confirmedPassengers.map((p, i) => {
                const pos = extractPosition(p);
                return pos ? <Marker key={`fixed-${i}`} position={pos} icon={greenIcon} opacity={0.7}><Popup>Member: {p.name}</Popup></Marker> : null;
              })}

              {/* 🔵 FLOATING POINTER: Current Selected Request (Only shows if item in waitlist is clicked) */}
              {selectedRequest && (
                <Marker key={`active-${selectedRequest.id}`} position={extractPosition(selectedRequest)} icon={greenIcon}>
                  <Popup>Current Selection: {selectedRequest.takerName}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideGiverDashboard;