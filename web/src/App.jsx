import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RideSelection from "./pages/RideSelection";
import RideGiver from "./pages/RideGiver";
import RideTaker from "./pages/RideTaker";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🔥 Firebase Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ride-selection"
          element={
            <ProtectedRoute>
              <RideSelection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ride-giver"
          element={
            <ProtectedRoute>
              <RideGiver />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ride-taker"
          element={
            <ProtectedRoute>
              <RideTaker />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
