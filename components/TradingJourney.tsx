import React, { useState } from 'react';
import { UserProfile, TradeLog, PlanTier } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  TrendingUp, Target, Plus, Edit2, Trash2, X, Save, 
  FileText, Calendar, Tag, BrainCircuit, Hash, DollarSign, 
  Smile, Lock, MoreHorizontal, LayoutTemplate
} from 'lucide-react';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const TradingJourney: React.FC<Props> = ({ user, updateUser }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [confluenceInput, setConfluenceInput] = useState('');
  
  // Notion-style Form State
  const [formData, setFormData] = useState<Partial<TradeLog>>({
    pair: 'XAUUSD',
    type: 'BUY',
    entry: 0,
    exit: 0,
    status: 'BE',
    pnl: 0,
    strategy: '',
    confluence: [],
    emotions: 'Neutral',
    notes: '',
    rr: 0
  });

  const history = user.tradeHistory || [];
  const isPro = user.plan === PlanTier.PRO || user.plan === PlanTier.ADVANCED; // Unlock for Advanced+

  // Stats
  const totalTrades = history.length;
  const winCount = history.filter(t => t.status === 'WIN').length;
  const lossCount = history.filter(t => t.status === 'LOSS').length;
  const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0';
  const totalPnL = history.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  
  // Chart Data
  let runningTotal = 0;
  const chartData = [...history].reverse().map((t, i) => {
    runningTotal += (t.pnl || 0);
    return { name: i + 1, value: runningTotal, date: new Date(t.date).toLocaleDateString() };
  });

  // HANDLERS
  const handleOpenDrawer = (trade?: TradeLog) => {
    if (trade) {
      setEditingTradeId(trade.id);
      setFormData(trade);
    } else {
      setEditingTradeId(null);
      setFormData({
        pair: 'XAUUSD',
        type: 'BUY',
        entry: 0,
        exit: 0,
        status: 'PENDING',
        pnl: 0,
        strategy: '',
        date: new Date().toISOString(),
        confluence: [],
        emotions: 'Neutral',
        notes: ''
      });
    }
    setIsDrawerOpen(true);
  };

  const handleAddConfluence = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && confluenceInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        confluence: [...(prev.confluence || []), confluenceInput.trim()]
      }));
      setConfluenceInput('');
    }
  };

  const handleRemoveConfluence = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      confluence: prev.confluence?.filter((_, i) => i !== idx)
    }));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this journal entry?')) {
      const updatedHistory = history.filter(t => t.id !== id);
      updateUser({ tradeHistory: updatedHistory });
    }
  };

  const handleSave = () => {
    if (!formData.pair || !formData.entry) return;

    // Calculate simulated RR if exit provided
    let calculatedRR = formData.rr || 0;
    if (formData.entry && formData.exit && formData.sl) {
        const risk = Math.abs(formData.entry - formData.sl);
        const reward = Math.abs(formData.exit - formData.entry);
        calculatedRR = parseFloat((reward / risk).toFixed(2));
    }

    const tradePayload: TradeLog = {
      id: editingTradeId || crypto.randomUUID(),
      date: formData.date || new Date().toISOString(),
      pair: formData.pair,
      type: formData.type as 'BUY' | 'SELL',
      entry: Number(formData.entry),
      exit: Number(formData.exit || 0),
      pnl: Number(formData.pnl || 0),
      status: formData.status as 'WIN' | 'LOSS' | 'BE' | 'PENDING',
      timeframe: formData.timeframe,
      reasoning: formData.reasoning,
      strategy: formData.strategy,
      confluence: formData.confluence,
      emotions: formData.emotions,
      notes: formData.notes,
      rr: calculatedRR
    };

    let newHistory;
    if (editingTradeId) {
      newHistory = history.map(t => t.id === editingTradeId ? tradePayload : t);
    } else {
      newHistory = [tradePayload, ...history];
    }

    updateUser({ tradeHistory: newHistory });
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
           <p className="text-slate-500 text-[10px] uppercase font-bold mb-2">Net P&L</p>
           <p className={`text-2xl font-black ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>${totalPnL.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
           <p className="text-slate-500 text-xs font-bold mb-2">Win Rate</p>
           <p className="text-2xl font-black text-white">{winRate}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
           <p className="text-slate-500 text-xs font-bold mb-2">Trades Logged</p>
           <p className="text-2xl font-black text-white">{totalTrades}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
           <p className="text-slate-500 text-xs font-bold mb-2">Profit Factor</p>
           <p className="text-2xl font-black text-yellow-400">{lossCount > 0 ? (winCount / lossCount).toFixed(2) : '∞'}</p>
        </div>
      </div>

      {/* 2. MAIN JOURNAL TABLE (Visible to All) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg min-h-[500px]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LayoutTemplate size={20} className="text-primary-500"/> Trade Database
           </h3>
           
           {/* ADD BUTTON (Locked for Free) */}
           <div className="relative">
              <button 
                onClick={() => isPro ? handleOpenDrawer() : null} 
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                    isPro 
                    ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                 <Plus size={16} /> New Entry
                 {!isPro && <Lock size={12} />}
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase tracking-wider">
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Asset</th>
                <th className="p-4 font-normal">Direction</th>
                <th className="p-4 font-normal">Strategy</th>
                <th className="p-4 font-normal">Result</th>
                <th className="p-4 font-normal text-right">P&L</th>
                <th className="p-4 font-normal text-center">Journal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No trades recorded.</td></tr>
              ) : (
                history.map((trade) => (
                  <tr 
                    key={trade.id} 
                    onClick={() => handleOpenDrawer(trade)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 text-slate-400 font-mono text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                       {trade.pair}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {trade.type}
                       </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                        {trade.strategy ? (
                            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-300">
                                {trade.strategy}
                            </span>
                        ) : '-'}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          trade.status === 'WIN' ? 'border-success/30 text-success bg-success/10' :
                          trade.status === 'LOSS' ? 'border-danger/30 text-danger bg-danger/10' :
                          'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                       }`}>
                          {trade.status}
                       </span>
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-success' : trade.pnl < 0 ? 'text-danger' : 'text-slate-400'}`}>
                       {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                    </td>
                    <td className="p-4 text-center text-slate-500">
                       <div className="flex justify-center items-center gap-2">
                         {trade.notes ? <FileText size={14} className="text-primary-400" /> : <MoreHorizontal size={14} />}
                         <button 
                            onClick={(e) => handleDelete(trade.id, e)}
                            className="p-1.5 hover:bg-white/10 rounded text-slate-600 hover:text-danger opacity-0 group-hover:opacity-100 transition"
                         >
                            <Trash2 size={12}/>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. NOTION-STYLE SLIDE-OVER DRAWER */}
      {isDrawerOpen && (
         <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Drawer */}
            <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300">
               
               {/* LOCK OVERLAY FOR FREE USERS */}
               {!isPro && (
                   <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
                            <Lock size={40} className="text-primary-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">LOCKED JOURNAL</h2>
                        <p className="text-slate-400 max-w-sm mb-8">
                            Detailed trade journaling, psychology tracking, and confluence notes are reserved for Sniper Pro operatives.
                        </p>
                        <button 
                            onClick={() => setIsDrawerOpen(false)}
                            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition"
                        >
                            Close Preview
                        </button>
                        <button 
                             onClick={() => window.open('https://t.me/Prodbynatyy', '_blank')}
                             className="mt-4 text-sm text-slate-500 hover:text-white underline"
                        >
                            Upgrade to Pro
                        </button>
                   </div>
               )}

               {/* HEADER IMAGE */}
               <div className="h-40 bg-gradient-to-r from-primary-900 to-slate-900 relative group">
                  <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/50 text-white p-2 rounded-lg transition">
                     <X size={20} />
                  </button>
                  <div className="absolute -bottom-8 left-10">
                     <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-xl">
                        {formData.type === 'BUY' ? '🟢' : '🔴'}
                     </div>
                  </div>
               </div>

               {/* CONTENT */}
               <div className="px-10 pt-12 pb-20">
                  
                  {/* TITLE */}
                  <div className="mb-8">
                     <input 
                       className="bg-transparent text-4xl font-black text-white w-full outline-none placeholder-slate-700"
                       value={formData.pair}
                       onChange={(e) => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                       placeholder="Pair Name"
                     />
                  </div>

                  {/* PROPERTIES GRID (Notion Style) */}
                  <div className="space-y-4 mb-10 text-sm">
                     
                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <Calendar size={14}/> Date
                        </div>
                        <div className="text-slate-300">
                            {new Date(formData.date || '').toLocaleString()}
                        </div>
                     </div>

                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <Target size={14}/> Direction
                        </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={() => setFormData({...formData, type: 'BUY'})}
                              className={`px-2 py-0.5 rounded text-xs font-bold border ${formData.type === 'BUY' ? 'bg-success/20 text-success border-success/30' : 'border-transparent text-slate-600'}`}
                           >
                              BUY
                           </button>
                           <button 
                              onClick={() => setFormData({...formData, type: 'SELL'})}
                              className={`px-2 py-0.5 rounded text-xs font-bold border ${formData.type === 'SELL' ? 'bg-danger/20 text-danger border-danger/30' : 'border-transparent text-slate-600'}`}
                           >
                              SELL
                           </button>
                        </div>
                     </div>

                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <BrainCircuit size={14}/> Strategy
                        </div>
                        <input 
                           className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm outline-none focus:border-primary-500 w-48"
                           value={formData.strategy || ''}
                           onChange={e => setFormData({...formData, strategy: e.target.value})}
                           placeholder="Strategy Name"
                        />
                     </div>

                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <Hash size={14}/> Status
                        </div>
                        <select 
                           className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm outline-none focus:border-primary-500"
                           value={formData.status}
                           onChange={e => setFormData({...formData, status: e.target.value as any})}
                        >
                           <option value="PENDING">Pending</option>
                           <option value="WIN">Win</option>
                           <option value="LOSS">Loss</option>
                           <option value="BE">Break Even</option>
                        </select>
                     </div>

                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <DollarSign size={14}/> P&L
                        </div>
                        <input 
                           type="number"
                           className={`bg-transparent border-b border-slate-800 focus:border-primary-500 w-24 text-sm font-mono outline-none ${Number(formData.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}
                           value={formData.pnl}
                           onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})}
                        />
                     </div>

                     <div className="flex items-center">
                        <div className="w-32 flex items-center gap-2 text-slate-500">
                           <Smile size={14}/> Psychology
                        </div>
                        <select 
                           className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm outline-none focus:border-primary-500"
                           value={formData.emotions || 'Neutral'}
                           onChange={e => setFormData({...formData, emotions: e.target.value})}
                        >
                           <option value="Neutral">Neutral 😐</option>
                           <option value="Confident">Confident 🦁</option>
                           <option value="Anxious">Anxious 😰</option>
                           <option value="FOMO">FOMO 🏃</option>
                           <option value="Greedy">Greedy 🤑</option>
                           <option value="Revenge">Revenge 😡</option>
                        </select>
                     </div>

                     <div className="flex items-start pt-2">
                        <div className="w-32 flex items-center gap-2 text-slate-500 mt-1">
                           <Tag size={14}/> Confluence
                        </div>
                        <div className="flex-1">
                           <div className="flex flex-wrap gap-2 mb-2">
                              {formData.confluence?.map((tag, i) => (
                                 <span key={i} className="bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => handleRemoveConfluence(i)} className="hover:text-white"><X size={10}/></button>
                                 </span>
                              ))}
                           </div>
                           <input 
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs outline-none focus:border-primary-500 w-full placeholder-slate-600"
                              placeholder="Add confluence tag + Enter (e.g. 'BOS', 'H4 Support')"
                              value={confluenceInput}
                              onChange={e => setConfluenceInput(e.target.value)}
                              onKeyDown={handleAddConfluence}
                           />
                        </div>
                     </div>
                  </div>
                  
                  <div className="h-px w-full bg-slate-800 mb-8"></div>

                  {/* RICH TEXT AREA */}
                  <div>
                     <h4 className="text-xl font-bold text-white mb-4">Trade Notes</h4>
                     <textarea 
                        className="w-full h-64 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-slate-300 leading-relaxed focus:border-primary-500 outline-none resize-none font-serif text-lg"
                        placeholder="Write your detailed analysis, execution thoughts, and review here..."
                        value={formData.notes || ''}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                     ></textarea>
                  </div>

                  {/* ACTION BAR */}
                  <div className="sticky bottom-0 bg-slate-950 pt-6 pb-2 border-t border-slate-800 mt-8 flex justify-end gap-4">
                     <button 
                        onClick={() => setIsDrawerOpen(false)}
                        className="px-6 py-3 rounded-lg text-slate-400 hover:text-white font-bold"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                     >
                        <Save size={18} /> Save Entry
                     </button>
                  </div>

               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default TradingJourney;