import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-emerald-900 text-white py-20 px-8 text-center">
      {/* CTA Section */}
      <h2 className="text-3xl font-bold mb-6">
        Ready to green your commute?
      </h2>
      
      <p className="mb-10 text-emerald-200 max-w-md mx-auto">
        Join hundreds of staff and students already making a difference.
      </p>

      <Link 
        to="/auth" 
        className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-xl font-bold hover:bg-emerald-50 transition shadow-2xl active:scale-95"
      >
        Create Account
      </Link>

      {/* Bottom Bar */}
      <div className="mt-16 pt-8 border-t border-emerald-800 text-emerald-400 text-sm">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <span>© 2026 RouteOpt. Built for the Sustainability Hackathon.</span>
          <span className="hidden md:inline text-emerald-700">|</span>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#impact" className="hover:text-white transition">Impact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;