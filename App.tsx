
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThreeBackground from './components/ThreeBackground';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import IdentityPage from './pages/IdentityPage';
import TradingJourney from './components/TradingJourney';
import JournalPage from './pages/JournalPage'; 
import Sidebar from './components/Sidebar';
import { UserProfile, AccountType, PlanTier } from './types';
import { Settings, Save, CheckCircle2, Bell } from 'lucide-react';

const LogsPageWrapper: React.FC<{user: UserProfile, updateUser: any}> = ({user, updateUser}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto h-screen relative">
         <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">Automated Logs</h1>
            <TradingJourney user={user} updateUser={updateUser} />
         </div>
      </main>
    </div>
  )
}

const SettingsPageWrapper: React.FC<{user: UserProfile, updateUser: any}> = ({user, updateUser}) => {
   const [settingsForm, setSettingsForm] = useState(user.settings);
   const [username, setUsername] = useState(user.username);
   const [isSaved, setIsSaved] = useState(false);

   // Initialize notifications if missing (for legacy users)
   useEffect(() => {
     if (!settingsForm.notifications) {
       setSettingsForm(prev => ({
         ...prev,
         notifications: {
           signals: true,
           marketAlerts: true,
           updates: true
         }
       }));
     }
   }, []);

   const saveSettings = () => {
      updateUser({ settings: settingsForm, username: username });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
   };

   const toggleNotification = (key: keyof typeof settingsForm.notifications) => {
      if (!settingsForm.notifications) return;
      setSettingsForm({
        ...settingsForm,
        notifications: {
          ...settingsForm.notifications,
          [key]: !settingsForm.notifications[key as any]
        }
      });
   };

   return (
     <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
       <Sidebar user={user} />
       <main className="flex-1 overflow-y-auto h-screen relative">
          <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl relative">
                
                {/* Save Toast */}
                {isSaved && (
                    <div className="absolute top-6 right-6 flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={18} /> Configuration Saved
                    </div>
                )}

                <h3 className="text-2xl font-black text-white mb-8 border-b border-slate-800 pb-6 flex items-center gap-3">
                   <Settings className="text-primary-500"/> Account Configuration
                </h3>
                <div className="space-y-8">
                   <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-3">Operative Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition outline-none font-sans text-lg" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-3">Account Balance ($)</label>
                         <input 
                            type="number" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition outline-none font-mono text-lg" 
                            value={settingsForm.accountSize}
                            onChange={(e) => setSettingsForm({...settingsForm, accountSize: parseFloat(e.target.value)})}
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-3">Risk per Trade (%)</label>
                         <input 
                            type="number" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition outline-none font-mono text-lg" 
                            value={settingsForm.riskPercentage}
                            onChange={(e) => setSettingsForm({...settingsForm, riskPercentage: parseFloat(e.target.value)})}
                         />
                      </div>
                   </div>
                   <div>
                       <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-3">Broker Account Type</label>
                       <div className="grid grid-cols-3 gap-4">
                          {[AccountType.STANDARD, AccountType.RAW, AccountType.PRO].map((type: any) => (
                             <button
                                key={type}
                                onClick={() => setSettingsForm({...settingsForm, accountType: type})}
                                className={`p-4 rounded-xl border text-sm font-bold transition ${settingsForm.accountType === type ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                             >
                                {type}
                             </button>
                          ))}
                       </div>
                   </div>

                   {/* NOTIFICATIONS SECTION */}
                   <div className="pt-8 border-t border-slate-800">
                      <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Bell size={18} className="text-primary-500"/> Notification Center
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-white">New Trade Signals</p>
                                <p className="text-xs text-slate-500">Get push notifications when AI detects a new setup.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('signals')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.notifications?.signals ? 'bg-primary-600' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settingsForm.notifications?.signals ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-white">Market Volatility Alerts</p>
                                <p className="text-xs text-slate-500">Warnings for high-impact news (NFP, FOMC, CPI).</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('marketAlerts')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.notifications?.marketAlerts ? 'bg-primary-600' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settingsForm.notifications?.marketAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-white">System Updates</p>
                                <p className="text-xs text-slate-500">Notifications about platform maintenance and new features.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('updates')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.notifications?.updates ? 'bg-primary-600' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settingsForm.notifications?.updates ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                      </div>
                   </div>

                   <button 
                      onClick={saveSettings} 
                      className="w-full bg-primary-600 text-white font-black text-lg py-4 rounded-xl hover:bg-primary-500 transition shadow-lg shadow-primary-500/20 mt-4 flex items-center justify-center gap-2"
                   >
                      <Save size={20} /> Save System Configuration
                   </button>
                </div>
             </div>
          </div>
       </main>
     </div>
   )
 }


const App: React.FC = () => {
  // --- Global State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize/Load User from LocalStorage (Session)
  useEffect(() => {
    // 1. Initial Load
    const storedSession = localStorage.getItem('tv_session');
    if (storedSession) {
        let currentUser = JSON.parse(storedSession);
        
        // 2. CHECK DATABASE SYNC
        // If the admin updated the plan in 'tv_users', the session might be stale.
        // Let's check the master record and update if needed.
        const dbStr = localStorage.getItem('tv_users');
        if (dbStr) {
            const db: UserProfile[] = JSON.parse(dbStr);
            const masterRecord = db.find(u => u.id === currentUser.id);
            
            // Check expiry
            if (masterRecord) {
               if (masterRecord.planExpiryDate && new Date(masterRecord.planExpiryDate) < new Date()) {
                  masterRecord.plan = PlanTier.FREE; // Auto Downgrade
                  masterRecord.planExpiryDate = undefined;
                  
                  // Update DB with downgrade
                  const index = db.findIndex(u => u.id === masterRecord.id);
                  db[index] = masterRecord;
                  localStorage.setItem('tv_users', JSON.stringify(db));
               }
               
               currentUser = masterRecord;
               localStorage.setItem('tv_session', JSON.stringify(currentUser));
            }
        }
        setUser(currentUser);
    }
    
    setIsLoading(false);
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    
    // 1. Update State
    setUser(updatedUser);
    
    // 2. Update Active Session
    localStorage.setItem('tv_session', JSON.stringify(updatedUser));
    
    // 3. Update Permanent Database (So data isn't lost on logout)
    const dbStr = localStorage.getItem('tv_users');
    if (dbStr) {
        const db: UserProfile[] = JSON.parse(dbStr);
        const index = db.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            db[index] = updatedUser;
            localStorage.setItem('tv_users', JSON.stringify(db));
        }
    }
  };

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    // Note: The AuthPage handles setting the 'tv_session'
  };

  if (isLoading) return null;

  return (
    <>
      <ThreeBackground />
      <HashRouter>
        <div className="min-h-screen relative z-10 text-slate-200">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
            
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/analysis" 
              element={user ? <AnalysisPage user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/logs" 
              element={user ? <LogsPageWrapper user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />

            <Route 
              path="/journey" 
              element={user ? <JournalPage user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/settings" 
              element={user ? <SettingsPageWrapper user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />

            <Route 
              path="/id" 
              element={user ? <IdentityPage user={user} updateUser={updateUser} /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </>
  );
};

export default App;
