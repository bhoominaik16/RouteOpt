import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(loggedInUser);
  }, [location]);

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 py-16 px-6 border-t border-slate-800 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
      
        {!user && (
          <div className="mb-16 text-center border-b border-slate-800 pb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
               Ready to maximize your commute?
             </h2>
             <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
               Join the closed-network community that saves time, money, and the planet.
             </p>
             <Link 
               to="/auth" 
               onClick={() => window.scrollTo(0, 0)} 
               className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-1"
             >
               Get Started Free
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-sm">
         
           <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4 text-white font-bold text-xl">
               <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm shadow-inner">
                 R
               </div>
               RouteOpt
             </div>
             <p className="text-slate-500 leading-relaxed">
               The first secure, verified carpooling platform designed exclusively for educational and corporate campuses.
             </p>
           </div>

           <div>
             <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
             <ul className="space-y-3">
               <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-emerald-400 transition-colors">Home</Link></li>
               <li><Link to="/auth" onClick={() => window.scrollTo(0, 0)} className="hover:text-emerald-400 transition-colors">Find a Ride</Link></li>
               <li><a href="#impact" className="hover:text-emerald-400 transition-colors">Impact Stats</a></li>
             </ul>
           </div>

           <div>
             <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Stay Connected</h4>
             <div className="flex gap-4 mb-6">
                
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all group">
                  <svg className="w-5 h-5 fill-current text-slate-400 group-hover:text-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.451 2.535c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              
                <a href="https://x.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all group">
                  <svg className="w-4 h-4 fill-current text-slate-400 group-hover:text-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>

             </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational</span>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>© 2026 RouteOpt Inc.</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;