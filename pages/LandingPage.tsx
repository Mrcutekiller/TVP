import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import PlanCard from '../components/PlanCard';
import UserIdentityCard from '../components/UserIdentityCard';
import { ArrowRight, BarChart2, Shield, Zap, Instagram, Send, Eye, Terminal, Cpu } from 'lucide-react';

interface Props {
  user: UserProfile | null;
}

// Mock profiles
const FOUNDER_PROFILE: UserProfile = {
  id: "@mrcute_killer",
  username: "Biruk Fikru",
  plan: PlanTier.PRO,
  signalsUsedLifetime: 9999,
  signalsUsedToday: 9999,
  joinDate: "2023-01-01",
  settings: {
    accountSize: 0,
    riskPercentage: 0,
    accountType: AccountType.PRO // Founder
  },
  idTheme: 'founder',
  tradeHistory: []
};

const CEO_PROFILE: UserProfile = {
  id: "@Prodbynatyy",
  username: "Naty",
  plan: PlanTier.PRO,
  signalsUsedLifetime: 9999,
  signalsUsedToday: 9999,
  joinDate: "2023-01-01",
  settings: {
    accountSize: 0,
    riskPercentage: 0,
    accountType: AccountType.STANDARD // CEO
  },
  idTheme: 'ceo',
  tradeHistory: []
};

const LandingPage: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-primary-500/30 overflow-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Terminal className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">TRADE<span className="text-primary-500">VISION</span></span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleAction}
              className="px-6 py-2.5 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {user ? 'Launch Terminal' : 'Access System'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
            AI-Powered Structural Analysis V2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-8 duration-700">
            PRECISION <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 text-glow">TRADING INTEL</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Transform raw chart data into institutional-grade trade setups. 
            Automated Order Block detection, Risk Profiling, and Position Sizing.
          </p>
          
          <button 
            onClick={handleAction}
            className="group relative px-8 py-4 bg-primary-600 text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)] animate-in fade-in zoom-in duration-700 delay-200"
          >
             <span className="relative z-10 flex items-center gap-3">
               Analyze Chart Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
             </span>
          </button>

          {/* 3D Dashboard Mockup */}
          <div className="mt-24 relative max-w-5xl mx-auto perspective-1000 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
             <div className="relative z-10 transform rotate-x-12 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 md:p-8 glass-card">
                {/* Mock UI Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="text-xs font-mono text-slate-500">TRADE_VISION_TERMINAL_V2</div>
                </div>
                {/* Mock UI Grid */}
                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-2 h-64 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent"></div>
                      <BarChart2 className="text-slate-600 opacity-20 w-full h-full p-12" />
                      <div className="absolute top-4 left-4 text-xs font-mono text-primary-400">XAUUSD H1 [ANALYZING...]</div>
                   </div>
                   <div className="col-span-1 space-y-4">
                      <div className="h-28 bg-slate-800/50 rounded-xl border border-white/5 p-4">
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Confidence Score</div>
                         <div className="text-4xl font-mono font-bold text-white">94%</div>
                         <div className="w-full h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
                            <div className="w-[94%] h-full bg-success"></div>
                         </div>
                      </div>
                      <div className="h-32 bg-slate-800/50 rounded-xl border border-white/5 p-4">
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Active Signal</div>
                         <div className="text-lg font-bold text-white">BUY GOLD</div>
                         <div className="text-xs font-mono text-success mt-1">@ 2024.50</div>
                         <div className="text-xs font-mono text-slate-400 mt-4">TP: 2030.00</div>
                      </div>
                   </div>
                </div>
             </div>
             {/* Glow behind mock */}
             <div className="absolute -inset-4 bg-primary-600/20 blur-[60px] -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-slate-900 border-t border-white/5 relative">
         <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold text-white text-center mb-16">SYSTEM CAPABILITIES</h2>
            <div className="grid md:grid-cols-3 gap-12">
               {[
                 { icon: <Cpu size={40} />, title: 'AI Structure Detection', desc: 'Identify Order Blocks, Breakers, and Liquidity Voids instantly.' },
                 { icon: <Shield size={40} />, title: 'Risk Management', desc: 'Auto-calculation of Lot Size based on your equity and risk tolerance.' },
                 { icon: <Zap size={40} />, title: 'Instant Execution', desc: 'From screenshot to complete trade plan in under 3 seconds.' },
               ].map((f, i) => (
                 <div key={i} className="group p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-primary-500/50 transition-all hover:-translate-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors">
                       <div className="text-primary-500 group-hover:text-white transition-colors">{f.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Pricing */}
      <section className="py-32 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-4">ACCESS TIERS</h2>
        <p className="text-center text-slate-400 mb-20 max-w-2xl mx-auto">Choose your clearance level. Upgrade anytime.</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PlanCard 
            name="Sniper Basic" 
            price="$14" 
            tier={PlanTier.BASIC}
            features={['5 Signals / Day', 'AI Lot Calculation', 'Basic Pairs + Gold']}
            missing={['Auto-Trade', 'Advanced Analysis', 'Crypto & Indices']}
            onSelect={() => window.open(`https://t.me/Prodbynatyy?text=I want to upgrade to Sniper Basic`, '_blank')}
          />
          <PlanCard 
            name="Sniper Advanced" 
            price="$29" 
            tier={PlanTier.ADVANCED}
            recommended={true}
            features={['20 Signals / Day', 'AI Lot Calculation', 'All Pairs + Gold + Indices', 'Live Chart', 'Backtesting']}
            missing={['Auto-Trade']}
            onSelect={() => window.open(`https://t.me/Prodbynatyy?text=I want to upgrade to Sniper Advanced`, '_blank')}
          />
          <PlanCard 
            name="Sniper Pro" 
            price="$49" 
            tier={PlanTier.PRO}
            features={['Unlimited Signals', 'All Markets (Crypto inc.)', 'Full AI Analysis', 'Auto-Trade (Beta Access)']}
            onSelect={() => window.open(`https://t.me/Prodbynatyy?text=I want to upgrade to Sniper Pro`, '_blank')}
          />
        </div>
      </section>

      {/* Footer / Team */}
      <footer className="border-t border-white/5 bg-slate-950 pt-24 pb-12">
        <div className="container mx-auto px-6 text-center">
           <h3 className="text-2xl font-bold text-white mb-12 uppercase tracking-widest">Core Team</h3>
           
           <div className="flex flex-col md:flex-row justify-center items-center gap-16 mb-24">
             <div className="group">
                <UserIdentityCard user={FOUNDER_PROFILE} isTeamMember />
                <div className="mt-8">
                   <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Founder</p>
                   <a href="https://instagram.com/mrcute_killer" target="_blank" className="text-slate-400 hover:text-white flex items-center justify-center gap-2 transition">
                     <Instagram size={16}/> @mrcute_killer
                   </a>
                </div>
             </div>
             <div className="group">
                <UserIdentityCard user={CEO_PROFILE} isTeamMember />
                <div className="mt-8">
                   <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">CEO</p>
                   <div className="flex flex-col gap-2">
                     <a href="https://t.me/Prodbynatyy" target="_blank" className="text-slate-400 hover:text-white flex items-center justify-center gap-2 transition">
                       <Send size={16}/> @Prodbynatyy
                     </a>
                     <a href="https://instagram.com/prodby.natty" target="_blank" className="text-slate-400 hover:text-white flex items-center justify-center gap-2 transition">
                       <Instagram size={16}/> @prodby.natty
                     </a>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="pt-12 border-t border-white/5">
             <div className="flex items-center justify-center gap-2 mb-4">
                <Terminal size={20} className="text-slate-600" />
                <span className="font-bold text-slate-500">TRADE VISION PRO SYSTEM</span>
             </div>
             <p className="text-slate-600 text-sm">&copy; 2024 Trade Vision Pro. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;