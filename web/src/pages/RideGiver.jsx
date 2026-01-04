import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RideGiver = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [seats, setSeats] = useState(3);
  const [dateTime, setDateTime] = useState("");

  // 🛡️ NEW: SAFETY TOGGLES
  const [sameGender, setSameGender] = useState(false);
  const [sameInstitution, setSameInstitution] = useState(false);

  // Route Data
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const [loading, setLoading] = useState(false);

  // --- 1. GEOCODING ---
  const getCoordinates = async (address) => {
    try {
      const res = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          address
        )}&limit=1&lat=19.07&lon=72.87`
      );
      if (res.data.features.length > 0) {
        const [lng, lat] = res.data.features[0].geometry.coordinates;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error("Geocoding Error", error);
      return null;
    }
  };

  // --- 2. ROUTE CALCULATION ---
  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    if (!source || !destination)
      return toast.error("Please enter both locations");

    setLoading(true);
    const toastId = toast.loading("Calculating optimal route...");

    try {
      const srcCoords = await getCoordinates(source);
      const destCoords = await getCoordinates(destination);

      if (!srcCoords || !destCoords) {
        toast.error("Locations not found. Try adding 'Mumbai'.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      setSourceCoords(srcCoords);

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${srcCoords.lng},${srcCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`
      );

      if (response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        const decodedPath = routeData.geometry.coordinates.map((coord) => ({
          lat: coord[1],
          lng: coord[0],
        }));

        setRoute(decodedPath);

        const distKm = (routeData.distance / 1000).toFixed(1);
        const durMin = Math.round(routeData.duration / 60);

        setDistance(distKm);
        setDuration(durMin);

        // Price: ₹7 per KM
        const price = Math.round(distKm * 7);
        setCalculatedPrice(price < 10 ? 10 : price);

        toast.success(`Route Found: ${distKm} km`, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate route", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST RIDE ---
  const handlePostRide = async () => {
    if (!route || !user) return;

    if (!window.confirm(`Post this ride for ₹${calculatedPrice} per seat?`))
      return;

    setLoading(true);
    try {
      await addDoc(collection(db, "rides"), {
        driverId: user.uid,
        driverName: user.name,
        driverEmail: user.email,
        driverImage: user.profileImage || "",
        driverGender: user.gender || "Not Specified",

        source,
        sourceCoords,
        destination,

        seatsAvailable: parseInt(seats),
        departureTime: dateTime || "NOW",

        distance,
        duration,
        routeGeometry: route,

        vehicleType: "car",
        pricePerSeat: calculatedPrice,

        // 🛡️ SAVE PREFERENCES TO DB
        sameGender: sameGender,
        sameInstitution: sameInstitution,

        status: "ACTIVE",
        createdAt: serverTimestamp(),
        passengers: [],
      });

      toast.success("Ride Posted Successfully!");
      navigate("/ride-giver-dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
      if (coords) map.setView([coords[0].lat, coords[0].lng], 13);
    }, [coords, map]);
    return null;
  };

  if (!user) return <div className="p-10 text-center">Please Login First</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* LEFT: FORM */}
      <div className="w-full md:w-1/3 p-6 md:p-10 bg-white border-r border-slate-200 overflow-y-auto z-10 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Offer a Ride
        </h1>
        <p className="text-slate-500 mb-8">Share your car, save costs.</p>

        <form onSubmit={handleCalculateRoute} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Pickup Location
            </label>
            <input
              type="text"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              placeholder="e.g. Chembur Naka"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              placeholder="e.g. VESIT Campus"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Seats
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-bold"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
            </div>
          </div>

          {/* 🛡️ NEW: SAFETY PREFERENCES SECTION */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Who can join?
            </h3>

            {/* Toggle 1: Same Gender */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                sameGender
                  ? "bg-emerald-50 border-emerald-500"
                  : "bg-white border-slate-200"
              }`}
              onClick={() => setSameGender(!sameGender)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👩‍🦰</span>
                <div>
                  <p
                    className={`text-sm font-bold ${
                      sameGender ? "text-emerald-900" : "text-slate-700"
                    }`}
                  >
                    Same Gender Only
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Only {user.gender || "your gender"} can request
                  </p>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  sameGender ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    sameGender ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </div>

            {/* Toggle 2: Same Institution */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                sameInstitution
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-slate-200"
              }`}
              onClick={() => setSameInstitution(!sameInstitution)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎓</span>
                <div>
                  <p
                    className={`text-sm font-bold ${
                      sameInstitution ? "text-blue-900" : "text-slate-700"
                    }`}
                  >
                    Same Institution Only
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Verified by email domain
                  </p>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  sameInstitution ? "bg-blue-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    sameInstitution ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Preview Route"}
          </button>
        </form>

        {/* PRICE PREVIEW CARD */}
        {distance && (
          <div className="mt-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">
                💰
              </div>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Estimated Earnings
                  </p>
                  <h3 className="text-4xl font-black text-emerald-900">
                    ₹{calculatedPrice}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    per passenger
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-700">
                    {distance} km
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    Distance
                  </p>
                </div>
              </div>
              <div className="w-full h-1 bg-emerald-200 rounded-full mt-2" />
              <p className="text-[10px] text-emerald-600/70 mt-2 text-center">
                Based on standard ₹7/km fuel sharing rate
              </p>
            </div>

            <button
              onClick={handlePostRide}
              disabled={loading}
              className="w-full mt-4 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95"
            >
              Confirm & Post Ride
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: MAP */}
      <div className="flex-1 bg-slate-200 relative">
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route && <RecenterMap coords={route} />}
          {route && (
            <>
              <Marker position={[route[0].lat, route[0].lng]}>
                <Popup>Start</Popup>
              </Marker>
              <Marker
                position={[
                  route[route.length - 1].lat,
                  route[route.length - 1].lng,
                ]}
              >
                <Popup>End</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default RideGiver;
