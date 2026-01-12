import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactGA from "react-ga4"; // Import GA4

import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RideHistory from "./pages/RideHistory";
import RideSelection from "./pages/RideSelection";
import RideGiver from "./pages/RideGiver";
import RideTaker from "./pages/RideTaker";
import RideDetails from "./pages/RideDetails";
import RideGiverDashboard from "./pages/RideGiverDashboard";
import SOSButton from "./components/SOSButton";
import AdminDashboard from "./pages/AdminDashboard";
import IDUploader from "./components/IDUploader";

// Initialize GA4 with your Measurement ID
ReactGA.initialize("G-DGMYLY6844");

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Sync User state on navigation
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);
  }, [location]);

  // 2. Track Page Views on every route change (GA4)
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  const handleVerificationSuccess = (data) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      isVerified: true,
      studentName: data.name,
      institution: data.institution,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success(`Verified as student of ${data.institution}!`);
    navigate("/");
  };

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />

      {!isAdminPage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />

          {/* New Verification Route */}
          <Route
            path="/verify"
            element={
              <div className="flex items-center justify-center py-12">
                <IDUploader
                  userId={user?.uid}
                  onVerificationSuccess={handleVerificationSuccess}
                />
              </div>
            }
          />

          <Route path="/ride-selection" element={<RideSelection />} />
          <Route path="/ride-giver" element={<RideGiver />} />
          <Route path="/ride-taker" element={<RideTaker />} />
          <Route
            path="/ride-giver-dashboard"
            element={<RideGiverDashboard />}
          />
          <Route path="/ride-details/:id" element={<RideDetails />} />
          <Route path="/history" element={<RideHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminPage && user && <SOSButton user={user} />}
      <Footer />
    </div>
  );
}

export default App;
