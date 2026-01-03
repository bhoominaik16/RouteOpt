import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// 🔥 Firebase Imports
import { db } from '../firebase';
import { 
  collection, query, where, onSnapshot, 
  doc, updateDoc, increment, arrayUnion, getDoc 
} from 'firebase/firestore';

// Custom icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});

const RideGiverDashboard = () => {
  // Get Current User (Driver)
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentRideRoute, setCurrentRideRoute] = useState([]);
  
  // 1. LISTEN FOR PENDING REQUESTS
  useEffect(() => {
    if (!user) return;

    // Query: Requests where I am the driver AND status is PENDING
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
        
        // Auto-select the first request if none selected
        if (liveRequests.length > 0 && !selectedRequest) {
            setSelectedRequest(liveRequests[0]);
        }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. FETCH ROUTE GEOMETRY (To show on map when request is selected)
  useEffect(() => {
    const fetchRideGeometry = async () => {
        if (selectedRequest) {
            const rideDoc = await getDoc(doc(db, "rides", selectedRequest.rideId));
            if (rideDoc.exists()) {
                const rideData = rideDoc.data();
                // Convert to Leaflet Array format if needed
                const polyline = rideData.routeGeometry.map(p => [p.lat, p.lng]);
                setCurrentRideRoute(polyline);
            }
        }
    };
    fetchRideGeometry();
  }, [selectedRequest]);


  // 3. ACTION: ACCEPT RIDE
  const handleAccept = async () => {
    if (!selectedRequest) return;
    const toastId = toast.loading("Confirming seat...");

    try {
        // A. Update Request Status
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), {
            status: "ACCEPTED"
        });

        // B. Update The Ride (Decrement Seat, Add Passenger)
        await updateDoc(doc(db, "rides", selectedRequest.rideId), {
            seatsAvailable: increment(-1),
            passengers: arrayUnion({
                uid: selectedRequest.takerId,
                name: selectedRequest.takerName,
                image: selectedRequest.takerImage
            })
        });

        toast.success(`Accepted ${selectedRequest.takerName}!`, { id: toastId });
        setSelectedRequest(null); // Clear selection

    } catch (error) {
        console.error("Error accepting:", error);
        toast.error("Failed to accept.", { id: toastId });
    }
  };

  // 4. ACTION: DECLINE RIDE
  const handleDecline = async () => {
    if (!selectedRequest) return;
    try {
        await updateDoc(doc(db, "ride_requests", selectedRequest.id), {
            status: "REJECTED"
        });
        toast("Request declined", { icon: '👋' });
        setSelectedRequest(null);
    } catch (error) {
        toast.error("Error declining");
    }
  };

  if (requests.length === 0) {
      return (
          <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-slate-700">No Pending Requests</h2>
              <p className="text-slate-400">Sit back and relax. We'll notify you when someone requests a ride.</p>
          </div>
      );
  }

  return (
    <div className="min-h-[90vh] w-full bg-slate-50 flex flex-col overflow-hidden">      
      <div className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Request List */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 flex-shrink-0">
            <h3 className="text-xl font-bold text-slate-900">Incoming Requests</h3>
            <p className="text-xs text-emerald-600 font-bold uppercase mt-1 tracking-tight">{requests.length} Pending Actions</p>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4 space-y-3 custom-scrollbar">
            {requests.map((req) => (
              <div 
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedRequest?.id === req.id ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{req.takerName}</h4>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold text-slate-400">Just now</span>
                </div>
                <div className="flex gap-2 mt-2">
                   {/* We assume pickup is roughly near start for MVP */}
                  <span className="text-[10px] text-slate-500 font-medium uppercase">📍 {req.pickupLocation || "Pickup Point"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Map */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          
          {selectedRequest && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center flex-shrink-0 animate-in fade-in slide-in-from-top-4">
                <div className="flex gap-6 items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                    {selectedRequest.takerImage ? (
                        <img src={selectedRequest.takerImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">👤</span>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">{selectedRequest.takerName}</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Wants to join your ride</p>
                </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                    onClick={handleDecline}
                    className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition text-sm"
                >
                    Decline
                </button>
                <button 
                    onClick={handleAccept} 
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition text-sm"
                >
                    Accept Request
                </button>
                </div>
            </div>
          )}

          {/* MAP */}
          <div className="flex-grow bg-slate-200 rounded-3xl overflow-hidden shadow-inner border-4 border-white relative h-full">
            <MapContainer 
              center={[19.1291, 72.9095]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Draw the Route of the Ride being requested */}
              {currentRideRoute.length > 0 && (
                  <Polyline positions={currentRideRoute} color="#EF4444" weight={6} />
              )}

              {/* In a real app, you would verify the Taker's exact coordinate. 
                  For now we place a marker near the route start as a placeholder */}
              {currentRideRoute.length > 0 && (
                  <Marker position={currentRideRoute[0]} icon={greenIcon}>
                    <Popup>Pickup Location</Popup>
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