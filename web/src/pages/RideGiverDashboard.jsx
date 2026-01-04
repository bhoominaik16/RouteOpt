import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// 🔥 Firebase Imports
import { db } from '../firebase';
import { 
  collection, query, where, onSnapshot, 
  doc, updateDoc, increment, arrayUnion, orderBy, limit 
} from 'firebase/firestore';

// --- CUSTOM ICONS ---
const routeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const passengerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const requestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

// 🛡️ SAFETY HELPER: Checks if lat/lng are actual numbers
const isValidCoords = (coords) => {
    return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
};

// --- HELPER: Auto-Zoom Map to Fit Route & Pins ---
const MapBounds = ({ route, passengers, selectedReq }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!route || route.length === 0) return;

    // Start with route bounds
    const bounds = L.latLngBounds(route); 

    // Extend bounds to include VALID passengers only
    passengers.forEach(p => {
      if(isValidCoords(p.pickupCoords)) {
          bounds.extend([p.pickupCoords.lat, p.pickupCoords.lng]);
      }
    });

    // Extend bounds to include selected request if valid
    if(isValidCoords(selectedReq?.pickupCoords)) {
      bounds.extend([selectedReq.pickupCoords.lat, selectedReq.pickupCoords.lng]);
    }

    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, passengers, selectedReq, map]);

  return null;
};

const RideGiverDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentRideRoute, setCurrentRideRoute] = useState([]);
  const [rideDetails, setRideDetails] = useState(null);
  const [confirmedPassengers, setConfirmedPassengers] = useState([]);

  // 1. FETCH ACTIVE RIDE
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "rides"),
      where("driverId", "==", user.uid),
      where("status", "==", "ACTIVE"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        const rideData = rideDoc.data();
        setRideDetails({ id: rideDoc.id, ...rideData });
        setConfirmedPassengers(rideData.passengers || []);
        
        if (rideData.routeGeometry && Array.isArray(rideData.routeGeometry)) {
          // Filter out any bad points in the route itself
          const polyline = rideData.routeGeometry
            .filter(p => isValidCoords(p))
            .map(p => [p.lat, p.lng]);
          setCurrentRideRoute(polyline);
        }
      } else {
        setRideDetails(null); 
        setConfirmedPassengers([]);
        setCurrentRideRoute([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. FETCH PENDING REQUESTS
  useEffect(() => {
    if (!user) return;
    const q = query(
        collection(db, "ride_requests"),
        where("driverId", "==", user.uid),
        where("status", "==", "PENDING")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(liveRequests);
        
        if (liveRequests.length > 0 && !selectedRequest) {
           setSelectedRequest(liveRequests[0]);
        }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAccept = async () => {
    if (!selectedRequest || !rideDetails) return;
    const toastId = toast.loading("Confirming passenger...");
    try {
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), { status: "ACCEPTED" });
        await updateDoc(doc(db, "rides", rideDetails.id), {
            seatsAvailable: increment(-1),
            passengers: arrayUnion({
                uid: selectedRequest.takerId,
                name: selectedRequest.takerName,
                // Ensure we handle null coords gracefully
                pickupCoords: selectedRequest.pickupCoords || null, 
                pickupLocation: selectedRequest.pickupLocation || "Unknown Location"
            })
        });
        toast.success("Passenger Added!", { id: toastId });
        setSelectedRequest(null);
    } catch (error) {
        console.error(error);
        toast.error("Failed to accept.");
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;
    try {
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), { status: "REJECTED" });
        toast.success("Request Declined");
        setSelectedRequest(null);
    } catch (error) {
        toast.error("Error declining");
    }
  };

  const handleFinishRide = async () => {
      if(!rideDetails) return;
      if(!window.confirm("Are you sure you want to finish this ride?")) return;

      const toastId = toast.loading("Finishing ride...");
      try {
          await updateDoc(doc(db, "rides", rideDetails.id), { status: "COMPLETED" });
          toast.success("Ride Completed!", { id: toastId });
          setRideDetails(null);
          navigate('/history');
      } catch (e) {
          toast.error("Could not finish ride.");
      }
  };

  if (!rideDetails && currentRideRoute.length === 0) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
                  <div className="text-6xl mb-4">🅿️</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Ride</h2>
                  <p className="text-slate-500 mb-6">Start a ride to see requests.</p>
                  <button onClick={() => navigate('/ride-giver')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
                      Post a New Ride
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">      
      
      {/* --- LEFT SIDEBAR --- */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h1 className="text-xl font-black text-slate-900 mb-1">🚖 Dashboard</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                {rideDetails.source} → {rideDetails.destination}
            </p>
            <button 
                onClick={handleFinishRide}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
            >
                🏁 Finish Ride
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Waitlist */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                   Waitlist ({requests.length})
                </h3>
                {requests.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                        No pending requests
                    </div>
                ) : (
                    requests.map(req => (
                        <div 
                            key={req.id} 
                            onClick={() => setSelectedRequest(req)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all mb-2 ${
                                selectedRequest?.id === req.id 
                                ? 'border-amber-400 bg-amber-50 shadow-md' 
                                : 'border-transparent bg-white shadow-sm hover:border-amber-100'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900">{req.takerName}</h4>
                                    <p className="text-[10px] uppercase font-bold text-amber-600 mt-1">📍 {req.pickupLocation}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmed */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 mt-4">
                   On Board ({confirmedPassengers.length})
                </h3>
                {confirmedPassengers.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {p.name ? p.name[0] : '?'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{p.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">PICKUP: {p.pickupLocation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {selectedRequest && (
            <div className="p-4 bg-white border-t border-slate-200 animate-in slide-in-from-bottom-4">
                <p className="text-xs text-center text-slate-400 mb-2">Decision for <strong>{selectedRequest.takerName}</strong></p>
                <div className="flex gap-2">
                    <button onClick={handleDecline} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Decline</button>
                    <button onClick={handleAccept} className="flex-1 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition">Accept</button>
                </div>
            </div>
        )}
      </div>

      {/* --- RIGHT SIDE: MAP --- */}
      <div className="flex-1 bg-slate-200 relative">
        <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <MapBounds 
                route={currentRideRoute} 
                passengers={confirmedPassengers} 
                selectedReq={selectedRequest} 
            />

            {/* Route Line */}
            {currentRideRoute.length > 0 && (
                <>
                    <Polyline positions={currentRideRoute} color="#0f172a" weight={4} opacity={0.8} dashArray="10, 10" />
                    <Marker position={currentRideRoute[0]} icon={routeIcon}><Popup>Start</Popup></Marker>
                    <Marker position={currentRideRoute[currentRideRoute.length - 1]} icon={routeIcon}><Popup>Destination</Popup></Marker>
                </>
            )}

            {/* 🛡️ SAFETY CHECK: Only render Green markers if coords are valid */}
            {confirmedPassengers.map((p, i) => (
                isValidCoords(p.pickupCoords) && (
                    <Marker key={i} position={[p.pickupCoords.lat, p.pickupCoords.lng]} icon={passengerIcon}>
                        <Popup>✅ Passenger: {p.name}</Popup>
                    </Marker>
                )
            ))}

            {/* 🛡️ SAFETY CHECK: Only render Yellow marker if coords are valid */}
            {isValidCoords(selectedRequest?.pickupCoords) && (
                <Marker position={[selectedRequest.pickupCoords.lat, selectedRequest.pickupCoords.lng]} icon={requestIcon} zIndexOffset={1000}>
                    <Popup>⚠️ Request: {selectedRequest.takerName}</Popup>
                </Marker>
            )}

        </MapContainer>
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl z-[1000] border border-white/50 text-xs space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900"></div> Route</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Passenger</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Request</div>
        </div>
      </div>

    </div>
  );
};

export default RideGiverDashboard;