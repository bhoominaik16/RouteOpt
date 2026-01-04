import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import axios from 'axios'; // Import Axios for geocoding

// Fix Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access passed state (Mulund)
  
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  
  // 📍 STATE FOR PICKUP LOGIC
  // If user searched "Mulund", use that. Otherwise default to Ride Source.
  const passedPickup = location.state?.userPickup || "";
  const [customPickupCoords, setCustomPickupCoords] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const docRef = doc(db, "rides", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRide(docSnap.data());
        } else {
          toast.error("Ride not found");
          navigate('/ride-selection');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id, navigate]);

  // 🌍 GEOCODE THE PASSENGER'S PICKUP (Mulund -> Lat/Lng)
  useEffect(() => {
      const resolvePickup = async () => {
          if (passedPickup) {
              try {
                  const res = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(passedPickup)}&limit=1&lat=19.07&lon=72.87`);
                  if (res.data.features.length > 0) {
                      const [lng, lat] = res.data.features[0].geometry.coordinates;
                      setCustomPickupCoords({ lat, lng });
                  }
              } catch (e) {
                  console.error("Could not geocode pickup", e);
              }
          }
      };
      if(passedPickup && !customPickupCoords) resolvePickup();
  }, [passedPickup]);

  const handleRequestSeat = async () => {
    if (!user) {
      toast.error("Please login to request a ride");
      navigate('/auth');
      return;
    }
    
    if (ride.seatsAvailable <= 0) return toast.error("Ride is full!");
    if (ride.driverId === user.uid) return toast.error("You cannot request your own ride!");

    setRequesting(true);
    const toastId = toast.loading("Sending request...");

    try {
      // 🧠 LOGIC: Use Custom Pickup if available, else Ride Source
      const finalPickupName = passedPickup || ride.source;
      const finalPickupCoords = customPickupCoords || ride.sourceCoords;

      await addDoc(collection(db, "ride_requests"), {
        rideId: id,
        
        // 🟢 FIX 1: Driver Info (So it's not "Unknown")
        driverId: ride.driverId,
        driverName: ride.driverName || "Unknown Driver", 
        
        takerId: user.uid,
        takerName: user.name || "Unknown User",
        takerImage: user.profileImage || "",
        
        // 🟢 FIX 2: Correct Pickup Location (Mulund, not Thane)
        pickupLocation: finalPickupName, 
        pickupCoords: finalPickupCoords, 
        
        price: ride.pricePerSeat || 0,
        status: "PENDING", 
        timestamp: serverTimestamp()
      });

      toast.success("Request Sent! Driver notified.", { id: toastId });
      navigate('/history'); // Send them to history to see status

    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Request failed.", { id: toastId });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading ride details...</div>;
  if (!ride) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT: INFO */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition">
              ← Back
            </button>
            
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-emerald-100">
                  {ride.driverImage ? <img src={ride.driverImage} className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-2xl">👤</span>}
               </div>
               <div>
                  <h1 className="text-2xl font-black text-slate-900">{ride.driverName}</h1>
                  <p className="text-sm text-slate-500 font-medium">Verified Driver</p>
               </div>
            </div>

            <div className="space-y-6 relative">
               <div className="absolute left-[7px] top-2 bottom-4 w-0.5 bg-slate-100" />
               
               <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">From</p>
                  <h3 className="text-xl font-bold text-slate-900">{ride.source}</h3>
               </div>

               <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-sm" />
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">To</p>
                  <h3 className="text-xl font-bold text-slate-900">{ride.destination}</h3>
               </div>
            </div>

            {/* 📍 CONFIRMATION OF PICKUP */}
            {passedPickup && (
                <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-amber-700 uppercase mb-1">Your Pickup Point</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                       📍 {passedPickup}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">This location will be sent to the driver.</p>
                </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date & Time</p>
                   <p className="text-sm font-bold text-slate-900">{new Date(ride.departureTime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                   <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Price / Seat</p>
                   <p className="text-xl font-black text-emerald-700">₹{ride.pricePerSeat}</p>
                </div>
             </div>

             <button 
               onClick={handleRequestSeat}
               disabled={requesting}
               className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
             >
               {requesting ? "Sending Request..." : "Request Seat"}
             </button>
          </div>
        </div>

        {/* RIGHT: MAP */}
        <div className="bg-slate-200 relative min-h-[300px]">
           <MapContainer center={ride.sourceCoords ? [ride.sourceCoords.lat, ride.sourceCoords.lng] : [19, 72]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {ride.routeGeometry && <Polyline positions={ride.routeGeometry.map(p => [p.lat, p.lng])} color="#10b981" weight={5} />}
              
              {/* Start/End Markers */}
              {ride.sourceCoords && <Marker position={[ride.sourceCoords.lat, ride.sourceCoords.lng]}><Popup>Start: {ride.source}</Popup></Marker>}
              {/* Passenger Pickup Marker (If customized) */}
              {customPickupCoords && <Marker position={[customPickupCoords.lat, customPickupCoords.lng]}><Popup>Your Pickup: {passedPickup}</Popup></Marker>}
           </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default RideDetails;