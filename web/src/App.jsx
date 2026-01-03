import { Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast';
import Landing from "./pages/Landing"
import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile";
import RideSelection from "./pages/RideSelection";
import RideGiver from "./pages/RideGiver";
import RideTaker from "./pages/RideTaker";


function App() {

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

export default App