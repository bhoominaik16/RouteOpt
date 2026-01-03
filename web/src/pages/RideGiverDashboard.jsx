import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

// Custom icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});

const RideGiverDashboard = () => {
  const [matches] = useState([
    {
      id: 1, name: "Ishaan Mehta", gender: "Male", inst: "IIT Bombay", 
      pickup: "Powai Lake Gate", time: "08:45 AM", carbonSaved: "1.2kg",
      coords: [19.1291, 72.9095], rating: 4.8, ridesShared: 12
    },
    {
      id: 2, name: "Ananya Iyer", gender: "Female", inst: "IIT Bombay", 
      pickup: "Hiranandani Gardens", time: "09:05 AM", carbonSaved: "0.8kg",
      coords: [19.1176, 72.9060], rating: 4.9, ridesShared: 25
    }
  ]);

  const [selectedRider, setSelectedRider] = useState(matches[0]);
  const mockRouteGeometry = [[19.1176, 72.9060], [19.1291, 72.9095], [19.1334, 72.9133]];

  const handleAccept = () => {
    toast.success(`Ride confirmed for ${selectedRider.name}!`);
  };

  return (
    // Set container to full viewport height and prevent overflow
    <div className="min-h-[90vh] w-full bg-slate-50 flex flex-col overflow-hidden">      
      {/* Main Content Area: Takes remaining height after Navbar */}
      <div className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        
        {/* SECTION 1: Left Match List (3 Columns) */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 flex-shrink-0">
            <h3 className="text-xl font-bold text-slate-900">Potential Matches</h3>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-tight">Verified Members</p>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4 space-y-3 custom-scrollbar">
            {matches.map((rider) => (
              <div 
                key={rider.id}
                onClick={() => setSelectedRider(rider)}
                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedRider.id === rider.id ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{rider.name}</h4>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold">{rider.time}</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">📍 {rider.pickup}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">{rider.gender}</span>
                  <span className="text-[10px] text-emerald-600 font-bold tracking-tight">🌱 {rider.carbonSaved} saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (9 Columns) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* SECTION 2: Top Details Panel (Fixed height to prevent map shrinkage) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-15 flex flex-col md:flex-row justify-between items-center flex-shrink-0">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">👤</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">{selectedRider.name}</h2>
                <p className="text-emerald-600 font-bold text-sm mb-2">{selectedRider.inst}</p>
                <div className="flex gap-4">
                  <span className="text-xs font-medium text-slate-500">⭐ {selectedRider.rating} Rating</span>
                  <span className="text-xs font-medium text-slate-500">🚗 {selectedRider.ridesShared} Shared Rides</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm">Decline</button>
              <button onClick={handleAccept} className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition text-sm">Accept Ride</button>
            </div>
          </div>

          {/* SECTION 3: Bottom Map (Takes all remaining vertical space) */}
          <div className="flex-grow bg-slate-200 rounded-3xl overflow-hidden shadow-inner border-4 border-white relative h-full">
            <MapContainer 
              center={[19.1291, 72.9095]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={mockRouteGeometry} color="#EF4444" weight={6} />
              <Marker position={selectedRider.coords} icon={greenIcon}>
                <Popup>Pickup: {selectedRider.pickup}</Popup>
              </Marker>
            </MapContainer>
            
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-md z-[1000] border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Proximity Check</p>
              <p className="text-sm font-black text-emerald-600">Within 300m of route</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RideGiverDashboard;