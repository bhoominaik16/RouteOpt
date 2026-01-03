import { Routes, Route, useLocation } from "react-router-dom"; // Added useLocation
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react'; // Added imports
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RideSelection from "./pages/RideSelection";
import RideGiver from "./pages/RideGiver";
import RideTaker from "./pages/RideTaker";


function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  const location = useLocation();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
  }, [location]); 

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar/>
      <Routes className="flex-grow">
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ride-selection" element={<RideSelection />} />
        <Route path="/ride-giver" element={<RideGiver />} />
        <Route path="/ride-taker" element={<RideTaker />} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App;