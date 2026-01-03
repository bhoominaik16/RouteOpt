import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust path if needed
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sos_alerts"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(liveAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resolveAlert = async (id) => {
    try {
      const alertRef = doc(db, "sos_alerts", id);
      await updateDoc(alertRef, { status: 'RESOLVED' });
      toast.success('Alert marked as resolved');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
   
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-slate-500">Real-time security & ride monitoring</p>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-600">
                Admin: Security_01
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Alerts</p>
              <h3 className="text-3xl font-black text-red-600 mt-2">
                {alerts.filter(a => a.status === 'ACTIVE').length}
              </h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">1,204</h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Rides</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">85</h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CO₂ Saved</p>
              <h3 className="text-3xl font-black text-blue-600 mt-2">410 kg</h3>
           </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
           🚨 Emergency Feed
           {loading && <span className="text-xs font-normal text-slate-400 animate-pulse">(Connecting...)</span>}
        </h2>

        <div className="grid gap-4">
          {alerts.length === 0 ? (
             <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                No alerts in the system.
             </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-6 rounded-2xl border-l-8 shadow-sm transition-all ${
                  alert.status === 'ACTIVE' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-white border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            alert.status === 'ACTIVE' ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-slate-100 text-slate-500'
                         }`}>
                            {alert.status}
                         </span>
                         <span className="text-sm text-slate-400">
                            {alert.timestamp?.toDate().toLocaleString() || 'Just now'}
                         </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{alert.userName}</h3>
                      <p className="text-sm text-slate-600">ID: {alert.uid} • Email: {alert.email}</p>
                   </div>

                   <div className="flex items-center gap-3 w-full md:w-auto">
                      <a 
                        href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 text-center flex items-center justify-center gap-2"
                      >
                         📍 View Location
                      </a>
      
                      {alert.status === 'ACTIVE' && (
                        <button 
                           onClick={() => resolveAlert(alert.id)}
                           className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                        >
                           ✅ Mark Safe
                        </button>
                      )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;