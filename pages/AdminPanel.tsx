import React, { useState, useEffect } from 'react';
import { UserProfile, PlanTier } from '../types';
import { Shield, Search, Users, Activity, CreditCard, LogOut, CheckCircle, Mail, AlertTriangle, Server, Database, Globe, DollarSign, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  // Real Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, free: 0, basic: 0, advanced: 0, pro: 0 });

  // Mock Logs
  const [systemLogs, setSystemLogs] = useState<{time: string, msg: string, type: 'INFO' | 'WARN' | 'ERROR'}[]>([
      { time: '10:42:05', msg: 'System integrity check passed.', type: 'INFO' },
      { time: '10:41:22', msg: 'Database backup completed successfully.', type: 'INFO' },
      { time: '10:35:10', msg: 'New user registration: Agent_007', type: 'INFO' },
  ]);

  useEffect(() => {
    // Check if redirected from AuthPage with auth
    const preAuth = localStorage.getItem('tv_admin_auth');
    if (preAuth === 'true') {
        setIsAuthenticated(true);
        loadDatabase();
    }
  }, []);

  const loadDatabase = () => {
      const usersStr = localStorage.getItem('tv_users');
      const loadedUsers: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
      setUsers(loadedUsers);
      calculateStats(loadedUsers);
  };

  const calculateStats = (data: UserProfile[]) => {
      setStats({
          total: data.length,
          free: data.filter(u => u.plan === PlanTier.FREE).length,
          basic: data.filter(u => u.plan === PlanTier.BASIC).length,
          advanced: data.filter(u => u.plan === PlanTier.ADVANCED).length,
          pro: data.filter(u => u.plan === PlanTier.PRO).length,
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.username.toLowerCase() === 'birukf37@gmail.com' && adminCreds.password === 'admin20') {
        setIsAuthenticated(true);
        localStorage.setItem('tv_admin_auth', 'true');
        loadDatabase();
    } else {
        setError('Access Denied: Invalid Administrative Credentials');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('tv_admin_auth');
      setIsAuthenticated(false);
      navigate('/auth');
  };

  const handlePlanUpdate = (userId: string, newPlan: PlanTier) => {
    const updatedUsers = users.map(u => {
        if (u.id === userId) {
            return { ...u, plan: newPlan };
        }
        return u;
    });
    setUsers(updatedUsers);
    calculateStats(updatedUsers);
    localStorage.setItem('tv_users', JSON.stringify(updatedUsers));

    // Update Logs
    const timeStr = new Date().toLocaleTimeString();
    setSystemLogs(prev => [{ time: timeStr, msg: `Manual plan override for user ${userId.substring(0,6)}... to ${newPlan}`, type: 'WARN' }, ...prev]);

    // Sync session if self
    const currentSession = localStorage.getItem('tv_session');
    if (currentSession) {
        const sessionUser = JSON.parse(currentSession);
        if (sessionUser.id === userId) {
            localStorage.setItem('tv_session', JSON.stringify({ ...sessionUser, plan: newPlan }));
        }
    }
  };

  const filteredUsers = users.filter(u => 
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (u.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Calculate MRR (Estimated)
  const estimatedMRR = (stats.basic * 14) + (stats.advanced * 29) + (stats.pro * 49);

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
                        <Shield size={40} className="text-red-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">ADMIN CORE</h1>
                <p className="text-slate-500 text-center text-sm mb-8">Restricted Access. Authorized Personnel Only.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Admin Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={16}/>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors"
                                value={adminCreds.username}
                                onChange={e => setAdminCreds({...adminCreds, username: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Passcode</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-slate-500" size={16}/>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors"
                                value={adminCreds.password}
                                onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
                            />
                        </div>
                    </div>
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-bold text-center flex items-center justify-center gap-2"><AlertTriangle size={14}/> {error}</div>}
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-red-500/20 mt-2">
                        AUTHENTICATE
                    </button>
                </form>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
       <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
           <div className="container mx-auto px-6 h-16 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Shield className="text-red-500" size={24} />
                <h1 className="text-xl font-black text-white tracking-tight">ADMIN<span className="text-red-500">COMMAND</span></h1>
             </div>
             <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                <LogOut size={14} /> TERMINATE SESSION
             </button>
           </div>
       </nav>

       <div className="container mx-auto px-6 py-10 max-w-[1600px]">
          
          {/* SYSTEM HEALTH ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">System Status</p>
                    <p className="text-green-500 font-bold flex items-center gap-2 mt-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> OPERATIONAL</p>
                </div>
                <Activity className="text-slate-700" size={24}/>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Database</p>
                    <p className="text-white font-bold flex items-center gap-2 mt-1"><Database size={14} className="text-blue-500"/> CONNECTED</p>
                </div>
                <div className="text-xs font-mono text-slate-500">32ms</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">API Latency</p>
                    <p className="text-white font-bold flex items-center gap-2 mt-1"><Globe size={14} className="text-purple-500"/> 124ms</p>
                </div>
                <div className="text-xs font-mono text-slate-500">US-EAST</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Est. Monthly Rev</p>
                    <p className="text-white font-bold flex items-center gap-2 mt-1"><DollarSign size={14} className="text-green-500"/> ${estimatedMRR.toLocaleString()}</p>
                </div>
                <div className="text-xs font-mono text-slate-500">MRR</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT: MAIN STATS & USERS */}
             <div className="lg:col-span-2 space-y-8">
                {/* STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</p>
                        <h3 className="text-4xl font-black text-white">{stats.total}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Free Tier</p>
                        <h3 className="text-4xl font-black text-slate-300">{stats.free}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Basic/Adv</p>
                        <h3 className="text-4xl font-black text-primary-400">{stats.basic + stats.advanced}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl border-b-4 border-b-red-500">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Sniper Pro</p>
                        <h3 className="text-4xl font-black text-red-500">{stats.pro}</h3>
                    </div>
                </div>

                {/* USER MANAGEMENT */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/30">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-red-500"/> User Management
                        </h2>
                        <div className="relative w-full md:w-auto">
                            <Search size={16} className="absolute left-3 top-3 text-slate-500"/>
                            <input 
                                type="text" 
                                placeholder="Search email or username..." 
                                className="bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-red-500 outline-none w-full md:w-80 placeholder-slate-600"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-800">Operative Identity</th>
                                    <th className="p-4 font-bold border-b border-slate-800">Status</th>
                                    <th className="p-4 font-bold border-b border-slate-800">Current Plan</th>
                                    <th className="p-4 font-bold border-b border-slate-800 text-right">Activity</th>
                                    <th className="p-4 font-bold border-b border-slate-800 text-center">Override</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No operatives found matching criteria.</td></tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{u.username}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded w-fit">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                                    u.plan === PlanTier.PRO ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                    u.plan === PlanTier.ADVANCED ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                                                    u.plan === PlanTier.BASIC ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-slate-700/50 text-slate-400 border-slate-600'
                                                }`}>
                                                    {u.plan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-slate-400 font-mono">
                                                {u.signalsUsedLifetime} scans
                                            </td>
                                            <td className="p-4 text-center">
                                                <select 
                                                    value={u.plan}
                                                    onChange={(e) => handlePlanUpdate(u.id, e.target.value as PlanTier)}
                                                    className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-red-500 cursor-pointer hover:border-slate-500 transition-colors"
                                                >
                                                    {Object.values(PlanTier).map(tier => (
                                                        <option key={tier} value={tier}>{tier}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>

             {/* RIGHT: SYSTEM LOGS */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                         <h3 className="font-mono text-sm font-bold text-slate-300 flex items-center gap-2">
                             <Terminal size={14} className="text-green-500"/> SYSTEM_LOGS
                         </h3>
                         <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                         </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs space-y-3 overflow-y-auto">
                        {systemLogs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-slate-600">[{log.time}]</span>
                                <span className={`${
                                    log.type === 'WARN' ? 'text-yellow-400' :
                                    log.type === 'ERROR' ? 'text-red-400' : 
                                    'text-green-400'
                                }`}>{log.msg}</span>
                            </div>
                        ))}
                        <div className="text-slate-600 animate-pulse">_</div>
                    </div>
                </div>
             </div>

          </div>

       </div>
    </div>
  );
};

export default AdminPanel;