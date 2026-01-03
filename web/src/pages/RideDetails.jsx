import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Custom Markers
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rideData] = useState({
    giver: {
      name: "Aditi Sharma",
      gender: "Female", // Gender data point
      inst: "IIT Bombay (Staff)",
      rating: 4.9,
      bio: "Regular commuter from Andheri. Looking for quiet co-passengers."
    },
    route: {
      source: "Andheri West",
      destination: "IIT Bombay, Powai",
      time: "10:30 AM",
      distance: "12.4 km",
      totalSeats: 4,
      occupiedSeats: 2,
      geometry: [[19.1136, 72.8697], [19.1291, 72.9095], [19.1334, 72.9133]]
    },
    passengers: [
      { name: "Sneha Kapoor", gender: "Female", inst: "IIT Bombay (Student)", pickup: "JVLR Junction" },
      { name: "Riya Sen", gender: "Female", inst: "IIT Bombay (Student)", pickup: "Powai Lake" }
    ],
    takerPoint: [19.1200, 72.8900] 
  });

  const handleRequestSeat = () => {
    toast.success("Request sent to Aditi! You will be notified once accepted.");
    setTimeout(() => navigate('/ride-taker'), 2000);
  };

  return (
    <div className="min-h-[90vh] flex flex-col bg-slate-50 overflow-hidden">
      
      {/* GAP IMPLEMENTATION: 
        Added 'gap-8' (or gap-10) to create a clear separation between the sections.
        Added 'p-4' to ensure the sections don't touch the screen edges.
      */}
      <div className="flex-grow grid grid-cols-12 gap-8 p-4 overflow-hidden">
        
        {/* --- LEFT SECTION: Details (40%) --- */}
        <aside className="col-span-12 lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* Giver Profile Header */}
          <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-sm font-bold">
              ← Back to Results
            </button>
            
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner text-emerald-700">
                {rideData.giver.gender === "Female" ? "👩" : "👨"}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{rideData.giver.name}</h1>
                {/* GENDER ADDED HERE */}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-emerald-600 font-bold">{rideData.giver.inst}</p>
                  <span className="text-slate-300">•</span>
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{rideData.giver.gender}</p>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-slate-400 italic">" {rideData.giver.bio} "</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Ride Logistics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time & Distance</p>
                <p className="text-lg font-black text-slate-800">{rideData.route.time} • {rideData.route.distance}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Available Seats</p>
                <p className="text-lg font-black text-emerald-700">{rideData.route.totalSeats - rideData.route.occupiedSeats} Left</p>
              </div>
            </div>

            {/* Path Visualization (Text) */}
            <div className="relative pl-6 border-l-2 border-dashed border-slate-200 space-y-6">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-100" />
                <p className="text-xs font-bold text-slate-400 uppercase">Start Point</p>
                <p className="font-bold text-slate-700">{rideData.route.source}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-100" />
                <p className="text-xs font-bold text-slate-400 uppercase">End Point</p>
                <p className="font-bold text-slate-700">{rideData.route.destination}</p>
              </div>
            </div>

            {/* TRUST LAYER: Co-Passenger Info */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-blue-500 text-lg">👥</span> Who's already on board?
              </h3>
              <div className="space-y-3">
                {rideData.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                      <p className="text-[10px] text-blue-600 font-medium">{p.inst}</p>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-1 rounded-lg border border-blue-100 font-bold text-slate-500 uppercase">
                      {p.gender}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleRequestSeat}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-slate-800 active:scale-95 transition-all mt-4"
            >
              Request to Join Ride
            </button>
          </div>
        </aside>

        {/* --- RIGHT SECTION: Map (60%) --- */}
        <main className="col-span-12 lg:col-span-7 bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 relative">
          <MapContainer center={[19.1291, 72.9095]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <Polyline positions={rideData.route.geometry} color="#EF4444" weight={6} opacity={0.8} />
            
            <Marker position={rideData.route.geometry[0]} icon={redIcon}>
              <Popup>Giver Source</Popup>
            </Marker>
            <Marker position={rideData.route.geometry[rideData.route.geometry.length-1]} icon={redIcon}>
              <Popup>Giver Destination</Popup>
            </Marker>

            <Marker position={rideData.takerPoint} icon={greenIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          </MapContainer>

          {/* Floating Badge */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-5 py-3 rounded-2xl shadow-2xl z-[1000] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup Feasibility</p>
            <p className="text-lg font-black text-emerald-600">High Match Score</p>
          </div>
        </main>

      </div>
    </div>
  );
};

export default RideDetails;