
import React, { useState } from 'react';
import { UserProfile, PlanTier, JournalEntry } from '../types';
import Sidebar from '../components/Sidebar';
import { Lock, Plus, TrendingUp, Save, Trash2, Calendar, DollarSign, Percent, Briefcase } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const JournalPage: React.FC<Props> = ({ user, updateUser }) => {
  const isPro = user.plan === PlanTier.PRO || user.plan === PlanTier.ADVANCED;
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Stats Calculation
  const journalEntries = user.journalEntries || [];
  const startBalance = 1000; // Simulated start balance or from settings
  const currentBalance = journalEntries.length > 0 
    ? journalEntries[journalEntries.length - 1].accountBalanceAfter 
    : user.settings.accountSize;
  
  const totalPnL = journalEntries.reduce((acc, curr) => acc + curr.pnlAmount, 0);
  const growthPercent = ((currentBalance - startBalance) / startBalance) * 100;
  
  const wins = journalEntries.filter(j => j.result === 'WIN').length;
  const losses = journalEntries.filter(j => j.result === 'LOSS').length;
  const winRate = journalEntries.length > 0 ? ((wins / journalEntries.length) * 100).toFixed(1) : '0.0';

  // Form State
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    pair: 'XAUUSD',
    direction: 'BUY',
    setupType: '',
    lotSize: 0.1,
    result: 'WIN',
    pnlAmount: 0,
    notes: ''
  });

  const handleSave = () => {
    if (!formData.pair || !formData.pnlAmount) return;
    
    // Calculate new balance based on previous entry or current settings
    const prevBalance = journalEntries.length > 0 
        ? journalEntries[0].accountBalanceAfter 
        : user.settings.accountSize;
    
    const newBalance = prevBalance + (formData.pnlAmount || 0);
    const growth = ((newBalance - prevBalance) / prevBalance) * 100;

    const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        pair: formData.pair,
        direction: formData.direction as 'BUY' | 'SELL',
        setupType: formData.setupType || 'Manual',
        lotSize: formData.lotSize || 0,
        result: formData.result as 'WIN' | 'LOSS' | 'BE',
        pnlAmount: formData.pnlAmount || 0,
        accountBalanceAfter: newBalance,
        growthPercentage: parseFloat(growth.toFixed(2)),
        notes: formData.notes || ''
    };

    const updatedJournal = [newEntry, ...journalEntries];
    updateUser({ 
        journalEntries: updatedJournal,
        settings: { ...user.settings, accountSize: newBalance } // Sync balance
    });
    setIsFormOpen(false);
    setFormData({ pair: 'XAUUSD', direction: 'BUY', result: 'WIN', pnlAmount: 0 });
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete entry?')) {
        const updated = journalEntries.filter(j => j.id !== id);
        updateUser({ journalEntries: updated });
    }
  }

  // Chart Data preparation
  const chartData = [...journalEntries].reverse().map((entry, index) => ({
    name: index + 1,
    balance: entry.accountBalanceAfter,
    date: new Date(entry.date).toLocaleDateString()
  }));
  // Add start point if empty or just to show baseline
  if (chartData.length === 0) {
      chartData.push({ name: 0, balance: startBalance, date: 'Start' });
  } else {
      chartData.unshift({ name: 0, balance: startBalance, date: 'Start' });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
           
           <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
              <Briefcase className="text-primary-500" /> Pro Journal
           </h1>

           {/* PRO LOCK OVERLAY */}
           {!isPro && (
               <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                      <Lock size={48} className="text-primary-500" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4">JOURNAL LOCKED</h2>
                  <p className="text-slate-400 max-w-md text-center mb-8 text-lg">
                      Manual trade tracking, growth analytics, and performance charting are exclusive to Sniper Pro operatives.
                  </p>
                  <button 
                      onClick={() => window.open('https://t.me/Prodbynatyy', '_blank')}
                      className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
                  >
                      Upgrade Access Clearance
                  </button>
               </div>
           )}

           <div className={!isPro ? 'blur-md pointer-events-none select-none' : ''}>
              
              {/* TOP STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Current Balance</p>
                    <h3 className="text-3xl font-mono font-bold text-white">${currentBalance.toLocaleString()}</h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Growth</p>
                    <h3 className={`text-3xl font-mono font-bold ${growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {growthPercent > 0 ? '+' : ''}{growthPercent.toFixed(2)}%
                    </h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Win Rate</p>
                    <h3 className="text-3xl font-mono font-bold text-white">{winRate}%</h3>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Net P&L</p>
                    <h3 className={`text-3xl font-mono font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPnL > 0 ? '+' : ''}${totalPnL.toLocaleString()}
                    </h3>
                 </div>
              </div>

              {/* CHART & ACTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px]">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <TrendingUp size={18} className="text-primary-500"/> Equity Curve
                      </h3>
                      <ResponsiveContainer width="100%" height="85%">
                         <AreaChart data={chartData}>
                            <defs>
                               <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3"/>
                            <XAxis dataKey="name" hide />
                            <YAxis domain={['auto', 'auto']} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155'}} itemStyle={{color: '#fff'}} />
                            <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                         </AreaChart>
                      </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                          <Plus size={32} className="text-primary-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Log Manual Trade</h3>
                      <p className="text-slate-400 text-sm mb-8">Record your execution details, lot size, and outcome to track your performance metrics.</p>
                      <button 
                        onClick={() => setIsFormOpen(true)}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition shadow-lg shadow-primary-500/20"
                      >
                          Add New Entry
                      </button>
                  </div>
              </div>

              {/* JOURNAL TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="bg-slate-950 text-slate-500 uppercase text-xs font-bold tracking-wider">
                              <th className="p-4">Date</th>
                              <th className="p-4">Pair</th>
                              <th className="p-4">Setup</th>
                              <th className="p-4">Lot</th>
                              <th className="p-4">Result</th>
                              <th className="p-4 text-right">P&L</th>
                              <th className="p-4 text-right">Balance</th>
                              <th className="p-4 text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {journalEntries.map(entry => (
                              <tr key={entry.id} className="hover:bg-slate-800/50 transition">
                                  <td className="p-4 text-slate-400 font-mono text-xs">{new Date(entry.date).toLocaleDateString()}</td>
                                  <td className="p-4 font-bold text-white">
                                      {entry.pair} <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded ${entry.direction === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{entry.direction}</span>
                                  </td>
                                  <td className="p-4 text-slate-300">{entry.setupType}</td>
                                  <td className="p-4 font-mono text-slate-400">{entry.lotSize}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          entry.result === 'WIN' ? 'bg-green-500/10 text-green-400' : 
                                          entry.result === 'LOSS' ? 'bg-red-500/10 text-red-400' : 
                                          'bg-yellow-500/10 text-yellow-400'
                                      }`}>
                                          {entry.result}
                                      </span>
                                  </td>
                                  <td className={`p-4 text-right font-mono font-bold ${entry.pnlAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {entry.pnlAmount > 0 ? '+' : ''}{entry.pnlAmount}
                                  </td>
                                  <td className="p-4 text-right font-mono text-white">
                                      ${entry.accountBalanceAfter.toLocaleString()}
                                  </td>
                                  <td className="p-4 text-center">
                                      <button onClick={() => handleDelete(entry.id)} className="text-slate-600 hover:text-red-400 transition">
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {journalEntries.length === 0 && (
                      <div className="p-12 text-center text-slate-500 italic">No manual entries recorded yet.</div>
                  )}
              </div>

           </div>
        </div>

        {/* MANUAL ENTRY MODAL */}
        {isFormOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-in zoom-in-95">
                    <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                        <Trash2 size={20} className="hidden" /> X
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus size={24} className="text-primary-500" /> Log Trade
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Pair</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 outline-none" 
                                    value={formData.pair}
                                    onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Direction</label>
                                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                                    <button 
                                        onClick={() => setFormData({...formData, direction: 'BUY'})}
                                        className={`flex-1 rounded py-2 text-xs font-bold transition ${formData.direction === 'BUY' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                                    >BUY</button>
                                    <button 
                                        onClick={() => setFormData({...formData, direction: 'SELL'})}
                                        className={`flex-1 rounded py-2 text-xs font-bold transition ${formData.direction === 'SELL' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                                    >SELL</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Setup / Strategy</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 outline-none" 
                                    placeholder="e.g. Breakout"
                                    value={formData.setupType}
                                    onChange={e => setFormData({...formData, setupType: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Lot Size</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 outline-none" 
                                    value={formData.lotSize}
                                    onChange={e => setFormData({...formData, lotSize: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Result</label>
                            <div className="flex gap-2">
                                {['WIN', 'LOSS', 'BE'].map(r => (
                                    <button 
                                        key={r}
                                        onClick={() => setFormData({...formData, result: r as any})}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold border transition ${
                                            formData.result === r 
                                            ? 'border-primary-500 bg-primary-500/20 text-white' 
                                            : 'border-slate-700 bg-slate-950 text-slate-500 hover:border-slate-500'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Profit / Loss Amount ($)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-500" />
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-primary-500 outline-none font-mono text-lg" 
                                    value={formData.pnlAmount}
                                    onChange={e => setFormData({...formData, pnlAmount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div>
                             <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Notes</label>
                             <textarea 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 outline-none h-24 text-sm"
                                placeholder="Execution details..."
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                             ></textarea>
                        </div>
                        
                        <button 
                            onClick={handleSave}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> SAVE RECORD
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default JournalPage;
