import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import { Eye, ArrowRight, Mail, Key, UserPlus, LogIn } from 'lucide-react';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (isLogin) {
      const stored = localStorage.getItem('sniper_user');
      if (stored) {
        const user = JSON.parse(stored);
        // Check against Email or Username (legacy support)
        const isMatch = (user.email && user.email.toLowerCase() === formData.email.toLowerCase()) || 
                        (user.username && user.username.toLowerCase() === formData.email.toLowerCase());
        
        if (isMatch) {
          onLogin(user);
          navigate('/dashboard');
        } else {
            // If user doesn't exist in local storage, prompt to signup (Demo logic)
            setError('Account not found. Please create an identity.');
        }
      } else {
        setError('No account found. Please sign up.');
      }
    } else {
      handleSignup();
    }
  };

  const handleSignup = () => {
    // Derive a username from the email (e.g. john from john@example.com)
    const derivedUsername = formData.email.split('@')[0];
    
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username: derivedUsername, // Operative Name
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
    
    localStorage.setItem('sniper_user', JSON.stringify(newUser));
    onLogin(newUser);
    navigate('/dashboard');
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary-400 uppercase tracking-widest ml-1">Email Address</label>
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
              setFormData({ email: '', password: '' });
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