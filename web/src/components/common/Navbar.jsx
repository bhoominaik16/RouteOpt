import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Retrieve user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    setShowDropdown(false);
    navigate('/auth');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-emerald-900">RouteOpt</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Take a Ride Button */}
              <Link to="/ride-selection" className="bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full font-bold hover:bg-emerald-200 transition">
                Start a Ride
              </Link>

              {/* Profile Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-full transition outline-none"
                >
                  <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-sm">
                    {user.name[0]}
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    </div>
                    <ul>
                      <li>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/history" className="block px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                          Ride History
                        </Link>
                      </li>
                      <li className="border-t border-slate-50 mt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 font-semibold hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-emerald-200">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;