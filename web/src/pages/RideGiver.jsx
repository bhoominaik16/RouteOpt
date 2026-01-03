import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import axios from "axios";

// 🔥 Firebase
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// --- MAP ICON ---
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map updater
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

const RideGiver = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [coords, setCoords] = useState({ start: null, end: null });
  const [exactNames, setExactNames] = useState({ src: "", dest: "" });

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    timeMode: "immediate",
    scheduledTime: "",
    seats: 1,
    genderPreference: false,
    sameInstitution: false,
    selectedRoute: null,
  });

  // 🔐 Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("Please login first");
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 🔍 Route finder
  const fetchRouteOptions = async () => {
    if (!formData.source || !formData.destination) {
      toast.error("Please enter both source and destination");
      return;
    }

    setLoading(true);
    try {
      const srcRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.source
        )}&limit=1`
      );
      const destRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.destination
        )}&limit=1`
      );

      if (!srcRes.data.length || !destRes.data.length) {
        throw new Error("Could not find locations");
      }

      setExactNames({
        src: srcRes.data[0].display_name.split(",")[0],
        dest: destRes.data[0].display_name.split(",")[0],
      });

      const start = [
        parseFloat(srcRes.data[0].lat),
        parseFloat(srcRes.data[0].lon),
      ];
      const end = [
        parseFloat(destRes.data[0].lat),
        parseFloat(destRes.data[0].lon),
      ];

      setCoords({ start, end });
      setMapCenter(start);

      const routeRes = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?alternatives=true&overview=full&geometries=geojson`
      );

      const routes = routeRes.data.routes.map((r, index) => ({
        id: index,
        name: r.legs[0].summary
          ? `via ${r.legs[0].summary}`
          : `Option ${index + 1}`,
        distance: (r.distance / 1000).toFixed(1),
        duration: Math.round(r.duration / 60),
        geometry: r.geometry.coordinates.map((c) => [c[1], c[0]]),
      }));

      setAvailableRoutes(routes);
      setFormData((p) => ({ ...p, selectedRoute: routes[0] }));
      toast.success(`Found ${routes.length} routes`);
    } catch (err) {
      toast.error(err.message || "Route calculation failed");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Post ride to Firestore
  const handlePostRide = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Login required");
      return;
    }

    if (!formData.selectedRoute) {
      toast.error("Please select a route");
      return;
    }

    try {
      await addDoc(collection(db, "rides"), {
        driverId: user.uid,
        driverEmail: user.email,

        source: exactNames.src,
        destination: exactNames.dest,

        route: formData.selectedRoute,
        seats: formData.seats,

        genderPreference: formData.genderPreference,
        sameInstitution: formData.sameInstitution,

        institutionDomain: user.email.split("@")[1],

        departure:
          formData.timeMode === "immediate" ? "now" : formData.scheduledTime,

        status: "open",
        createdAt: serverTimestamp(),
      });

      toast.success("Ride posted successfully!");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to post ride");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border">
          <h2 className="text-3xl font-bold mb-8">📍 Post Your Route</h2>

          <form onSubmit={handlePostRide} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Source"
                className="input"
                onBlur={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              />
              <input
                placeholder="Destination"
                className="input"
                onBlur={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
            </div>

            <button
              type="button"
              onClick={fetchRouteOptions}
              className="w-full py-3 bg-emerald-100 rounded-xl font-bold"
            >
              {loading ? "Calculating..." : "Find Routes"}
            </button>

            {availableRoutes.length > 0 && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  Select Best Route
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selectedRoute: availableRoutes[e.target.value],
                    })
                  }
                >
                  {availableRoutes.map((route, idx) => (
                    <option key={idx} value={idx}>
                      {route.name} ({route.distance} km, {route.duration} mins)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl"
            >
              Post Ride Details
            </button>
          </form>
        </div>

        {/* MAP */}
        <div className="h-[500px] rounded-3xl overflow-hidden border relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} />

            {coords.start && (
              <Marker position={coords.start} icon={redIcon}>
                <Popup>{exactNames.src}</Popup>
              </Marker>
            )}
            {coords.end && (
              <Marker position={coords.end} icon={redIcon}>
                <Popup>{exactNames.dest}</Popup>
              </Marker>
            )}

            {formData.selectedRoute && (
              <Polyline
                positions={formData.selectedRoute.geometry}
                color="#EF4444"
                weight={6}
              />
            )}
          </MapContainer>

          {formData.selectedRoute && (
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl shadow-lg">
              <p className="text-xs font-bold uppercase">Efficiency</p>
              <p className="text-xl font-black text-red-600">92%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideGiver;
