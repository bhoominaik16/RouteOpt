import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser || { name: 'Guest', email: 'guest@example.com', gender: 'Not Specified' };
  });

  const [genderFilter, setGenderFilter] = useState(false);
  const fileInputRef = useRef(null);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;

        const updatedUser = { ...user, profileImage: base64Image };

        setUser(updatedUser);
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload(); 
  };

  const stats = {
    greenPoints: 1250,
    co2Saved: '45.8 kg',
    ridesCompleted: 24,
    rank: 12
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto w-full px-8 py-12">
  
        <div className="flex justify-end mb-4">
          <button onClick={handleLogout} className="text-sm text-red-500 font-bold hover:underline">
            Log Out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative">
            
              <div className="relative mx-auto w-28 h-28 mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-emerald-50">
               
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-4xl font-bold uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                  )}
                </div>

                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
              
       
              <div className="flex items-center justify-center gap-2 mt-2 mb-6 text-slate-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="capitalize">{user.gender || 'Not specified'}</span>
              </div>

              <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                Verified Organization Member
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Safety Preferences
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Same-Gender Only</p>
                  <p className="text-xs text-slate-400">Only match with {user.gender ? user.gender.toLowerCase() : 'same-gender'} commuters</p>
                </div>
                <button 
                  onClick={() => setGenderFilter(!genderFilter)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${genderFilter ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${genderFilter ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

 
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Green Points</p>
                <h4 className="text-3xl font-black">{stats.greenPoints}</h4>
                <p className="text-xs mt-2 text-emerald-200">1 km shared = 10 pts</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">CO₂ Offset</p>
                <h4 className="text-3xl font-black text-slate-900">{stats.co2Saved}</h4>
                <p className="text-xs mt-2 text-emerald-600 font-bold">Top 5% in Organization</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Org Rank</p>
                <h4 className="text-3xl font-black text-slate-900">#{stats.rank}</h4>
                <p className="text-xs mt-2 text-slate-500">Global Leaderboard</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Carbon Reduction Overview</h3>
              <div className="h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <p className="text-slate-400 italic">Visual Graph (Chart.js) comparing Carpool vs Solo over time</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Upcoming Rewards</h3>
              <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">🅿️</div>
                <div>
                  <h4 className="font-bold text-emerald-900 tracking-tight">Reserved Parking Spot</h4>
                  <p className="text-sm text-emerald-700">Reach 2000 Green Points to unlock premium parking.</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-black text-emerald-600">62%</p>
                  <div className="w-24 h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="w-[62%] h-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;