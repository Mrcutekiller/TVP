import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import { Eye, ArrowRight, Mail, Key, UserPlus, LogIn, User } from 'lucide-react';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- LOGIC FOR LOGIN ---
    if (isLogin) {
        if (!formData.email || !formData.password) {
            setError('Please fill in credentials.');
            return;
        }

        // 1. Fetch Users "Database"
        const usersStr = localStorage.getItem('tv_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
        
        // 2. Find User (Case insensitive email)
        // Also support username login for convenience if needed, but primary is email
        const foundUser = users.find(u => 
            (u.email && u.email.toLowerCase() === formData.email.toLowerCase()) || 
            (u.username && u.username.toLowerCase() === formData.email.toLowerCase())
        );

        if (foundUser) {
            // 3. Set Session
            localStorage.setItem('tv_session', JSON.stringify(foundUser));
            onLogin(foundUser);
            navigate('/dashboard');
        } else {
            setError('Account not found. Please register an operative identity.');
        }
    } 
    // --- LOGIC FOR SIGNUP ---
    else {
        if (!formData.username) {
            setError('Please choose an Operative Name (Username)');
            return;
        }
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        if (!formData.email.includes('@')) {
            setError('Invalid email format');
            return;
        }

        // 1. Fetch Users "Database"
        const usersStr = localStorage.getItem('tv_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

        // 2. Check duplicates
        const exists = users.some(u => 
            (u.email && u.email.toLowerCase() === formData.email.toLowerCase())
        );
        if (exists) {
            setError('This email is already registered.');
            return;
        }

        // 3. Create User
        const newUser: UserProfile = {
            id: crypto.randomUUID(),
            username: formData.username,
            email: formData.email,
            plan: PlanTier.FREE,
            signalsUsedLifetime: 0,
            signalsUsedToday: 0,
            joinDate: new Date().toISOString(),
            settings: {
                accountSize: 1000,
                riskPercentage: 1,
                accountType: AccountType.STANDARD
            },
            idTheme: 'cyan',
            tradeHistory: []
        };

        // 4. Save to Database
        users.push(newUser);
        localStorage.setItem('tv_users', JSON.stringify(users));

        // 5. Set Session
        localStorage.setItem('tv_session', JSON.stringify(newUser));
        
        onLogin(newUser);
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] z-0 animate-pulse-slow"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border border-white/10 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-primary-500/50 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Eye size={32} className="text-primary-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            TRADE <span className="text-primary-500">VISION</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Secure Terminal Access' : 'Initialize Operative Identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-primary-400 uppercase tracking-widest ml-1">Operative Name</label>
                <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="e.g. Neo"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-sans"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-primary-400 uppercase tracking-widest ml-1">{isLogin ? 'Email Address' : 'Email Address'}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="name@domain.com"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-sans"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-primary-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Key className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-sans"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 group"
          >
            {isLogin ? (
                <>ACCESS SYSTEM <LogIn size={20} /></>
            ) : (
                <>CREATE IDENTITY <UserPlus size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', username: '' });
            }}
            className="text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto hover:underline decoration-primary-500 underline-offset-4"
          >
            {isLogin ? "Need access? Register Protocol" : "Already an operative? Login"}
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;