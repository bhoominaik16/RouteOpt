import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// 🔥 FIREBASE IMPORTS
import { db } from '../firebase';
import { 
    doc, getDoc, collection, addDoc, 
    serverTimestamp, query, where, getDocs 
} from 'firebase/firestore';

// --- LEAFLET ICONS ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper to center map on route
function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'PENDING', 'ACCEPTED', 'REJECTED'

  // Get Current User
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. FETCH RIDE DETAILS
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const docRef = doc(db, "rides", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRide({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Ride not found");
          navigate('/ride-taker');
        }
      } catch (error) {
        console.error("Error fetching ride:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id, navigate]);

  // 2. CHECK IF ALREADY REQUESTED
  useEffect(() => {
    const checkRequestStatus = async () => {
        if (!user || !id) return;

        try {
            const q = query(
                collection(db, "ride_requests"), 
                where("rideId", "==", id),
                where("takerId", "==", user.uid)
            );
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                setHasRequested(true);
                // Get the status of the first request found
                setRequestStatus(snapshot.docs[0].data().status);
            }
        } catch (error) {
            console.error("Error checking request status:", error);
        }
    };
    checkRequestStatus();
  }, [user, id]);

  // 3. HANDLE REQUEST SEAT
  // Inside src/pages/RideDetails.jsx

  const handleRequestSeat = async () => {
    if (!user) {
      toast.error("Please login to request a ride");
      navigate('/auth');
      return;
    }
    
    if (ride.seatsAvailable <= 0) {
      toast.error("Ride is full!");
      return;
    }
    if (ride.driverId === user.uid) {
        toast.error("You cannot request your own ride!");
        return;
    }

    setRequesting(true);
    const toastId = toast.loading("Sending request to driver...");

    try {
      // 👇 THE FIX: We added 'pickupCoords' here
      await addDoc(collection(db, "ride_requests"), {
        rideId: id,
        driverId: ride.driverId,
        takerId: user.uid,
        takerName: user.name || "Unknown",
        takerImage: user.profileImage || "",
        
        // Ensure we send BOTH name and coordinates
        pickupLocation: ride.source, 
        pickupCoords: ride.sourceCoords || null, 
        
        status: "PENDING", 
        timestamp: serverTimestamp()
      });

      toast.success("Request Sent! Waiting for approval.", { id: toastId });
      setHasRequested(true);
      setRequestStatus("PENDING");

    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Request failed. Try again.", { id: toastId });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading Route...</p>
        </div>
    </div>
  );

  if (!ride) return null;

  // Reconstruct Polyline for Map
  const polylinePositions = ride.routeGeometry?.map(p => [p.lat, p.lng]) || [];
  const mapCenter = ride.sourceCoords || [20.5937, 78.9629];

  // Helper to determine button style based on status
  const getButtonText = () => {
      if (ride.seatsAvailable === 0) return "Ride Full";
      if (hasRequested) {
          if (requestStatus === 'ACCEPTED') return "Ride Accepted! ✅";
          if (requestStatus === 'REJECTED') return "Request Declined ❌";
          return "Request Pending ⏳";
      }
      if (requesting) return "Sending...";
      return "Request Seat";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
                ← Back to Results
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {ride.source} <span className="text-slate-500">to</span> {ride.destination}
                    </h1>
                    <p className="text-emerald-400 font-mono mt-2 flex items-center gap-2">
                        ⏱ Leaving {ride.departureTime === 'NOW' ? 'NOW' : new Date(ride.departureTime).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700 text-center shadow-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Seats Left</p>
                    <p className="text-3xl font-black text-white">{ride.seatsAvailable}</p>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">

            {/* LEFT COLUMN: Driver Profile & Action */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Driver Card */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full mb-4 overflow-hidden border-4 border-emerald-50 shadow-inner">
                            {ride.driverImage ? (
                                <img src={ride.driverImage} alt="Driver" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl leading-[96px]">👤</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{ride.driverName}</h2>
                        
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {ride.sameInstitution && (
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                    Same Org
                                </span>
                            )}
                            {ride.genderPreference && (
                                <span className="bg-pink-50 text-pink-600 border border-pink-100 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                    Same Gender
                                </span>
                            )}
                        </div>
                        
                        <div className="w-full h-px bg-slate-100 my-4" />
                        
                        <div className="grid grid-cols-2 w-full gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Distance</p>
                                <p className="font-bold text-slate-700 text-lg">{ride.distance} km</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duration</p>
                                <p className="font-bold text-slate-700 text-lg">{ride.duration} min</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTON */}
                <button 
                    onClick={handleRequestSeat}
                    disabled={requesting || ride.seatsAvailable === 0 || hasRequested}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 border-2 ${
                        hasRequested
                            ? requestStatus === 'ACCEPTED' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 cursor-default'
                                : requestStatus === 'REJECTED'
                                    ? 'bg-red-50 text-red-500 border-red-100 cursor-default'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 cursor-default'
                            : ride.seatsAvailable === 0 
                                ? 'bg-slate-300 text-slate-500 border-transparent cursor-not-allowed' 
                                : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 hover:shadow-emerald-200'
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>

            {/* RIGHT COLUMN: Map */}
            <div className="md:col-span-2 h-[500px] bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* Auto-zoom to fit the route */}
                    <MapUpdater bounds={polylinePositions} />

                    {ride.sourceCoords && (
                        <Marker position={ride.sourceCoords} icon={redIcon}>
                            <Popup>Pickup: {ride.source}</Popup>
                        </Marker>
                    )}
                    {ride.destCoords && (
                        <Marker position={ride.destCoords} icon={redIcon}>
                            <Popup>Dropoff: {ride.destination}</Popup>
                        </Marker>
                    )}
                    
                    {/* Draw the Route Line */}
                    {polylinePositions.length > 0 && (
                        <Polyline positions={polylinePositions} color="#EF4444" weight={6} opacity={0.8} />
                    )}
                </MapContainer>
                
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg z-[1000] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Route View</p>
                    <p className="text-sm font-black text-slate-800">Live Geometry</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default RideDetails;