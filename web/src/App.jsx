import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

// Layout & Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SOSButton from "./components/SOSButton";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RideSelection from "./pages/RideSelection";
import RideGiver from "./pages/RideGiver";
import RideTaker from "./pages/RideTaker";
import RideDetails from "./pages/RideDetails";
import RideGiverDashboard from "./pages/RideGiverDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const location = useLocation();

  // Sync user state and listen for profile updates
  useEffect(() => {
    const syncUser = () => {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setUser(loggedInUser);
    };

    syncUser();

    // Listener for image/profile updates from Profile.js
    window.addEventListener("userUpdated", syncUser);
    return () => window.removeEventListener("userUpdated", syncUser);
  }, [location]);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    /* The bg-[#0b1120] matches your footer to eliminate the white line */
    <div className="min-h-screen flex flex-col bg-[#0b1120]">
      <Toaster position="top-center" reverseOrder={false} />

      {!isAdminPage && <Navbar user={user} />}

      {/* main with flex-grow ensures the footer is pushed to the very bottom */}
      <main className="flex-grow bg-slate-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ride-selection" element={<RideSelection />} />
          <Route path="/ride-giver" element={<RideGiver />} />
          <Route path="/ride-taker" element={<RideTaker />} />
          <Route
            path="/ride-giver-dashboard"
            element={<RideGiverDashboard />}
          />
          <Route path="/ride-details" element={<RideDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminPage && user && <SOSButton user={user} />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
