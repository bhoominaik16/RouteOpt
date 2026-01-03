import { Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast';
import Landing from "./pages/Landing"
import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile";


function App() {

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar/>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  )
}

export default App
