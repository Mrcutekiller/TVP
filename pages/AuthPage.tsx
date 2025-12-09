
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import { Eye, ArrowRight, Mail, Key, UserPlus, LogIn, User, CheckCircle } from 'lucide-react';

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
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 0) score = 1;
    if (pass.length > 6) score++;
    if (pass.match(/[0-9]/) && pass.match(/[^a-zA-Z0-9]/)) score++;
    if (pass.length > 10) score = 3;
    setPasswordStrength(score);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormData({...formData, password: val});
      calculateStrength(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- ADMIN BACKDOOR CHECK ---
    if (formData.email.toLowerCase() === 'birukf37@gmail.com' && formData.password === 'admin20') {
        localStorage.setItem('tv_admin_auth', 'true');
        navigate('/admin');
        return;
    }

    // --- LOGIC FOR LOGIN ---
    if (isLogin) {
        if (!formData.email || !formData.password) {
            setError('Please fill in credentials.');
            return;
        }

        const usersStr = localStorage.getItem('tv_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
        
        const foundUser = users.find(u => 
            (u.email && u.email.toLowerCase() === formData.email.toLowerCase()) || 
            (u.username && u.username.toLowerCase() === formData.email.toLowerCase())
        );

        if (foundUser) {
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

        const usersStr = localStorage.getItem('tv_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

        const exists = users.some(u => 
            (u.email && u.email.toLowerCase() === formData.email.toLowerCase())
        );
        if (exists) {
            setError('This email is already registered.');
            return;
        }
        
        // Simulating device info
        const deviceType = window.innerWidth < 768 ? 'Mobile (iPhone/Android)' : 'Desktop PC';

        const newUser: UserProfile = {
            id: crypto.randomUUID(),
            username: formData.username,
            email: formData.email,
            plan: PlanTier.FREE,
            signalsUsedLifetime: 0,
            signalsUsedToday: 0,
            joinDate: new Date().toISOString(),
            lastDevice: deviceType,
            settings: {
                accountSize: 1000,
                riskPercentage: 1,
                accountType: AccountType.STANDARD,
                notifications: {
                    signals: true,
                    marketAlerts: true,
                    updates: true
                }
            },
            idTheme: 'cyan',
            tradeHistory: []
        };

        users.push(newUser);
        localStorage.setItem('tv_users', JSON.stringify(users));
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
                onChange={handlePasswordChange}
              />
            </div>
            
            {/* Password Strength Meter */}
            {!isLogin && formData.password.length > 0 && (
                <div className="mt-3">
                    <div className="flex gap-1 h-1.5 mb-2">
                        <div className={`flex-1 rounded-full transition-all duration-500 ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                        <div className={`flex-1 rounded-full transition-all duration-500 ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
                        <div className={`flex-1 rounded-full transition-all duration-500 ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-slate-800'}`}></div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Security Level</span>
                        <span className={`text-[10px] uppercase font-black tracking-wider ${
                            passwordStrength === 1 ? 'text-red-500' : 
                            passwordStrength === 2 ? 'text-yellow-500' : 
                            passwordStrength === 3 ? 'text-green-500' : 'text-slate-500'
                        }`}>
                            {passwordStrength === 1 ? 'WEAK' : passwordStrength === 2 ? 'MEDIUM' : passwordStrength === 3 ? 'STRONG' : '...'}
                        </span>
                    </div>
                </div>
            )}
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
              setPasswordStrength(0);
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
