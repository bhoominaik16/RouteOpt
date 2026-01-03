import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

// --- STYLING FIXES ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

const RideGiver = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [loading, setLoading] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); 
  const [coords, setCoords] = useState({ start: null, end: null });
  const [exactNames, setExactNames] = useState({ src: '', dest: '' });
  
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    timeMode: 'immediate',
    scheduledTime: '',
    seats: 1,
    genderPreference: false,
    sameInstitution: false,
    selectedRoute: null
  });

  const fetchRouteOptions = async () => {
    if (!formData.source || !formData.destination) {
      toast.error("Please enter both source and destination");
      return;
    }

    setLoading(true);
    try {
      const srcRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.source)}&limit=1`);
      const destRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.destination)}&limit=1`);

      if (srcRes.data.length === 0 || destRes.data.length === 0) {
        throw new Error("Could not find locations. Try being more specific.");
      }

      setExactNames({
        src: srcRes.data[0].display_name.split(',')[0],
        dest: destRes.data[0].display_name.split(',')[0]
      });

      const start = [parseFloat(srcRes.data[0].lat), parseFloat(srcRes.data[0].lon)];
      const end = [parseFloat(destRes.data[0].lat), parseFloat(destRes.data[0].lon)];
      
      setCoords({ start, end });
      setMapCenter(start);

      const routeRes = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?alternatives=true&overview=full&geometries=geojson`
      );

      const routes = routeRes.data.routes.map((r, index) => ({
        id: index,
        name: r.legs[0].summary ? `via ${r.legs[0].summary}` : `Option ${index + 1}`,
        distance: (r.distance / 1000).toFixed(1),
        duration: Math.round(r.duration / 60),
        geometry: r.geometry.coordinates.map(coord => [coord[1], coord[0]]) 
      }));

      setAvailableRoutes(routes);
      setFormData(prev => ({ ...prev, selectedRoute: routes[0] }));
      toast.success(`Found ${routes.length} possible routes!`);

    } catch (error) {
      toast.error(error.message || "Error calculating routes");
    } finally {
      setLoading(false);
    }
  };

  const handlePostRide = (e) => {
    e.preventDefault();
    if (!formData.selectedRoute) {
      toast.error("Please select a route first");
      return;
    }

    // Simulate posting the data to your backend logic core
    console.log("Final Ride Data Posted:", formData);
    
    toast.success('Ride details posted successfully!');

    // 3. Navigate to the dashboard
    // We use a slight delay so the user can see the success toast
    setTimeout(() => {
      navigate('/ride-giver-dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">
        
        {/* LEFT: Form Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 h-fit">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <span className="text-emerald-600">📍</span> Post Your Route
          </h2>

          <form onSubmit={handlePostRide} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Source</label>
                <input 
                  type="text" required placeholder="Pickup location"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  onBlur={(e) => setFormData({...formData, source: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
                <input 
                  type="text" required placeholder="Office/College"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  onBlur={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="button" onClick={fetchRouteOptions} disabled={loading}
              className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition"
            >
              {loading ? "Calculating..." : "Find Available Routes"}
            </button>

            {availableRoutes.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Best Route</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white font-medium"
                  onChange={(e) => setFormData({...formData, selectedRoute: availableRoutes[e.target.value]})}
                >
                  {availableRoutes.map((route, idx) => (
                    <option key={idx} value={idx}>
                      {route.name} ({route.distance} km, {route.duration} mins)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-700 mb-3">Departure Time</label>
              <div className="flex gap-4 mb-4">
                {['immediate', 'schedule'].map((mode) => (
                  <button
                    key={mode} type="button"
                    onClick={() => setFormData({...formData, timeMode: mode})}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${formData.timeMode === mode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-500'}`}
                  >
                    {mode === 'immediate' ? 'Now' : 'Schedule'}
                  </button>
                ))}
              </div>
              {formData.timeMode === 'schedule' && (
                <input type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Seats</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({...formData, seats: e.target.value})}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 h-[52px] mt-7">
                <span className="font-bold text-emerald-900 text-sm">Same-Gender Only</span>
                <button type="button" onClick={() => setFormData({...formData, genderPreference: !formData.genderPreference})} className={`w-10 h-5 rounded-full relative transition-colors ${formData.genderPreference ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.genderPreference ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                <span className="font-bold text-blue-900 text-md block">Same Institution Only</span>
                <p className="text-sm text-blue-700">Limit visibility to your verified college/office</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, sameInstitution: !formData.sameInstitution})} 
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.sameInstitution ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.sameInstitution ? 'left-5' : 'left-1'}`} />
              </button>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl">
              Post Ride Details
            </button>
          </form>
        </div>

        {/* RIGHT: Map Section */}
        <div className="h-[400px] lg:h-full min-h-[550px] bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} />
            
            {coords.start && (
              <Marker position={coords.start} icon={redIcon}>
                <Popup>Pickup: {exactNames.src}</Popup>
              </Marker>
            )}
            
            {coords.end && (
              <Marker position={coords.end} icon={redIcon}>
                <Popup>Dropoff: {exactNames.dest}</Popup>
              </Marker>
            )}

            {formData.selectedRoute && (
              <Polyline 
                positions={formData.selectedRoute.geometry} 
                color="#EF4444" 
                weight={6} 
                opacity={0.8} 
              />
            )}
          </MapContainer>
          
          {formData.selectedRoute && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg z-[1000] border border-red-100">
              <p className="text-xs font-bold text-slate-500 uppercase">Efficiency Score</p>
              <p className="text-xl font-black text-red-600">92%</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RideGiver;