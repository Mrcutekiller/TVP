import React, { useState } from 'react';
import { UserProfile, TradeLog } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Plus, Edit2, Trash2, X, Save, Filter } from 'lucide-react';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const TradingJourney: React.FC<Props> = ({ user, updateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TradeLog>>({
    pair: 'XAUUSD',
    type: 'BUY',
    entry: 0,
    exit: 0,
    status: 'BE',
    pnl: 0,
    strategy: ''
  });

  const history = user.tradeHistory || [];

  // Stats Calculation
  const totalTrades = history.length;
  const winCount = history.filter(t => t.status === 'WIN').length;
  const lossCount = history.filter(t => t.status === 'LOSS').length;
  const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0';
  const totalPnL = history.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  
  // Chart Data Preparation
  let runningTotal = 0;
  const chartData = [...history].reverse().map((t, i) => {
    runningTotal += (t.pnl || 0);
    return { name: i + 1, value: runningTotal, date: new Date(t.date).toLocaleDateString() };
  });

  const handleOpenModal = (trade?: TradeLog) => {
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
        status: 'BE',
        pnl: 0,
        strategy: '',
        date: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trade log?')) {
      const updatedHistory = history.filter(t => t.id !== id);
      updateUser({ tradeHistory: updatedHistory });
    }
  };

  const handleSave = () => {
    if (!formData.pair || !formData.entry) return;

    let finalPnl = formData.pnl || 0;
    
    const tradePayload: TradeLog = {
      id: editingTradeId || crypto.randomUUID(),
      date: formData.date || new Date().toISOString(),
      pair: formData.pair,
      type: formData.type as 'BUY' | 'SELL',
      entry: Number(formData.entry),
      exit: Number(formData.exit || 0),
      pnl: Number(finalPnl),
      status: formData.status as 'WIN' | 'LOSS' | 'BE',
      timeframe: formData.timeframe,
      reasoning: formData.reasoning,
      strategy: formData.strategy
    };

    let newHistory;
    if (editingTradeId) {
      newHistory = history.map(t => t.id === editingTradeId ? tradePayload : t);
    } else {
      newHistory = [tradePayload, ...history];
    }

    updateUser({ tradeHistory: newHistory });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. KEY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Net Profit', value: `$${totalPnL.toLocaleString()}`, color: totalPnL >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-primary-400' },
          { label: 'Total Trades', value: totalTrades, color: 'text-white' },
          { label: 'Profit Factor', value: lossCount > 0 ? (winCount / lossCount).toFixed(2) : '∞', color: 'text-yellow-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-slate-700 transition">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* 2. EQUITY CURVE */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500"/> Equity Curve
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}} 
                  itemStyle={{color: '#fff'}}
                  formatter={(value: number) => [`$${value}`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. TRADE DISTRIBUTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
           <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary-500"/> Distribution
           </h3>
           <div className="flex-1 flex flex-col justify-center gap-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                   <span className="text-green-400 font-bold">{winCount} Wins</span>
                   <span className="text-red-400 font-bold">{lossCount} Losses</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                   <div className="bg-green-500 h-full" style={{ width: `${totalTrades ? (winCount/totalTrades)*100 : 0}%` }} />
                   <div className="bg-red-500 h-full flex-1" />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-slate-400 text-sm">Best Trade</span>
                    <span className="text-green-400 font-mono font-bold">
                       +${Math.max(...history.map(t => t.pnl || 0), 0)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Avg P/L</span>
                    <span className="text-white font-mono font-bold">
                       ${totalTrades ? (totalPnL / totalTrades).toFixed(2) : '0.00'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-lg font-bold text-white">Trade Log</h3>
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleOpenModal()} 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-500 transition shadow-lg"
              >
                 <Plus size={16} /> Log Trade
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Pair</th>
                <th className="p-4 font-bold">Strategy</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold text-right">Entry</th>
                <th className="p-4 font-bold text-right">Exit</th>
                <th className="p-4 font-bold text-right">P/L</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {history.length === 0 ? (
                <tr>
                   <td colSpan={9} className="p-8 text-center text-slate-500 italic">No trades recorded yet. Start your journey.</td>
                </tr>
              ) : (
                history.map((trade) => (
                  <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-slate-300 font-mono text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{trade.pair}</td>
                    <td className="p-4 text-xs font-bold text-slate-400">{trade.strategy || '-'}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {trade.type}
                       </span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-300">{trade.entry}</td>
                    <td className="p-4 text-right font-mono text-slate-300">{trade.exit || '-'}</td>
                    <td className={`p-4 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                       {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                    </td>
                    <td className="p-4 text-center">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          trade.status === 'WIN' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                          trade.status === 'LOSS' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                          'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                       }`}>
                          {trade.status}
                       </span>
                    </td>
                    <td className="p-4">
                       <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(trade)} className="p-1.5 hover:bg-white/10 rounded text-primary-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDelete(trade.id)} className="p-1.5 hover:bg-white/10 rounded text-red-400"><Trash2 size={14}/></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     {editingTradeId ? <Edit2 size={20} className="text-primary-500"/> : <Plus size={20} className="text-primary-500"/>}
                     {editingTradeId ? 'Edit Trade Log' : 'Log New Trade'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-slate-500 hover:text-white" size={24}/></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Pair / Asset</label>
                        <input 
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none placeholder-slate-600"
                           value={formData.pair}
                           onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                           placeholder="e.g. XAUUSD"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Direction</label>
                        <select 
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                           value={formData.type}
                           onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                           <option value="BUY">BUY (Long)</option>
                           <option value="SELL">SELL (Short)</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Entry</label>
                        <input type="number" step="any"
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none placeholder-slate-600"
                           value={formData.entry}
                           onChange={e => setFormData({...formData, entry: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Exit</label>
                        <input type="number" step="any"
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none placeholder-slate-600"
                           value={formData.exit}
                           onChange={e => setFormData({...formData, exit: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">P/L ($)</label>
                        <input type="number" step="any"
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none placeholder-slate-600"
                           value={formData.pnl}
                           onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})}
                        />
                     </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Strategy Used</label>
                    <input 
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none placeholder-slate-600"
                       value={formData.strategy || ''}
                       onChange={e => setFormData({...formData, strategy: e.target.value})}
                       placeholder="e.g. Order Block"
                    />
                  </div>

                  <div>
                     <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Outcome</label>
                     <div className="flex gap-2">
                        {['WIN', 'LOSS', 'BE'].map(status => (
                           <button
                              key={status}
                              onClick={() => setFormData({...formData, status: status as any})}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                                 formData.status === status 
                                    ? status === 'WIN' ? 'bg-green-500 text-black border-green-500' 
                                    : status === 'LOSS' ? 'bg-red-500 text-black border-red-500'
                                    : 'bg-yellow-500 text-black border-yellow-500'
                                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-slate-800">
                  <button 
                     onClick={handleSave}
                     className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                     <Save size={18} /> SAVE RECORD
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default TradingJourney;