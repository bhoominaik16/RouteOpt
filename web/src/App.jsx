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

// 🔥 Added Firebase imports to sync state
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

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

ReactGA.initialize("G-DGMYLY6844");

const VerifiedRoute = ({ user, children }) => {
  // 1. Must be logged in
  if (!user) return <Navigate to="/auth" replace />;

  // 2. 🔥 NEW: Must have Email Verified (Skip check for admins)
  // We check auth.currentUser because localStorage might be stale regarding emailVerified status
  const firebaseUser = auth.currentUser;
  if (firebaseUser && !firebaseUser.emailVerified && user.role !== "admin") {
    // Allow them to stay on Profile to perhaps resend email, or redirect to Auth
    // For now, let's redirect to Auth with a toast
    toast.error("Please verify your email address first.");
    return <Navigate to="/auth" replace />;
  }

  // 3. Basic Student ID Verification Check
  if (!user.isVerified)
    return (
      <Navigate
        to="/profile"
        state={{ error: "verification_required" }}
        replace
      />
    );

  return children;
};

// 👑 ADMIN GUARD
const AdminRoute = ({ user, children }) => {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = user || localUser;

  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role !== "admin") {
    toast.error(
      "🔒 Admin privileges required. Please login with Admin credentials.",
      { id: "admin-deny" },
    );
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 1. LISTENER: Handle "userUpdated" Event (From Profile updates)
  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  // 🔥 2. LISTENER: Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Enforce Email Verification Globally
        if (!firebaseUser.emailVerified && user?.role !== "admin") {
          // If they are logged in but email isn't verified, kick them out
          // (Unless they are currently on the Auth page waiting)
          if (!location.pathname.includes("/auth")) {
            setUser(null);
            localStorage.removeItem("user");
            navigate("/auth");
            toast.error("Please verify your email to continue.");
          }
        }
      } else {
        // If Firebase says logged out, clear local state
        if (user) {
          setUser(null);
          localStorage.removeItem("user");
        }
      }
    });
    return () => unsubscribe();
  }, [user, navigate, location]);

  // Sync state on route change (Legacy support)
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (JSON.stringify(loggedInUser) !== JSON.stringify(user)) {
      setUser(loggedInUser);
    }
  }, [location]);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      {!isAdminPage && <Navbar user={user} setUser={setUser} />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth setUser={setUser} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<RideHistory />} />

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

          {/* 🔥 PROTECTED ADMIN ROUTE */}
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminPage && user && <SOSButton user={user} />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
