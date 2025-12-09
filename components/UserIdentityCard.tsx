import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Copy, Check, QrCode, Crown, Fingerprint, Share2, Download, Link as LinkIcon, X, Camera, User } from 'lucide-react';

interface Props {
  user: UserProfile;
  isTeamMember?: boolean;
  theme?: string;
  showControls?: boolean;
  onThemeChange?: (theme: string) => void;
  onAvatarUpload?: (base64: string) => void;
}

const THEMES: Record<string, any> = {
  cyan: {
    bg: 'bg-slate-900',
    border: 'border-primary-500/30',
    accent: 'text-primary-400',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.3)]',
    sashColor: 'bg-primary-500',
    sashText: 'text-white',
    ringColor: 'border-primary-400',
    hex: '#6366f1'
  },
  emerald: {
    bg: 'bg-slate-900',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    glow: 'shadow-[0_0_40px_rgba(52,211,153,0.3)]',
    sashColor: 'bg-emerald-500',
    sashText: 'text-black',
    ringColor: 'border-emerald-400',
    hex: '#34d399'
  },
  violet: {
    bg: 'bg-slate-900',
    border: 'border-violet-500/30',
    accent: 'text-violet-400',
    glow: 'shadow-[0_0_40px_rgba(167,139,250,0.3)]',
    sashColor: 'bg-violet-500',
    sashText: 'text-black',
    ringColor: 'border-violet-400',
    hex: '#a78bfa'
  },
  rose: {
    bg: 'bg-slate-900',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    glow: 'shadow-[0_0_40px_rgba(251,113,133,0.3)]',
    sashColor: 'bg-rose-500',
    sashText: 'text-black',
    ringColor: 'border-rose-400',
    hex: '#fb7185'
  },
  amber: {
    bg: 'bg-slate-900',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]',
    sashColor: 'bg-amber-500',
    sashText: 'text-black',
    ringColor: 'border-amber-400',
    hex: '#fbbf24'
  },
  founder: {
    bg: 'bg-slate-950',
    border: 'border-yellow-500/50',
    accent: 'text-yellow-400',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]',
    sashColor: 'bg-yellow-500',
    sashText: 'text-black',
    ringColor: 'border-yellow-400',
    hex: '#eab308'
  },
  ceo: {
    bg: 'bg-slate-950',
    border: 'border-red-500/50',
    accent: 'text-red-400',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
    sashColor: 'bg-red-500',
    sashText: 'text-black',
    ringColor: 'border-red-400',
    hex: '#ef4444'
  }
};

const UserIdentityCard: React.FC<Props> = ({ user, isTeamMember, theme, showControls = false, onThemeChange, onAvatarUpload }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const activeThemeKey = isTeamMember 
    ? (user.settings.accountType === 'Pro' ? 'founder' : 'ceo') 
    : (theme || user.idTheme || 'cyan');
    
  const styles = THEMES[activeThemeKey] || THEMES['cyan'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateZ = ((x - centerX) / centerX) * 2;
    setRotation({ x: rotateX, y: rotateY, z: rotateZ });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setIsHovered(false);
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLinkToClipboard = () => {
    const shareUrl = `https://tradevision.pro/u/${user.username.replace(/\s+/g, '').toLowerCase()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
          alert("File too large. Please upload an image under 2MB.");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayName = user.username.toUpperCase();
  const displayId = user.id;

  return (
    <div className="flex flex-col items-center z-20">
      <div className="perspective-1000 py-10">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative w-[300px] h-[480px] rounded-[30px] transition-transform duration-100 ease-out transform-style-3d cursor-pointer select-none ${isHovered ? styles.glow : ''}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${isHovered ? 1.05 : 1})`,
          }}
        >
          {/* Card Body */}
          <div className={`absolute inset-0 rounded-[30px] ${styles.bg} ${styles.border} border-2 overflow-hidden flex flex-col items-center justify-between py-6 shadow-2xl transition-colors duration-500`}>
            
            {/* Animated Liquid/Texture Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-pattern">
               <Fingerprint className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] text-white opacity-5 rotate-[-20deg]" />
            </div>

            {/* Dynamic Glare Effect */}
            <div 
              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 20%, transparent 60%)`,
                mixBlendMode: 'overlay'
              }}
            />

            {/* SASH */}
            <div className="absolute top-[30px] right-[-35px] rotate-[45deg] z-20 shadow-lg">
               <div className={`${styles.sashColor} w-[150px] py-1 text-center shadow-lg transition-colors duration-500`}>
                  <span className={`${styles.sashText} text-[10px] font-black tracking-widest uppercase`}>
                    {isTeamMember ? 'OFFICIAL' : user.plan}
                  </span>
               </div>
            </div>

            {/* Top Branding */}
            <div className="text-center z-10 mt-2">
              <h2 className={`text-xl font-black tracking-tighter text-white drop-shadow-md`}>
                TRADE VISION
              </h2>
              <div className="h-[1px] w-12 bg-white/20 mx-auto mt-2"></div>
            </div>

            {/* Center Avatar & QR */}
            <div className="relative z-10 flex flex-col items-center gap-6 mt-4">
              {/* 3D Ring Avatar */}
              <div 
                className={`relative w-28 h-28 transform-style-3d ${showControls ? 'cursor-pointer group' : ''}`}
                onClick={() => showControls && fileInputRef.current?.click()}
                title={showControls ? "Click to upload avatar" : ""}
              >
                 <div className={`absolute inset-0 rounded-full border-4 ${styles.ringColor} shadow-[0_0_20px_inset] shadow-white/10 animate-pulse-fast transition-colors duration-500`}></div>
                 <div className="absolute inset-2 rounded-full overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    {user.avatarImage ? (
                      <img src={user.avatarImage} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      isTeamMember ? (
                         <Crown size={40} className={styles.accent} strokeWidth={1.5} />
                      ) : (
                         <Shield size={40} className={styles.accent} strokeWidth={1.5} />
                      )
                    )}
                 </div>
                 
                 {/* Upload Overlay */}
                 {showControls && (
                   <div className="absolute inset-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                     <Camera className="text-white" size={24} />
                   </div>
                 )}
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileChange}
                 />
              </div>

              {/* QR Code Zone */}
              <div className="flex flex-col items-center gap-1">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Scan to Verify</p>
                 <div className="bg-white p-2 rounded-lg shadow-lg relative overflow-hidden group">
                    <QrCode size={64} className="text-black relative z-10" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 z-20 animate-scan"></div>
                 </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="w-full px-6 z-10 mt-auto">
               <div className="mb-4 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                     {isTeamMember ? (user.settings.accountType === 'Pro' ? 'FOUNDER NAME' : 'CEO NAME') : 'OPERATIVE NAME'}
                  </p>
                  
                  <h3 className={`text-2xl font-black tracking-tight text-white drop-shadow-sm`}>
                     {displayName}
                  </h3>

                  <div 
                     onClick={copyToClipboard}
                     className="flex items-center justify-center gap-2 mt-2 cursor-pointer opacity-60 hover:opacity-100 transition"
                  >
                     <code className="text-[10px] font-mono text-slate-300">
                        {displayId.length > 12 ? displayId.substring(0,8) + '...' + displayId.substring(displayId.length-4) : displayId}
                     </code>
                     {copied && !showShareModal ? <Check size={10} className="text-green-400"/> : <Copy size={10} className="text-white"/>}
                  </div>
               </div>
               
               {/* Bottom Pill */}
               <div className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 flex justify-between items-center backdrop-blur-md">
                  <span className="text-[10px] text-slate-400 font-bold">
                     {isTeamMember ? 'ROLE' : 'BALANCE'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${styles.accent} transition-colors duration-500`}>
                     {isTeamMember 
                        ? (user.settings.accountType === 'Pro' ? 'FOUNDER' : 'CEO') 
                        : `$${user.settings.accountSize.toLocaleString()}`}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      {showControls && !isTeamMember && (
        <div className="flex flex-col items-center gap-4 mt-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex gap-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-full border border-white/10">
            {(['cyan', 'emerald', 'violet', 'rose', 'amber'] as const).map((color) => (
              <button
                key={color}
                onClick={() => onThemeChange?.(color)}
                className={`w-6 h-6 rounded-full transition-all duration-300 ${activeThemeKey === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: THEMES[color].hex }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>

          <div className="flex gap-4">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-all duration-300"
             >
                <Camera size={16} />
                <span>CHANGE AVATAR</span>
             </button>

             <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-all duration-300 group"
             >
                <Share2 size={16} className="group-hover:text-primary-500 transition-colors" />
                <span>SHARE ID</span>
             </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
           <div 
             className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200"
             onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => setShowShareModal(false)} 
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                 <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Share2 size={20} className="text-primary-500" /> Share Access Card
              </h3>
              <p className="text-slate-400 text-xs mb-6">Distribute your operative identity to the network.</p>

              {/* Link Section */}
              <div className="bg-slate-950 rounded-lg p-3 mb-4 border border-white/5 group-hover:border-primary-500/30 transition-colors">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-primary-500 flex items-center gap-1">
                       <LinkIcon size={10} /> Public Uplink
                    </span>
                    {copied ? <span className="text-[10px] text-green-400 font-bold animate-pulse">COPIED</span> : null}
                 </div>
                 <div className="flex gap-2">
                    <code className="bg-slate-900 text-slate-300 text-xs p-2 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono border border-white/5">
                       {`https://tradevision.pro/u/${user.username.replace(/\s+/g, '').toLowerCase()}`}
                    </code>
                    <button 
                       onClick={copyLinkToClipboard}
                       className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded transition-colors"
                       title="Copy Link"
                    >
                       {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                 </div>
              </div>

              {/* Download Section */}
              <button 
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 py-3 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all group"
                onClick={() => alert("Snapshot downloaded (Simulation)")}
              >
                 <Download size={16} className="text-slate-500 group-hover:text-primary-500 transition-colors" />
                 Download Holographic Snapshot
              </button>

           </div>
        </div>
      )}
    </div>
  );
};

export default UserIdentityCard;