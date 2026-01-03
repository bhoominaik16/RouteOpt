import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); // This listens for URL changes

  useEffect(() => {
    // This runs every time the URL changes (e.g., going from /auth to /)
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(loggedInUser);
  }, [location]); // Triggered by route navigation

  return (
    <footer className="bg-emerald-900 text-white py-20 px-8 text-center mt-auto">
      {/* CTA Section: Now Reactively Hidden */}
      {!user && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-bold mb-6">
            Ready to green your commute?
          </h2>
          
          <p className="mb-10 text-emerald-200 max-w-md mx-auto">
            Join hundreds of staff and students already making a difference.
          </p>

          <Link 
            to="/auth" 
            className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-xl font-bold hover:bg-emerald-50 transition shadow-2xl active:scale-95 mb-16"
          >
            Create Account
          </Link>
        </div>
      )}

      {/* Bottom Bar: Always visible */}
      <div className={`${!user ? 'mt-0 pt-8 border-t border-emerald-800' : ''} text-emerald-400 text-sm`}>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>© 2026 RouteOpt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;