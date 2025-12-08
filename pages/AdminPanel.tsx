import React, { useState, useEffect } from 'react';
import { UserProfile, PlanTier } from '../types';
import { Shield, Lock, Search, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // In a real app, fetch from DB. 
    // Here we just grab the local user for demo purposes as we only have client side storage
    const stored = localStorage.getItem('sniper_user');
    if (stored) {
      setUsers([JSON.parse(stored)]);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.username === 'admin' && adminCreds.password === 'admin123') {
        setIsAuthenticated(true);
    } else {
        setError('Invalid Administrative Credentials');
    }
  };

  const updatePlan = (id: string, plan: PlanTier) => {
    const updatedUsers = users.map(u => {
        if (u.id === id) {
            const updated = { ...u, plan };
            localStorage.setItem('sniper_user', JSON.stringify(updated));
            return updated;
        }
        return u;
    });
    setUsers(updatedUsers);
  };

  const resetSignals = (id: string) => {
     const updatedUsers = users.map(u => {
        if (u.id === id) {
            const updated = { ...u, signalsUsedLifetime: 0, signalsUsedToday: 0 };
            localStorage.setItem('sniper_user', JSON.stringify(updated));
            return updated;
        }
        return u;
    });
    setUsers(updatedUsers);
  }

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                        <Shield size={32} className="text-red-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-black text-white text-center mb-2">ADMIN CLEARANCE</h1>
                <p className="text-slate-500 text-center text-sm mb-6">Restricted Area. Authorized Personnel Only.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Admin ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                            value={adminCreds.username}
                            onChange={e => setAdminCreds({...adminCreds, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Passcode</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                            value={adminCreds.password}
                            onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
                        />
                    </div>
                    {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors">
                        AUTHENTICATE
                    </button>
                </form>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
       <div className="container mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-10">
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Shield className="text-red-500" /> ADMIN COMMAND CENTER
             </h1>
             <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-slate-500 hover:text-white">LOGOUT</button>
          </div>
       
       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">User Database</h2>
            <div className="flex gap-2">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-500"/>
                    <input type="text" placeholder="Search users..." className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-primary-500 outline-none w-64" />
                </div>
            </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="p-4">User Identity</th>
                      <th className="p-4">ID Hash</th>
                      <th className="p-4">Access Tier</th>
                      <th className="p-4">Usage</th>
                      <th className="p-4">System Actions</th>
                   </tr>
                </thead>
                <tbody className="text-sm">
                   {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                         <td className="p-4 font-bold text-white">
                             {u.username}
                             <div className="text-[10px] text-slate-500 font-mono font-normal">{u.email || 'No Email'}</div>
                         </td>
                         <td className="p-4 font-mono text-xs text-slate-400">{u.id.substring(0,8)}...</td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.plan === 'PRO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}>
                               {u.plan}
                            </span>
                         </td>
                         <td className="p-4 text-slate-300">
                            {u.signalsUsedLifetime} <span className="text-slate-600">signals</span>
                         </td>
                         <td className="p-4 flex gap-2 items-center">
                            <select 
                               onChange={(e) => updatePlan(u.id, e.target.value as PlanTier)}
                               value={u.plan}
                               className="bg-slate-950 border border-slate-700 text-white rounded text-xs p-2 outline-none focus:border-primary-500"
                            >
                               {Object.values(PlanTier).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button 
                              onClick={() => resetSignals(u.id)}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs px-3 py-2 rounded font-bold transition-colors"
                              title="Reset Limits"
                            >
                              Reset
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
    </div>
  );
};

export default AdminPanel;