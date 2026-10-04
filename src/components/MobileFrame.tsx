import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Moon, Sun, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  isDark?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  activeScreenTitle = 'Maya AI',
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-blue-600/25 rounded-full blur-[130px]" />
      </div>

      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[430px] h-[100dvh] md:h-[880px] bg-slate-900 md:rounded-[48px] shadow-2xl border-0 md:border-[10px] border-slate-800/80 flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        {/* Dynamic Island / Speaker Notch on mobile */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between z-30 select-none bg-slate-900/60 backdrop-blur-md border-b border-white/5">
          <span className="text-xs font-semibold tracking-tight text-white/90">
            {timeStr || '09:41'}
          </span>

          {/* Dynamic Island pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/80 rounded-full border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium tracking-wide text-purple-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Maya
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Mobile Home Bar */}
        <div className="py-2 flex items-center justify-center bg-slate-950/80 backdrop-blur-md border-t border-white/5 z-30">
          <div className="w-32 h-1 bg-white/30 rounded-full transition-all duration-300 hover:bg-white/60" />
        </div>
      </div>
    </div>
  );
};
