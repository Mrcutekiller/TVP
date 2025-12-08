
import React, { useState, useEffect } from 'react';
import { UserProfile, PlanTier, TradeLog } from '../types';
import Sidebar from '../components/Sidebar';
import { 
  Activity, ShieldAlert, BarChart2, TrendingUp, Zap, Clock, ArrowUpRight, 
  Share2, X, Copy, Check, BrainCircuit, Target, Shield, AlertTriangle,
  Gauge, Newspaper, Lock, LayoutDashboard, Wallet, Trophy, CreditCard
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const Dashboard: React.FC<Props> = ({ user, updateUser }) => {
  const navigate = useNavigate();

  // --- Real-time Chart Logic ---
  const [chartData, setChartData] = useState<{time: number, price: number}[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      time: i,
      price: 2024 + Math.sin(i * 0.2) * 5 + Math.random() * 2
    }));
  });

  // --- Market Intel State ---
  const [sentiment, setSentiment] = useState<'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL'>('NEUTRAL');
  const [sentimentValue, setSentimentValue] = useState(50); // 0-100
  const [newsFeed, setNewsFeed] = useState<{time: string, title: string, impact: 'HIGH' | 'MED' | 'LOW'}[]>([
    { time: '08:00', title: 'London Session Open', impact: 'LOW' },
    { time: '07:45', title: 'EURUSD Technical Breakout', impact: 'MED' },
    { time: '06:30', title: 'Goldman Sachs Outlook Updated', impact: 'HIGH' }
  ]);

  // Simulation Effects
  useEffect(() => {
    // 1. Chart Simulation (Advanced+)
    if (user.plan !== PlanTier.FREE && user.plan !== PlanTier.BASIC) {
        const intervalId = setInterval(() => {
        setChartData(prevData => {
            const lastPoint = prevData[prevData.length - 1];
            const volatility = Math.random() > 0.95 ? 2.5 : 0.3;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const movement = Math.random() * volatility * direction;
            const trend = Math.sin(Date.now() / 10000) * 0.1;
            const newPrice = Number((lastPoint.price + movement + trend).toFixed(2));
            const newPoint = { time: lastPoint.time + 1, price: newPrice };
            return [...prevData.slice(1), newPoint];
        });
        }, 600);
        return () => clearInterval(intervalId);
    }
  }, [user.plan]);

  useEffect(() => {
    // 2. Market Intel Simulation
    const intelInterval = setInterval(() => {
        const val = Math.random() * 100;
        setSentimentValue(val);
        if (val > 80) setSentiment('STRONG BUY');
        else if (val > 60) setSentiment('BUY');
        else if (val < 20) setSentiment('STRONG SELL');
        else if (val < 40) setSentiment('SELL');
        else setSentiment('NEUTRAL');

        if (Math.random() > 0.7) {
            const headlines = [
                { t: "Fed Chair Powell Hints at Rate Cuts", i: 'HIGH' },
                { t: "Bitcoin ETF Inflows Hit Record High", i: 'HIGH' },
                { t: "Goldman Sachs Adjusts XAUUSD Targets", i: 'MED' },
                { t: "ECB Interest Rate Decision Pending", i: 'HIGH' },
                { t: "Oil Prices Dip on Supply Concerns", i: 'MED' },
                { t: "Asian Markets Open Mixed", i: 'LOW' },
                { t: "JP Morgan: Recession Fears Overblown", i: 'MED' },
                { t: "Crypto Market Cap Reclaims $2T", i: 'HIGH' },
            ];
            const randomNews = headlines[Math.floor(Math.random() * headlines.length)];
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            setNewsFeed(prev => [{
                time: timeStr,
                title: randomNews.t,
                impact: randomNews.i as any
            }, ...prev.slice(0, 4)]);
        }
    }, 4000);

    return () => clearInterval(intelInterval);
  }, []);

  // --- Share Logic ---
  const [selectedSignal, setSelectedSignal] = useState<TradeLog | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopySignal = () => {
    if (!selectedSignal) return;
    const isBuy = selectedSignal.type === 'BUY';
    const dateStr = new Date(selectedSignal.date).toLocaleString();
    const text = `🚨 TRADE VISION INTEL 🚨\n\n📅 ${dateStr}\n💎 ${selectedSignal.pair}\n⏳ ${selectedSignal.timeframe || 'H1'}\n🧠 Strategy: ${selectedSignal.strategy || 'AI Structure Analysis'}\n\n${isBuy ? '🟢 BUY' : '🔴 SELL'} @ ${selectedSignal.entry}\n\n🛡️ SL: ${selectedSignal.sl || 'N/A'}\n🎯 TP1 (1:1): ${selectedSignal.tp1 || 'N/A'}\n🎯 TP2 (1:2): ${selectedSignal.tp2 || 'N/A'}\n\n🧠 Logic: ${selectedSignal.reasoning || 'AI Structure Detection'}\n\n🚀 Sent via Trade Vision Pro`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isPro = user.plan === PlanTier.PRO;
  
  // Stats Calculation
  const totalTrades = user.tradeHistory?.length || 0;
  const wins = user.tradeHistory?.filter(t => t.status === 'WIN').length || 0;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans bg-grid-pattern selection:bg-primary-500/30">
      
      <Sidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* 1. HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <LayoutDashboard size={12} />
                <span>WORKSPACE / OVERVIEW</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user.username}</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">System Status</p>
                  <div className="flex items-center justify-end gap-2 text-success text-xs font-bold">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                     </span>
                     ONLINE
                  </div>
               </div>
               <button 
                  onClick={() => navigate('/analysis')}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 hover:translate-y-[-1px]"
               >
                  <Zap size={16} fill="currentColor" /> New Scan
               </button>
            </div>
          </div>

          {/* 2. KEY METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Equity Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-primary-400 transition-colors">
                      <Wallet size={20} />
                   </div>
                   <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">+2.4%</span>
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Equity</p>
                   <h3 className="text-2xl font-mono font-bold text-white">${user.settings.accountSize.toLocaleString()}</h3>
                </div>
             </div>

             {/* Win Rate Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-accent-400 transition-colors">
                      <Trophy size={20} />
                   </div>
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Win Rate</p>
                   <h3 className="text-2xl font-mono font-bold text-white">{winRate}%</h3>
                </div>
             </div>

             {/* Usage Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-warning transition-colors">
                      <Activity size={20} />
                   </div>
                   <span className="text-xs font-bold text-slate-400">{user.signalsUsedToday} / {user.plan === PlanTier.FREE ? 5 : '∞'}</span>
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Daily Scans</p>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div 
                         className={`h-full rounded-full transition-all duration-1000 ${user.signalsUsedToday >= 5 && user.plan === PlanTier.FREE ? 'bg-danger' : 'bg-warning'}`} 
                         style={{ width: user.plan === PlanTier.FREE ? `${(user.signalsUsedToday/5)*100}%` : '100%' }}
                      ></div>
                   </div>
                </div>
             </div>

             {/* Plan Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                      <CreditCard size={20} />
                   </div>
                   <button className="text-[10px] text-primary-400 font-bold hover:underline">UPGRADE</button>
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Current Plan</p>
                   <h3 className={`text-xl font-black uppercase ${user.plan === PlanTier.PRO ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500' : 'text-white'}`}>
                      {user.plan} TIER
                   </h3>
                </div>
             </div>
          </div>

          {/* 3. MAIN DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* LEFT: CHART (8 Cols) */}
             <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-slate-800 h-[500px] flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <BarChart2 className="text-slate-400" size={16} />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-white">XAUUSD Live Feed</h3>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-slate-500 font-mono">H1 TIME FRAME</span>
                               {(user.plan === PlanTier.ADVANCED || user.plan === PlanTier.PRO) 
                                  ? <span className="text-[9px] text-success bg-success/10 px-1.5 rounded font-bold">SOCKET ACTIVE</span>
                                  : <span className="text-[9px] text-warning bg-warning/10 px-1.5 rounded font-bold">DELAYED</span>
                               }
                            </div>
                         </div>
                      </div>
                      <h2 className="text-2xl font-mono font-bold text-white tracking-tight">
                         $2,024.<span className="text-lg text-slate-400">80</span>
                      </h2>
                   </div>

                   <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                            <defs>
                               <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                            <XAxis hide />
                            <YAxis orientation="right" domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                               itemStyle={{ color: '#fff', fontFamily: 'JetBrains Mono' }}
                               labelStyle={{ display: 'none' }}
                               formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
                            />
                            <Area 
                               type="monotone" 
                               dataKey="price" 
                               stroke="#6366f1" 
                               strokeWidth={2} 
                               fill="url(#chartGradient)" 
                               isAnimationActive={false}
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                      
                      {/* Overlay for Free Users */}
                      {(user.plan === PlanTier.FREE || user.plan === PlanTier.BASIC) && (
                         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg">
                            <div className="text-center p-6 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xs">
                               <ShieldAlert className="mx-auto text-primary-500 mb-3" size={32} />
                               <h3 className="font-bold text-white mb-1">Real-Time Data Locked</h3>
                               <p className="text-xs text-slate-400 mb-4 leading-relaxed">Upgrade to Sniper Advanced to unlock low-latency WebSocket feeds.</p>
                               <button className="text-xs bg-white text-black px-4 py-2 rounded font-bold hover:bg-slate-200 transition">
                                  Unlock Pro Features
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* RIGHT: SIDEBAR WIDGETS (4 Cols) */}
             <div className="lg:col-span-4 space-y-6">
                
                {/* Sentiment Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <Gauge size={16} className="text-accent-500" /> Market Sentiment
                      </h3>
                   </div>
                   <div className="relative mb-2">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                         <span>BEARISH</span>
                         <span>NEUTRAL</span>
                         <span>BULLISH</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                         <div className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${sentimentValue}%`, transition: 'left 0.5s' }}></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-gray-500 to-green-500 opacity-30"></div>
                      </div>
                   </div>
                   <div className="text-center">
                      <span className={`text-lg font-black font-mono ${
                         sentiment.includes('BUY') ? 'text-success' : sentiment.includes('SELL') ? 'text-danger' : 'text-slate-300'
                      }`}>{sentiment}</span>
                   </div>

                   {/* Lock Overlay */}
                   {!isPro && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-white/5 rounded-xl">
                         <Lock size={20} className="text-slate-500 mb-2" />
                         <span className="text-[10px] font-bold text-slate-400">PRO FEATURE</span>
                      </div>
                   )}
                </div>

                {/* News Feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[300px] flex flex-col relative">
                   <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <Newspaper size={16} className="text-slate-400" /> Live News
                      </h3>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                      {newsFeed.map((news, i) => (
                         <div key={i} className="border-l-2 border-slate-700 pl-3">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-mono text-slate-500">{news.time}</span>
                               <span className={`text-[9px] font-bold px-1.5 rounded ${
                                  news.impact === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                                  news.impact === 'MED' ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-slate-700 text-slate-400'
                               }`}>{news.impact}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium leading-snug">{news.title}</p>
                         </div>
                      ))}
                   </div>
                   {!isPro && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                         <Lock size={20} className="text-slate-500 mb-2" />
                         <span className="text-[10px] font-bold text-slate-400">LOCKED</span>
                         <button className="mt-2 text-[9px] bg-primary-600 text-white px-2 py-1 rounded font-bold">Upgrade</button>
                      </div>
                   )}
                </div>

             </div>
          </div>

          {/* 4. RECENT SIGNALS (Full Width) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                   <Clock size={16} className="text-slate-400" /> Recent Activity Log
                </h3>
             </div>
             <div className="p-0">
                {user.tradeHistory && user.tradeHistory.length > 0 ? (
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                         <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-800">
                               <th className="p-4 font-normal">Time</th>
                               <th className="p-4 font-normal">Pair</th>
                               <th className="p-4 font-normal">Strategy</th>
                               <th className="p-4 font-normal">Type</th>
                               <th className="p-4 font-normal text-right">PnL</th>
                               <th className="p-4 font-normal text-center">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800">
                            {user.tradeHistory.slice(0, 5).map(trade => (
                               <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-4 font-mono text-slate-400 text-xs">{new Date(trade.date).toLocaleTimeString()}</td>
                                  <td className="p-4 font-bold text-white">{trade.pair}</td>
                                  <td className="p-4">
                                     <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 whitespace-nowrap">
                                       {trade.strategy || 'MANUAL/UNKNOWN'}
                                     </span>
                                  </td>
                                  <td className="p-4">
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded ${trade.type === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        {trade.type}
                                     </span>
                                  </td>
                                  <td className={`p-4 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                     {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                                  </td>
                                  <td className="p-4 text-center">
                                     <button 
                                        onClick={() => setSelectedSignal(trade)}
                                        className="text-xs flex items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors mx-auto px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
                                     >
                                        <Share2 size={12} /> Share
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                ) : (
                   <div className="text-center py-12">
                      <p className="text-sm text-slate-500 mb-2">No scans recorded in this session.</p>
                      <button onClick={() => navigate('/analysis')} className="text-sm text-primary-400 hover:underline">Start New Analysis</button>
                   </div>
                )}
             </div>
          </div>

        </div>

        {/* SHARE MODAL - THE "IDENTITY CARD" OF THE SIGNAL */}
        {selectedSignal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
                
                {/* Header Gradient */}
                <div className="h-2 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600"></div>
                
                <button 
                  onClick={() => setSelectedSignal(null)} 
                  className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
                >
                  <X size={20} />
                </button>

                <div className="p-8 relative">
                   {/* Background Pattern */}
                   <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                   <div className="text-center mb-6 relative z-10">
                      <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                        <Zap size={12} fill="currentColor"/> Trade Vision Intel
                      </p>
                      <h2 className="text-2xl font-black text-white tracking-tight">SIGNAL TICKET</h2>
                      <p className="text-xs text-slate-500 font-mono mt-2">{new Date(selectedSignal.date).toLocaleString()}</p>
                   </div>

                   {/* Ticket Body */}
                   <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 relative overflow-hidden mb-6 shadow-inner">
                      
                      {/* Cutout Effect */}
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-r border-slate-700"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-l border-slate-700"></div>

                      {/* PAIR & DIRECTION */}
                      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 border-dashed">
                         <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Asset</span>
                            <div className="text-2xl font-black text-white">{selectedSignal.pair}</div>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Action</span>
                            <div className={`text-xl font-black ${selectedSignal.type === 'BUY' ? 'text-success' : 'text-danger'}`}>
                               {selectedSignal.type}
                            </div>
                         </div>
                      </div>

                      {/* ENTRY & TF */}
                      <div className="grid grid-cols-2 gap-4 text-sm font-mono mb-6">
                         <div className="bg-white/5 p-2 rounded">
                            <span className="text-[10px] text-slate-500 block mb-1 uppercase">Entry Price</span>
                            <span className="text-white font-bold">{selectedSignal.entry}</span>
                         </div>
                         <div className="bg-white/5 p-2 rounded">
                            <span className="text-[10px] text-slate-500 block mb-1 uppercase">Timeframe</span>
                            <span className="text-white font-bold">{selectedSignal.timeframe || 'H1'}</span>
                         </div>
                      </div>

                      {/* STRATEGY DISPLAY (NEW) */}
                      <div className="mb-6 bg-primary-500/5 border border-primary-500/20 p-2 rounded text-center">
                         <span className="text-[10px] text-primary-400 uppercase font-bold tracking-widest block mb-1">Detected Strategy</span>
                         <span className="text-white font-bold text-sm">{selectedSignal.strategy || 'N/A'}</span>
                      </div>

                      {/* RISK MANAGEMENT SECTION */}
                      <div className="space-y-3 pt-2">
                         {/* Stop Loss */}
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                               <Shield size={12} className="text-danger"/> Stop Loss <span className="text-[9px] text-slate-600">(Invalidation)</span>
                            </span>
                            <span className="text-xs text-danger font-mono font-bold">{selectedSignal.sl || '---'}</span>
                         </div>
                         
                         {/* TP1 - 1:1 RR */}
                         <div className="flex justify-between items-center bg-success/5 p-1.5 rounded">
                            <span className="text-xs text-slate-300 flex items-center gap-1 font-bold">
                               <Target size={12} className="text-success"/> Target 1 <span className="text-[9px] text-success bg-success/10 px-1 rounded ml-1">1:1 RR</span>
                            </span>
                            <span className="text-xs text-success font-mono font-bold">{selectedSignal.tp1 || '---'}</span>
                         </div>
                         
                         {/* TP2 - 1:2 RR */}
                         <div className="flex justify-between items-center bg-success/10 p-1.5 rounded border border-success/20">
                            <span className="text-xs text-slate-300 flex items-center gap-1 font-bold">
                               <Target size={12} className="text-success"/> Target 2 <span className="text-[9px] text-success bg-success/10 px-1 rounded ml-1">1:2 RR</span>
                            </span>
                            <span className="text-xs text-success font-mono font-bold">{selectedSignal.tp2 || '---'}</span>
                         </div>
                      </div>

                      {selectedSignal.reasoning && (
                        <div className="mt-4 pt-4 border-t border-white/5 border-dashed">
                           <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-2">
                              <BrainCircuit size={10} /> AI Logic
                           </span>
                           <p className="text-[10px] text-slate-300 leading-relaxed italic opacity-80">
                              "{selectedSignal.reasoning.length > 80 ? selectedSignal.reasoning.substring(0,80) + '...' : selectedSignal.reasoning}"
                           </p>
                        </div>
                      )}
                      
                      {/* Barcode Mockup */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-center opacity-40">
                         <div className="h-8 w-2/3 bg-current" style={{maskImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px)', WebkitMaskImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px)'}}></div>
                      </div>
                   </div>

                   <button 
                      onClick={handleCopySignal}
                      className="w-full py-4 bg-white hover:bg-slate-200 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg"
                   >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      {isCopied ? 'COPIED TO CLIPBOARD' : 'COPY SIGNAL DATA'}
                   </button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
