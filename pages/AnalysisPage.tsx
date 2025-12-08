
import React, { useState, useRef } from 'react';
import { UserProfile, TradeSignal, PlanTier } from '../types';
import Sidebar from '../components/Sidebar';
import { analyzeChartWithGemini } from '../services/geminiService';
import { 
  Upload, RefreshCw, Check, Copy, AlertTriangle, 
  ArrowRight, Target, Shield, BrainCircuit, Microscope, Lock
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
    if (user.plan === PlanTier.FREE && user.signalsUsedLifetime >= 5) {
      return "Free limit reached (5/5). Upgrade your plan to continue.";
    }
    return null;
  };

  const calculateLots = (slPrice: number, entryPrice: number, pair: string): { lots: number, slPips: number } => {
    const isGold = pair.toUpperCase().includes('XAU') || pair.toUpperCase().includes('GOLD');
    const isJpy = pair.toUpperCase().includes('JPY');
    let slPips = 0;
    const slDiff = Math.abs(entryPrice - slPrice);
    
    if (isGold) {
      slPips = slDiff * 10; 
      if (slPips < 1) slPips = 1;
    } else {
        if (isJpy) slPips = slDiff * 100;
        else slPips = slDiff * 10000;
    }
    
    if (slPips === 0) slPips = 10;

    const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);
    const lotSize = riskAmount / (slPips * 10); 
    
    return { lots: parseFloat(lotSize.toFixed(2)), slPips: parseFloat(slPips.toFixed(1)) };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const limitError = checkLimits();
    if (limitError) {
      setErrorMsg(limitError);
      return;
    }

    setIsAnalyzing(true);
    setLastSignal(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await analyzeChartWithGemini(base64);

        if (!analysis.isSetupValid) {
          // Display the specific error reason from the service (e.g. API Key missing)
          setErrorMsg(analysis.reasoning || "Analysis failed. Please try a clearer chart image.");
          setIsAnalyzing(false);
          return;
        }

        const entry = analysis.entry;
        const sl = analysis.sl;
        const riskDist = Math.abs(entry - sl);
        
        let finalTp1, finalTp2;
        const isJpy = analysis.pair.toUpperCase().includes('JPY');
        const isGold = analysis.pair.toUpperCase().includes('XAU');
        const precision = isJpy ? 3 : isGold ? 2 : 5;

        if (analysis.direction === 'BUY') {
            finalTp1 = entry + riskDist;
            finalTp2 = entry + (riskDist * 2);
        } else {
            finalTp1 = entry - riskDist;
            finalTp2 = entry - (riskDist * 2);
        }
        
        finalTp1 = Number(finalTp1.toFixed(precision));
        finalTp2 = Number(finalTp2.toFixed(precision));
        const finalEntry = Number(entry.toFixed(precision));
        const finalSl = Number(sl.toFixed(precision));

        const { lots, slPips } = calculateLots(finalSl, finalEntry, analysis.pair);
        
        // Calculate TP Pips roughly for display
        const tp1Diff = Math.abs(finalTp1 - finalEntry);
        let tp1Pips = 0;
        if (isGold) tp1Pips = tp1Diff * 10;
        else if (isJpy) tp1Pips = tp1Diff * 100;
        else tp1Pips = tp1Diff * 10000;
        
        const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);
        
        const newSignal: TradeSignal = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...analysis,
          entry: finalEntry,
          sl: finalSl,
          tp1: finalTp1,
          tp2: finalTp2,
          direction: analysis.direction as 'BUY' | 'SELL',
          slPips,
          tpPips: parseFloat(tp1Pips.toFixed(1)),
          lotSize: lots,
          riskAmount: parseFloat(riskAmount.toFixed(2)),
          rewardTp1: parseFloat(riskAmount.toFixed(2)),
          rewardTp2: parseFloat((riskAmount * 2).toFixed(2)),
          reasoning: analysis.reasoning
        };

        // Simulate "Processing" time for effect
        setTimeout(() => {
             setLastSignal(newSignal);
             setIsAnalyzing(false);
             
             // Add to history
             const tradeLogItem = {
                id: newSignal.id,
                date: new Date().toISOString(),
                pair: newSignal.pair,
                type: newSignal.direction,
                entry: newSignal.entry,
                exit: 0,
                pnl: 0,
                status: 'PENDING' as const, 
                timeframe: newSignal.timeframe,
                sl: newSignal.sl,
                tp1: newSignal.tp1,
                tp2: newSignal.tp2,
                reasoning: newSignal.reasoning,
                strategy: newSignal.strategy
             };
             
             const history = user.tradeHistory || [];
             updateUser({
               signalsUsedLifetime: user.plan === PlanTier.FREE ? user.signalsUsedLifetime + 1 : user.signalsUsedLifetime,
               signalsUsedToday: user.signalsUsedToday + 1,
               tradeHistory: [tradeLogItem, ...history]
             });
        }, 1500);
      };
    } catch (err) {
      console.error(err);
      setErrorMsg("Critical System Error. Please check console.");
      setIsAnalyzing(false);
    }
  };

  const handleCopyShare = () => {
    if (!lastSignal) return;
    const isBuy = lastSignal.direction === 'BUY';
    const arrow = isBuy ? '🟢' : '🔴';
    const text = `Trade Vision Intel\n${lastSignal.pair} | ${lastSignal.direction}\nEntry: ${lastSignal.entry}\nSL: ${lastSignal.sl}\nTP: ${lastSignal.tp2}\nStrategy: ${lastSignal.strategy}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isFree = user.plan === PlanTier.FREE;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans bg-grid-pattern">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
          
           <div className="mb-10 flex items-center gap-3">
              <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <Microscope className="text-primary-500" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Market Forensics</h1>
                <p className="text-sm text-slate-400">Upload charts for structural analysis and risk profiling.</p>
              </div>
           </div>

           {/* UPLOAD ZONE */}
           {!lastSignal && (
              <div 
                 className={`group relative rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 min-h-[500px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${isAnalyzing ? 'cursor-wait opacity-80' : 'cursor-pointer hover:border-primary-500 hover:bg-slate-900'}`}
                 onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              >
                 {/* Animated Background */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 
                 <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg">
                    {isAnalyzing ? (
                       <div className="space-y-6">
                          <div className="relative w-24 h-24 mx-auto">
                             <div className="absolute inset-0 border-t-4 border-primary-500 rounded-full animate-spin"></div>
                             <div className="absolute inset-4 border-b-4 border-accent-500 rounded-full animate-spin-slow"></div>
                             <BrainCircuit className="absolute inset-0 m-auto text-white animate-pulse" size={32} />
                          </div>
                          <div>
                             <h2 className="text-2xl font-mono font-bold text-white mb-2">PROCESSING INTEL</h2>
                             <div className="flex flex-col gap-1 text-[10px] font-mono text-primary-400 opacity-80">
                                <span>Scanning Candlestick Geometry...</span>
                                <span>Identifying Liquidity Pools...</span>
                                <span>Calculating Risk Parameters...</span>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <>
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-700">
                             <Upload className="text-slate-300 group-hover:text-primary-400" size={32} />
                          </div>
                          <h2 className="text-3xl font-bold text-white mb-4">Drop Chart Data</h2>
                          <p className="text-slate-400 mb-8 leading-relaxed">
                             AI will analyze the uploaded image for high-probability setups using ICT concepts (Order Blocks, FVG) and calculate position sizing.
                          </p>
                          <span className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white group-hover:bg-primary-600 group-hover:border-primary-500 transition-colors">
                             BROWSE LOCAL FILES
                          </span>
                       </>
                    )}

                    {errorMsg && (
                       <div className="mt-8 bg-danger/10 border border-danger/20 text-danger px-6 py-3 rounded-lg flex items-center gap-3 font-bold text-xs animate-in slide-in-from-bottom-2">
                          <AlertTriangle size={16}/> {errorMsg}
                       </div>
                    )}
                 </div>
              </div>
           )}

           {/* RESULT TICKET */}
           {lastSignal && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-5xl mx-auto">
                 
                 {/* Action Bar */}
                 <div className="flex justify-between items-center mb-6">
                     <button 
                        onClick={() => setLastSignal(null)}
                        className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition"
                     >
                        <RefreshCw size={14}/> Reset Terminal
                     </button>
                     <button 
                       onClick={handleCopyShare}
                       className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition border border-slate-700 hover:border-slate-500"
                     >
                        {isCopied ? <Check size={14} className="text-success"/> : <Copy size={14}/>}
                        {isCopied ? 'Copied to Clipboard' : 'Copy Intel'}
                     </button>
                 </div>

                 {/* The Ticket */}
                 <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Decorative Top */}
                    <div className="h-2 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600"></div>
                    
                    <div className="p-8 md:p-10">
                       {/* Header Section */}
                       <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-800 pb-8 mb-8">
                          <div>
                             <div className="flex items-baseline gap-4 mb-2">
                                <h2 className="text-5xl font-mono font-bold text-white tracking-tighter">{lastSignal.pair}</h2>
                                <span className={`px-3 py-1 rounded-md text-sm font-black uppercase tracking-widest ${lastSignal.direction === 'BUY' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
                                   {lastSignal.direction}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-400 font-mono">{lastSignal.timeframe} Chart</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="text-primary-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                   <BrainCircuit size={14} /> {lastSignal.strategy}
                                </span>
                             </div>
                          </div>
                          
                          <div className="text-right bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Recommended Position</p>
                              <div className="flex items-baseline justify-end gap-2">
                                 <span className="text-4xl font-mono text-white font-bold">{lastSignal.lotSize}</span>
                                 <span className="text-sm text-slate-500 font-bold">LOTS</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">Risk: ${lastSignal.riskAmount} ({user.settings.riskPercentage}%)</p>
                          </div>
                       </div>

                       {/* Data Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                           
                           {/* ENTRY */}
                           <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                              <div className="flex items-center gap-2 mb-3">
                                 <div className="w-2 h-2 rounded-full bg-white"></div>
                                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Entry Zone</p>
                              </div>
                              <p className="text-3xl font-mono text-white font-bold">{lastSignal.entry}</p>
                           </div>

                           {/* STOP LOSS */}
                           <div className="p-5 rounded-xl bg-danger/5 border border-danger/20">
                              <div className="flex justify-between items-center mb-3">
                                 <div className="flex items-center gap-2">
                                    <Shield size={12} className="text-danger" />
                                    <p className="text-xs text-danger uppercase font-bold tracking-widest">Invalidation</p>
                                 </div>
                                 <span className="text-[10px] font-mono text-danger">-{lastSignal.slPips} pips</span>
                              </div>
                              <p className="text-3xl font-mono text-white font-bold">{lastSignal.sl}</p>
                           </div>

                           {/* TAKE PROFIT 2 (Locked for Free) */}
                           <div className={`p-5 rounded-xl border relative overflow-hidden ${isFree ? 'bg-slate-900 border-slate-700' : 'bg-success/5 border-success/20'}`}>
                              {isFree ? (
                                 <div className="absolute inset-0 backdrop-blur-sm bg-slate-950/60 z-10 flex flex-col items-center justify-center">
                                    <Lock size={20} className="text-slate-500 mb-2"/>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">PRO UNLOCK</span>
                                 </div>
                              ) : null}
                              <div className="flex justify-between items-center mb-3">
                                 <div className="flex items-center gap-2">
                                    <Target size={12} className={isFree ? 'text-slate-500' : 'text-success'} />
                                    <p className={`text-xs uppercase font-bold tracking-widest ${isFree ? 'text-slate-500' : 'text-success'}`}>Target 1:2</p>
                                 </div>
                                 <span className={`text-[10px] font-mono ${isFree ? 'text-slate-600' : 'text-success'}`}>+{lastSignal.tpPips * 2} pips</span>
                              </div>
                              <p className={`text-3xl font-mono font-bold ${isFree ? 'text-slate-600 blur-sm' : 'text-white'}`}>{lastSignal.tp2}</p>
                           </div>
                       </div>

                       {/* Reasoning & Intermediate TP */}
                       <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
                             <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                                <BrainCircuit size={14}/> Structural Analysis
                             </p>
                             <p className="text-slate-300 font-mono text-sm leading-relaxed border-l-2 border-primary-500 pl-4">
                                {lastSignal.reasoning}
                             </p>
                          </div>
                          
                          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 opacity-80">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Target 1:1 {isFree && '(MAX)'}</p>
                              <p className="text-2xl font-mono text-white font-bold mb-1">{lastSignal.tp1}</p>
                              <div className="flex items-center gap-2 text-[10px] text-warning bg-warning/10 w-fit px-2 py-1 rounded">
                                 <AlertTriangle size={10} /> Move SL to Entry
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
