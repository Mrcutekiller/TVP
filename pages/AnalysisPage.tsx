import React, { useState, useRef } from 'react';
import { UserProfile, TradeSignal, PlanTier, TradeLog, AIAnalysisResponse } from '../types';
import Sidebar from '../components/Sidebar';
import { analyzeChartWithGemini } from '../services/geminiService';
import { 
  Upload, RefreshCw, Check, Copy, AlertTriangle, 
  Target, Shield, BrainCircuit, Microscope, X
} from 'lucide-react';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const AnalysisPage: React.FC<Props> = ({ user, updateUser }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const checkLimits = () => {
    // Check daily limit for Free plan
    if (user.plan === PlanTier.FREE && user.signalsUsedToday >= 5) {
      return "Free daily limit reached (5/5). Upgrade to continue.";
    }
    return null;
  };

  const calculateLots = (slPrice: number, entryPrice: number, pair: string): { lots: number, slPips: number } => {
    const isGold = pair.toUpperCase().includes('XAU') || pair.toUpperCase().includes('GOLD');
    const isJpy = pair.toUpperCase().includes('JPY');
    
    // Determine Pip Size
    let pipSize = 0.0001;
    if (isJpy) pipSize = 0.01;
    if (isGold) pipSize = 0.1; 

    // Calculate Distance and Pips
    const dist = Math.abs(entryPrice - slPrice);
    const slPips = Math.round(dist / pipSize);

    // Get Risk Amount from User Settings
    const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);
    
    // Estimate Lot Size
    // Formula: Risk = Pips * PipValue * Lots
    // We assume Standard Lot ($10/pip approx for USD pairs)
    let pipValue = 10; 
    
    // Adjust pip value roughly for symbol types (simplified for demo)
    if (isGold) pipValue = 1; // 1 standard lot gold = $1 per tick/pip usually.
    
    let lots = 0;
    if (slPips > 0) {
        lots = Number((riskAmount / (slPips * pipValue)).toFixed(2));
    }
    
    // Min lot size
    if (lots < 0.01) lots = 0.01;

    return { lots, slPips };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const limitError = checkLimits();
      if (limitError) {
          setErrorMsg(limitError);
          return;
      }

      setIsAnalyzing(true);
      setErrorMsg(null);
      setLastSignal(null);

      try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              // Extract the base64 data part
              const base64Data = base64String.split(',')[1];
              
              const analysis = await analyzeChartWithGemini(base64Data);
              
              if (!analysis || !analysis.isSetupValid) {
                  throw new Error(analysis.reasoning || "Invalid setup detected.");
              }

              // Calculate Risk Parameters
              const { lots, slPips } = calculateLots(analysis.sl, analysis.entry, analysis.pair);
              const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);

              // Construct Trade Signal
              const newSignal: TradeSignal = {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  pair: analysis.pair,
                  timeframe: analysis.timeframe,
                  direction: analysis.direction as 'BUY' | 'SELL',
                  strategy: analysis.strategy,
                  entry: analysis.entry,
                  sl: analysis.sl,
                  tp1: analysis.tp1,
                  tp2: analysis.tp2,
                  slPips: slPips,
                  tpPips: 0, // Placeholder
                  lotSize: lots,
                  riskAmount: riskAmount,
                  rewardTp1: riskAmount, // 1:1 approx
                  rewardTp2: riskAmount * 2, // 1:2 approx
                  reasoning: analysis.reasoning
              };

              setLastSignal(newSignal);

              // Update User History
              const newLog: TradeLog = {
                  id: newSignal.id,
                  date: new Date().toISOString(),
                  pair: newSignal.pair,
                  type: newSignal.direction,
                  entry: newSignal.entry,
                  exit: 0,
                  pnl: 0,
                  status: 'PENDING',
                  timeframe: newSignal.timeframe,
                  reasoning: newSignal.reasoning,
                  sl: newSignal.sl,
                  tp1: newSignal.tp1,
                  tp2: newSignal.tp2,
                  strategy: newSignal.strategy
              };

              updateUser({
                  signalsUsedToday: user.signalsUsedToday + 1,
                  signalsUsedLifetime: user.signalsUsedLifetime + 1,
                  tradeHistory: [newLog, ...user.tradeHistory]
              });
          };
      } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || "Failed to analyze chart.");
      } finally {
          setIsAnalyzing(false);
          // Reset file input
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const copyToClipboard = () => {
      if (!lastSignal) return;
      const text = `SIGNAL: ${lastSignal.direction} ${lastSignal.pair}\nENTRY: ${lastSignal.entry}\nSL: ${lastSignal.sl}\nTP1: ${lastSignal.tp1}\nTP2: ${lastSignal.tp2}\nLOTS: ${lastSignal.lotSize}`;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto h-screen relative">
          <div className="p-6 md:p-10 max-w-6xl mx-auto">
             
             {/* HEADER */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                 <div>
                     <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Microscope className="text-primary-500" size={32}/> AI Analysis Terminal
                     </h1>
                     <p className="text-slate-400 mt-2">Upload your chart. Let Gemini 2.5 Flash Vision detect the setup.</p>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                     <div className="text-right">
                         <p className="text-[10px] font-bold uppercase text-slate-500">Daily Quota</p>
                         <p className={`text-xl font-mono font-bold ${checkLimits() ? 'text-red-500' : 'text-white'}`}>
                             {user.signalsUsedToday} / {user.plan === PlanTier.FREE ? 5 : '∞'}
                         </p>
                     </div>
                     <div className="h-10 w-1 bg-slate-800"></div>
                     <button onClick={() => window.open('https://t.me/Prodbynatyy', '_blank')} className="text-xs font-bold text-primary-400 hover:text-primary-300">
                         INCREASE LIMITS
                     </button>
                 </div>
             </div>

             {/* ERROR BANNER */}
             {errorMsg && (
                 <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-bold animate-in fade-in slide-in-from-top-2">
                     <AlertTriangle size={20} />
                     {errorMsg}
                     <button onClick={() => setErrorMsg(null)} className="ml-auto hover:text-white"><X size={18} /></button>
                 </div>
             )}

             {/* MAIN CONTENT AREA */}
             {!lastSignal ? (
                 <div 
                    onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                    className={`border-3 border-dashed rounded-3xl h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden ${isAnalyzing ? 'border-primary-500/30 bg-primary-500/5 cursor-wait' : 'border-slate-800 hover:border-primary-500 hover:bg-slate-900/50'}`}
                 >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        disabled={isAnalyzing} 
                    />
                    
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                    {isAnalyzing ? (
                        <div className="text-center z-10">
                            <div className="relative w-20 h-20 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                                <RefreshCw className="absolute inset-0 m-auto text-primary-500 animate-pulse" size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 animate-pulse">ANALYZING MARKET DATA</h3>
                            <p className="text-primary-400 font-mono text-sm">Identifying Order Blocks & Liquidity...</p>
                        </div>
                    ) : (
                        <div className="text-center z-10 group-hover:scale-105 transition-transform duration-300">
                            <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-800 group-hover:border-primary-500 group-hover:shadow-primary-500/30 transition-all">
                                <Upload size={40} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">Drop Chart Here</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Upload a clear screenshot of any timeframe. Our AI will extract price action, structure, and optimal entry points.
                            </p>
                            <span className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold text-sm group-hover:bg-primary-600 transition-colors shadow-lg">
                                SELECT IMAGE FILE
                            </span>
                        </div>
                    )}
                 </div>
             ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="grid lg:grid-cols-2 gap-8">
                         
                         {/* LEFT: SIGNAL TICKET */}
                         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600"></div>
                             
                             <div className="flex justify-between items-start mb-8">
                                 <div>
                                     <div className="flex items-center gap-2 mb-2">
                                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trade Vision Intel</p>
                                     </div>
                                     <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{lastSignal.pair}</h2>
                                     <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider ${lastSignal.direction === 'BUY' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                         {lastSignal.direction} SIGNAL
                                     </span>
                                 </div>
                                 <button 
                                    onClick={() => setLastSignal(null)}
                                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                                 >
                                     <RefreshCw size={20} />
                                 </button>
                             </div>

                             <div className="grid grid-cols-2 gap-4 mb-8">
                                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                     <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Entry Zone</span>
                                     <span className="text-2xl font-mono font-bold text-white">{lastSignal.entry}</span>
                                 </div>
                                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                     <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Lot Size</span>
                                     <span className="text-2xl font-mono font-bold text-primary-400">{lastSignal.lotSize}</span>
                                 </div>
                             </div>

                             <div className="space-y-4">
                                 <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Shield size={18}/></div>
                                         <span className="text-sm font-bold text-slate-300">Stop Loss</span>
                                     </div>
                                     <span className="font-mono font-bold text-red-500">{lastSignal.sl} <span className="text-xs opacity-60">({lastSignal.slPips} pips)</span></span>
                                 </div>
                                 <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Target size={18}/></div>
                                         <span className="text-sm font-bold text-slate-300">TP 1 (Conservative)</span>
                                     </div>
                                     <span className="font-mono font-bold text-green-500">{lastSignal.tp1}</span>
                                 </div>
                                 <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Target size={18}/></div>
                                         <span className="text-sm font-bold text-slate-300">TP 2 (Extended)</span>
                                     </div>
                                     <span className="font-mono font-bold text-green-500">{lastSignal.tp2}</span>
                                 </div>
                             </div>

                             <button 
                                onClick={copyToClipboard}
                                className="w-full mt-8 py-4 bg-white hover:bg-slate-200 text-black font-black rounded-xl transition shadow-xl flex items-center justify-center gap-2"
                             >
                                {isCopied ? <Check size={20} /> : <Copy size={20} />}
                                {isCopied ? 'COPIED TO CLIPBOARD' : 'COPY PARAMETERS'}
                             </button>
                         </div>

                         {/* RIGHT: REASONING & RISK */}
                         <div className="space-y-6">
                             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit">
                                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                     <BrainCircuit className="text-primary-500" size={24}/> AI Logic
                                 </h3>
                                 <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-sm font-medium">
                                     {lastSignal.reasoning}
                                 </div>
                             </div>

                             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit">
                                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                     <Shield className="text-primary-500" size={24}/> Risk Calculator
                                 </h3>
                                 <div className="space-y-4">
                                     <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                         <span className="text-slate-500">Account Balance</span>
                                         <span className="text-white font-mono">${user.settings.accountSize.toLocaleString()}</span>
                                     </div>
                                     <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                         <span className="text-slate-500">Risked Amount ({user.settings.riskPercentage}%)</span>
                                         <span className="text-red-400 font-mono font-bold">-${lastSignal.riskAmount.toFixed(2)}</span>
                                     </div>
                                     <div className="flex justify-between text-sm">
                                         <span className="text-slate-500">Reward Potential (TP2)</span>
                                         <span className="text-green-400 font-mono font-bold">+${lastSignal.rewardTp2.toFixed(2)}</span>
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>
             )}

          </div>
      </main>
    </div>
  );
};

export default AnalysisPage;