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
import Sidebar from './components/Sidebar';
import { UserProfile, AccountType } from './types';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

const JourneyPageWrapper: React.FC<{user: UserProfile, updateUser: any}> = ({user, updateUser}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto h-screen relative">
         <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">Trading Journey</h1>
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

   const saveSettings = () => {
      updateUser({ settings: settingsForm, username: username });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
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
    // We now use 'tv_session' for the currently logged in user
    const storedSession = localStorage.getItem('tv_session');
    
    // Legacy support: Check for old 'sniper_user' key and migrate it if found
    if (!storedSession) {
        const legacy = localStorage.getItem('sniper_user');
        if (legacy) {
            const legacyUser = JSON.parse(legacy);
            localStorage.setItem('tv_session', legacy);
            
            // Also ensure it's in the DB
            const dbStr = localStorage.getItem('tv_users');
            const db = dbStr ? JSON.parse(dbStr) : [];
            if (!db.some((u: any) => u.id === legacyUser.id)) {
                db.push(legacyUser);
                localStorage.setItem('tv_users', JSON.stringify(db));
            }
            setUser(legacyUser);
        }
    } else {
        setUser(JSON.parse(storedSession));
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
              element={user ? <Dashboard user={user} updateUser={updateUser} /> : <Navigate to="/auth" replace />} 
            />
            
            <Route 
              path="/analysis" 
              element={user ? <AnalysisPage user={user} updateUser={updateUser} /> : <Navigate to="/auth" replace />} 
            />
            
            <Route 
              path="/journey" 
              element={user ? <JourneyPageWrapper user={user} updateUser={updateUser} /> : <Navigate to="/auth" replace />} 
            />
            
            <Route 
              path="/settings" 
              element={user ? <SettingsPageWrapper user={user} updateUser={updateUser} /> : <Navigate to="/auth" replace />} 
            />

            <Route 
              path="/id" 
              element={user ? <IdentityPage user={user} updateUser={updateUser} /> : <Navigate to="/auth" replace />} 
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