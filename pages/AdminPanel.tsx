
import React, { useState, useEffect } from 'react';
import { UserProfile, PlanTier } from '../types';
import { 
  Shield, Search, Users, Activity, CreditCard, LogOut, RefreshCw, X, 
  Database, Globe, DollarSign, Terminal, Filter, ChevronDown, CheckCircle2,
  AlertTriangle, Lock, Cpu, BarChart3, Server, Smartphone, Laptop, Tablet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_USERS_SEED: Partial<UserProfile>[] = [
  { username: 'CryptoKing99', email: 'alex@crypto.com', plan: PlanTier.PRO, settings: { accountSize: 50000, riskPercentage: 2, accountType: 'Raw' } as any, lastDevice: 'iPhone 14 Pro', joinDate: '2024-02-10T10:00:00Z' },
  { username: 'SarahTrades', email: 'sarah.t@gmail.com', plan: PlanTier.FREE, settings: { accountSize: 500, riskPercentage: 1, accountType: 'Standard' } as any, lastDevice: 'Windows PC', joinDate: '2024-03-01T14:30:00Z' },
  { username: 'SniperWolf', email: 'wolf@trading.net', plan: PlanTier.ADVANCED, settings: { accountSize: 10000, riskPercentage: 1.5, accountType: 'Pro' } as any, lastDevice: 'Samsung S23', joinDate: '2024-01-15T09:20:00Z' },
  { username: 'ForexMaster', email: 'mike@fx.com', plan: PlanTier.PRO, settings: { accountSize: 250000, riskPercentage: 0.5, accountType: 'Raw' } as any, lastDevice: 'MacBook Pro', joinDate: '2023-11-05T16:45:00Z' },
  { username: 'NewbieTrader', email: 'john.doe@aol.com', plan: PlanTier.FREE, settings: { accountSize: 100, riskPercentage: 5, accountType: 'Standard' } as any, lastDevice: 'iPad Air', joinDate: '2024-03-10T11:10:00Z' },
  { username: 'GoldBug', email: 'goldie@invest.com', plan: PlanTier.BASIC, settings: { accountSize: 2000, riskPercentage: 2, accountType: 'Standard' } as any, lastDevice: 'Android Tablet', joinDate: '2024-02-20T08:00:00Z' },
  { username: 'WhaleWatcher', email: 'ocean@fund.com', plan: PlanTier.PRO, settings: { accountSize: 1000000, riskPercentage: 1, accountType: 'Pro' } as any, lastDevice: 'Linux Desktop', joinDate: '2023-12-01T10:00:00Z' },
  { username: 'ScalpGod', email: 'fast@fingers.io', plan: PlanTier.ADVANCED, settings: { accountSize: 5000, riskPercentage: 3, accountType: 'Raw' } as any, lastDevice: 'iPhone 13', joinDate: '2024-01-28T13:15:00Z' },
];

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Real Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFilter, setUserFilter] = useState<'ALL' | 'PRO' | 'FREE' | 'EXPIRING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, free: 0, basic: 0, advanced: 0, pro: 0, mrr: 0 });

  // Subscription Management Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPlan, setNewPlan] = useState<PlanTier>(PlanTier.FREE);
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Mock Logs
  const [systemLogs, setSystemLogs] = useState<{time: string, msg: string, type: 'INFO' | 'WARN' | 'ERROR'}[]>([
      { time: '10:42:05', msg: 'System integrity check passed.', type: 'INFO' },
      { time: '10:41:22', msg: 'Database backup completed successfully.', type: 'INFO' },
      { time: '10:35:10', msg: 'New user registration: Agent_007', type: 'INFO' },
  ]);

  useEffect(() => {
    const preAuth = localStorage.getItem('tv_admin_auth');
    if (preAuth === 'true') {
        setIsAuthenticated(true);
        loadDatabase();
    }
  }, []);

  // Auto Refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => loadDatabase(), 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const seedMockUsers = (currentUsers: UserProfile[]) => {
      // Only seed if DB is mostly empty (e.g. just the admin or 1-2 test users)
      if (currentUsers.length < 5) {
          const newMockUsers = MOCK_USERS_SEED.map(seed => ({
              ...seed,
              id: crypto.randomUUID(),
              signalsUsedLifetime: Math.floor(Math.random() * 500),
              signalsUsedToday: Math.floor(Math.random() * 10),
              idTheme: 'cyan',
              tradeHistory: [],
              settings: {
                  ...seed.settings,
                  notifications: { signals: true, marketAlerts: true, updates: true }
              }
          } as UserProfile));

          const merged = [...currentUsers, ...newMockUsers];
          localStorage.setItem('tv_users', JSON.stringify(merged));
          return merged;
      }
      return currentUsers;
  };

  const loadDatabase = () => {
      const usersStr = localStorage.getItem('tv_users');
      let loadedUsers: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
      
      // Auto-Seed for Demo Purposes so Admin sees data
      loadedUsers = seedMockUsers(loadedUsers);

      setUsers(loadedUsers);
      calculateStats(loadedUsers);
  };

  const calculateStats = (data: UserProfile[]) => {
      const basic = data.filter(u => u.plan === PlanTier.BASIC).length;
      const advanced = data.filter(u => u.plan === PlanTier.ADVANCED).length;
      const pro = data.filter(u => u.plan === PlanTier.PRO).length;
      
      setStats({
          total: data.length,
          free: data.filter(u => u.plan === PlanTier.FREE).length,
          basic,
          advanced,
          pro,
          mrr: (basic * 10) + (advanced * 20) + (pro * 30)
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    
    // Simulate biometric scan delay
    setTimeout(() => {
        if (adminCreds.username.toLowerCase() === 'birukf37@gmail.com' && adminCreds.password === 'admin20') {
            setIsAuthenticated(true);
            localStorage.setItem('tv_admin_auth', 'true');
            loadDatabase();
        } else {
            setError('Biometric Mismatch. Access Denied.');
        }
        setIsLoginLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
      localStorage.removeItem('tv_admin_auth');
      setIsAuthenticated(false);
      navigate('/auth');
  };

  const openManageModal = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPlan(user.plan);
    if (user.planExpiryDate) {
        setExpiryDate(user.planExpiryDate.split('T')[0]);
    } else {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setExpiryDate(date.toISOString().split('T')[0]);
    }
  };

  const confirmPlanUpdate = () => {
    if (!selectedUser) return;
    let finalExpiry = expiryDate;
    if (newPlan === PlanTier.FREE) {
        finalExpiry = '';
    } else {
        if (!finalExpiry) {
            alert("Expiration date required for paid protocols.");
            return;
        }
    }

    const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
            return { 
                ...u, 
                plan: newPlan,
                planExpiryDate: finalExpiry ? new Date(finalExpiry).toISOString() : undefined
            };
        }
        return u;
    });

    setUsers(updatedUsers);
    calculateStats(updatedUsers);
    localStorage.setItem('tv_users', JSON.stringify(updatedUsers));

    const timeStr = new Date().toLocaleTimeString();
    setSystemLogs(prev => [{ 
        time: timeStr, 
        msg: `Override: User ${selectedUser.username} -> ${newPlan}`, 
        type: 'WARN' 
    }, ...prev]);

    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => {
      const matchesSearch = (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                            (u.username?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (userFilter === 'ALL') return true;
      if (userFilter === 'FREE') return u.plan === PlanTier.FREE;
      if (userFilter === 'PRO') return u.plan === PlanTier.PRO || u.plan === PlanTier.ADVANCED || u.plan === PlanTier.BASIC;
      if (userFilter === 'EXPIRING') {
          if (!u.planExpiryDate) return false;
          const daysLeft = (new Date(u.planExpiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
          return daysLeft < 5 && daysLeft > 0;
      }
      return true;
  });

  const getDeviceIcon = (deviceStr?: string) => {
      if (!deviceStr) return <Globe size={14} />;
      const d = deviceStr.toLowerCase();
      if (d.includes('iphone') || d.includes('android') || d.includes('pixel') || d.includes('samsung')) return <Smartphone size={14} />;
      if (d.includes('ipad') || d.includes('tablet')) return <Tablet size={14} />;
      return <Laptop size={14} />;
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute w-full h-1 bg-red-500/20 top-1/2 -translate-y-1/2 blur-xl"></div>
            
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 max-w-md w-full shadow-2xl relative overflow-hidden group">
                {/* Scanner Effect */}
                {isLoginLoading && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-scan pointer-events-none z-0"></div>
                )}
                
                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${isLoginLoading ? 'border-red-500 animate-pulse' : 'border-slate-700'} bg-slate-950 shadow-inner transition-colors duration-500`}>
                            <Shield size={48} className={isLoginLoading ? 'text-red-500' : 'text-slate-500'} />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">
                        ADMIN<span className="text-red-600">CORE</span>
                    </h1>
                    <p className="text-slate-500 text-center text-xs font-mono mb-8 tracking-widest uppercase">
                        Restricted Access Level 5
                    </p>
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-mono"
                                value={adminCreds.username}
                                onChange={e => setAdminCreds({...adminCreds, username: e.target.value})}
                                disabled={isLoginLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passcode</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-mono"
                                value={adminCreds.password}
                                onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
                                disabled={isLoginLoading}
                            />
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle size={14}/> {error}
                            </div>
                        )}
                        
                        <button 
                            disabled={isLoginLoading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoginLoading ? 'VERIFYING BIOMETRICS...' : 'INITIATE SESSION'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
  }

  // --- DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30 relative">
       
       {/* NAVBAR */}
       <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
           <div className="container mx-auto px-6 h-20 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Cpu className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-none">ADMIN<span className="text-red-500">CORE</span></h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">SYSTEM OVERLORD</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 mr-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-green-500">Global Database Connected</span>
                </div>
                <button 
                    onClick={loadDatabase} 
                    className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    title="Refresh Data"
                >
                    <RefreshCw size={18} />
                </button>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-5 py-3 rounded-lg transition-all shadow-lg shadow-red-600/10 hover:shadow-red-600/30"
                >
                    <LogOut size={16} /> <span className="hidden md:inline">TERMINATE</span>
                </button>
             </div>
           </div>
       </nav>

       <div className="container mx-auto px-6 py-10 max-w-[1600px] space-y-10">
          
          {/* 3D STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Total Users */}
             <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700 overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-800/50 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Operatives</p>
                        <h3 className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">{stats.total}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                        <Users size={24} />
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500/50"></div>
                </div>
             </div>

             {/* Free Tier */}
             <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700 overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-800/50 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Free Tier</p>
                        <h3 className="text-4xl font-black text-slate-300 group-hover:scale-105 transition-transform origin-left">{stats.free}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
                        <Lock size={24} />
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-slate-500"></div>
                </div>
             </div>

             {/* Active Subs */}
             <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700 overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-800/50 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Paid Subscriptions</p>
                        <h3 className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">{stats.basic + stats.advanced + stats.pro}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 group-hover:text-green-400 group-hover:border-green-500/30 transition-colors">
                        <CreditCard size={24} />
                    </div>
                </div>
                <div className="flex gap-1 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">{stats.pro} Pro</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">{stats.advanced} Adv</span>
                </div>
             </div>

             {/* MRR */}
             <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-red-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Est. Monthly Revenue</p>
                        <h3 className="text-4xl font-black text-red-500 group-hover:scale-105 transition-transform origin-left">${stats.mrr.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                        <DollarSign size={24} />
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
                    <div className="w-full h-full bg-red-600 animate-pulse"></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
             
             {/* MAIN: USER MANAGEMENT */}
             <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                
                {/* Header & Filters */}
                <div className="p-6 border-b border-slate-800 flex flex-col gap-6 bg-slate-800/30">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Database size={18} className="text-slate-400"/> Operative Database
                        </h2>
                        <div className="flex gap-2">
                           <div className="relative">
                               <Search size={16} className="absolute left-3 top-2.5 text-slate-500"/>
                               <input 
                                   type="text" 
                                   placeholder="Search database..." 
                                   className="bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-red-500 outline-none w-64 placeholder-slate-600 font-mono"
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                               />
                           </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {(['ALL', 'PRO', 'FREE', 'EXPIRING'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setUserFilter(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                    userFilter === tab 
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
                            <tr className="text-slate-500 text-[10px] uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-800">Identity</th>
                                <th className="p-4 font-bold border-b border-slate-800">Status</th>
                                <th className="p-4 font-bold border-b border-slate-800">Device</th>
                                <th className="p-4 font-bold border-b border-slate-800">Financials</th>
                                <th className="p-4 font-bold border-b border-slate-800 text-right">Expiration</th>
                                <th className="p-4 font-bold border-b border-slate-800 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">No operatives found in this sector.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                    u.plan === PlanTier.PRO ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{u.username}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border inline-block ${
                                                u.plan === PlanTier.PRO ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                u.plan === PlanTier.ADVANCED ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                u.plan === PlanTier.BASIC ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                                {u.plan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                {getDeviceIcon(u.lastDevice)}
                                                <span className="hidden md:inline">{u.lastDevice || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-mono text-slate-300 text-xs">
                                                ${u.settings.accountSize.toLocaleString()}
                                                <span className="text-slate-600 mx-2">|</span>
                                                <span className="text-red-400">{u.settings.riskPercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="text-xs font-mono text-slate-400">
                                                {u.planExpiryDate 
                                                  ? new Date(u.planExpiryDate).toLocaleDateString() 
                                                  : <span className="opacity-30">LIFETIME</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => openManageModal(u)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                                            >
                                                <Filter size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

             {/* SIDEBAR: LOGS & ALERTS */}
             <div className="xl:col-span-1 space-y-6">
                
                {/* System Health */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Infrastructure</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white flex items-center gap-2"><Server size={14} className="text-slate-500"/> Core Server</span>
                            <span className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-green-500 w-[98%] h-full"></div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-white flex items-center gap-2"><Globe size={14} className="text-slate-500"/> API Gateway</span>
                            <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">14ms</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-blue-500 w-[45%] h-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Console */}
                <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-2xl">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                         <h3 className="font-mono text-[10px] font-bold text-slate-400 flex items-center gap-2">
                             <Terminal size={12}/> ROOT_CONSOLE
                         </h3>
                         <div className="flex gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                             <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                             <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                         </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-[10px] space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                        {systemLogs.map((log, i) => (
                            <div key={i} className="flex gap-2 leading-relaxed opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                <span className={`${
                                    log.type === 'WARN' ? 'text-yellow-400' :
                                    log.type === 'ERROR' ? 'text-red-400' : 
                                    'text-green-400'
                                }`}>{`> ${log.msg}`}</span>
                            </div>
                        ))}
                        <div className="text-green-500 animate-pulse">_</div>
                    </div>
                </div>
             </div>

          </div>
       </div>

       {/* MANAGE SUBSCRIPTION MODAL */}
       {selectedUser && (
           <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95">
                   <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                       <X size={20} />
                   </button>
                   
                   <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                       SUBSCRIPTION PROTOCOL
                   </h2>
                   <p className="text-slate-500 text-sm mb-8">Adjusting clearance level for operative.</p>

                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center font-bold text-lg text-slate-500 border border-slate-800">
                           {selectedUser.username.charAt(0).toUpperCase()}
                       </div>
                       <div>
                           <p className="text-white font-bold">{selectedUser.username}</p>
                           <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                               {selectedUser.email} 
                               <span className="text-[10px] px-1 bg-slate-800 rounded">{selectedUser.lastDevice || 'Unknown'}</span>
                           </p>
                       </div>
                   </div>

                   <div className="space-y-6 mb-8">
                       <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Plan Tier</label>
                           <div className="grid grid-cols-2 gap-3">
                               {Object.values(PlanTier).map(tier => (
                                   <button
                                       key={tier}
                                       onClick={() => setNewPlan(tier)}
                                       className={`py-3 rounded-lg text-xs font-bold border transition-all ${
                                           newPlan === tier 
                                           ? 'bg-white text-black border-white shadow-lg' 
                                           : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'
                                       }`}
                                   >
                                       {tier}
                                   </button>
                               ))}
                           </div>
                       </div>
                       
                       {newPlan !== PlanTier.FREE && (
                           <div className="animate-in slide-in-from-top-2">
                               <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Access Expiration</label>
                               <input 
                                   type="date" 
                                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-red-500 transition-colors font-mono text-sm"
                                   value={expiryDate}
                                   onChange={(e) => setExpiryDate(e.target.value)}
                               />
                           </div>
                       )}
                   </div>

                   <button 
                       onClick={confirmPlanUpdate}
                       className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
                   >
                       CONFIRM OVERRIDE
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default AdminPanel;
