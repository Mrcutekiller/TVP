
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import { LayoutGrid, History, Settings, User as UserIcon, LogOut, ScanLine, Hexagon, Menu, X, BookOpen } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const Sidebar: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <button 
      onClick={() => {
        navigate(path);
        setIsOpen(false); // Close on mobile click
      }}
      className={`group relative flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 w-full ${
        isActive(path) 
          ? 'bg-primary-500/10 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {/* Active Indicator Line */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary-500 transition-all duration-300 ${isActive(path) ? 'opacity-100' : 'opacity-0'}`} />
      
      <Icon size={20} className={`transition-colors ${isActive(path) ? 'text-primary-400' : 'group-hover:text-primary-300'}`} />
      <span className="text-sm font-medium">{label}</span>
      
      {/* Glow Effect */}
      {isActive(path) && (
        <div className="absolute inset-0 bg-primary-500/5 rounded-xl blur-md -z-10" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl text-white shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50] animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen md:h-[95vh] md:top-4 md:ml-4 z-[55]
        w-[280px] md:w-[260px] flex flex-col
        bg-slate-950 md:bg-slate-950/80 backdrop-blur-xl md:backdrop-blur-md 
        border-r md:border border-white/5 md:rounded-3xl
        shadow-2xl md:shadow-none
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
          {/* Logo Area */}
          <div className="p-8 flex items-center gap-3 border-b border-white/5 mt-10 md:mt-0">
             <div className="relative">
                <Hexagon className="text-primary-500 fill-primary-500/20" size={32} strokeWidth={1.5} />
                <div className="absolute inset-0 blur-lg bg-primary-500/40 -z-10"></div>
             </div>
             <div>
                <h1 className="font-bold text-lg tracking-tight text-white leading-none">TRADE</h1>
                <span className="text-xs font-bold text-primary-400 tracking-[0.2em]">VISION</span>
             </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Workspace</p>
            <NavItem path="/dashboard" icon={LayoutGrid} label="Command Center" />
            <NavItem path="/analysis" icon={ScanLine} label="AI Analysis" />
            
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Performance</p>
            <NavItem path="/logs" icon={History} label="Trade Logs" />
            <NavItem path="/journey" icon={BookOpen} label="My Journey" />
            
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Profile</p>
            <NavItem path="/id" icon={UserIcon} label="Digital ID" />
            <NavItem path="/settings" icon={Settings} label="Settings" />
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-white/5 bg-slate-900/50 md:bg-transparent">
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-white/5 flex items-center gap-3 mb-3">
               <div className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-mono font-bold shadow-lg`}>
                  {user.username.charAt(0).toUpperCase()}
               </div>
               <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.username}</p>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                  </p>
               </div>
            </div>
            <button 
               onClick={() => { 
                  // CLEAR SESSION ONLY - KEEP DB ('tv_users')
                  localStorage.removeItem('tv_session'); 
                  // Clean up legacy key if it exists
                  localStorage.removeItem('sniper_user');
                  
                  // Redirect to Landing Page
                  window.location.href = '#/';
                  window.location.reload();
               }}
               className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition py-3 rounded-xl hover:bg-white/5 group"
            >
               <LogOut size={14} className="group-hover:text-danger" /> Disconnect
            </button>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;
