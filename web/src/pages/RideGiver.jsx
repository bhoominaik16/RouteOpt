import React, { useState } from 'react';
import toast from 'react-hot-toast';

const RideGiver = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    timeMode: 'immediate',
    scheduledTime: '',
    seats: 1,
    genderPreference: false,
    routeChoice: 'fastest'
  });

  const handlePostRide = (e) => {
    e.preventDefault();
    // Simulate Posting logic
    toast.success('Ride details posted successfully!');
    console.log("Ride Posted:", formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <span className="text-emerald-600">📍</span> Post Your Route
          </h2>

          <form onSubmit={handlePostRide} className="space-y-6">
            {/* Source & Destination */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Source</label>
                <input 
                  type="text" required placeholder="Enter pickup location"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
                <input 
                  type="text" required placeholder="Enter office/college"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="p-4 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-700 mb-3">Departure Time</label>
              <div className="flex gap-4 mb-4">
                {['immediate', 'schedule'].map((mode) => (
                  <button
                    key={mode} type="button"
                    onClick={() => setFormData({...formData, timeMode: mode})}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${formData.timeMode === mode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-500'}`}
                  >
                    {mode === 'immediate' ? 'Now' : 'Schedule'}
                  </button>
                ))}
              </div>
              {formData.timeMode === 'schedule' && (
                <input 
                  type="datetime-local" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              )}
            </div>

            {/* Seats & Route Choice */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Available Seats</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Seats</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Route</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  onChange={(e) => setFormData({...formData, routeChoice: e.target.value})}
                >
                  <option value="fastest">Fastest Route (Direct)</option>
                  <option value="safe">Main Roads (Safe)</option>
                  <option value="eco">Eco-Friendly (Low Traffic)</option>
                </select>
              </div>
            </div>

            {/* High Impact: Gender Preference Toggle */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div>
                <p className="font-bold text-emerald-900">Same-Gender Ride</p>
                <p className="text-xs text-emerald-700">Filter riders based on your gender</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, genderPreference: !formData.genderPreference})}
                className={`w-12 h-6 rounded-full relative transition-colors ${formData.genderPreference ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.genderPreference ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl">
              Post Ride Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RideGiver;