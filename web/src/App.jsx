import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactGA from "react-ga4";

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

// Initialize GA4
ReactGA.initialize("G-DGMYLY6844");

// 🔒 PROTECTED ROUTE COMPONENT
// This blocks access to Ride pages if the user is NOT verified.
const VerifiedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  // If user exists but is NOT verified -> Send to Profile
  if (!user.isVerified) {
    return (
      <Navigate
        to="/profile"
        state={{ error: "verification_required" }}
        replace
      />
    );
  }
  return children;
};

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Sync User state on navigation
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);
  }, [location]);

  // 2. Handle "Verification Required" Redirects
  useEffect(() => {
    if (location.state?.error === "verification_required") {
      toast.error("🚫 You must be verified to access Rides!", {
        duration: 4000,
        icon: "🔒",
      });
      // Clear the state so the toast doesn't appear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 3. Track Page Views (GA4)
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />

      {!isAdminPage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<RideHistory />} />

          {/* --- PROTECTED ROUTES (Require ID Verification) --- */}
          <Route
            path="/ride-selection"
            element={
              <VerifiedRoute user={user}>
                <RideSelection />
              </VerifiedRoute>
            }
          />
          <Route
            path="/ride-giver"
            element={
              <VerifiedRoute user={user}>
                <RideGiver />
              </VerifiedRoute>
            }
          />
          <Route
            path="/ride-taker"
            element={
              <VerifiedRoute user={user}>
                <RideTaker />
              </VerifiedRoute>
            }
          />
          <Route
            path="/ride-giver-dashboard"
            element={
              <VerifiedRoute user={user}>
                <RideGiverDashboard />
              </VerifiedRoute>
            }
          />
          <Route
            path="/ride-details/:id"
            element={
              <VerifiedRoute user={user}>
                <RideDetails />
              </VerifiedRoute>
            }
          />

          {/* --- ADMIN ROUTE --- */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminPage && user && <SOSButton user={user} />}
      <Footer />
    </div>
  );
}

export default App;
