import React from 'react';
import { DeviceSettings } from '../types';
import { 
  Flashlight, 
  Volume2, 
  VolumeX, 
  Sun, 
  BatteryCharging, 
  BellOff, 
  X, 
  Smartphone,
  Sliders
} from 'lucide-react';

interface DeviceControlsModalProps {
  settings: DeviceSettings;
  onUpdate: (updater: (prev: DeviceSettings) => DeviceSettings) => void;
  onClose: () => void;
}

export const DeviceControlsModal: React.FC<DeviceControlsModalProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">Chandan's Device Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Quick Toggle Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Flashlight */}
          <button
            onClick={() => onUpdate((s) => ({ ...s, flashlight: !s.flashlight }))}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
              settings.flashlight
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <Flashlight className={`w-5 h-5 ${settings.flashlight ? 'text-amber-300' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Flashlight</div>
              <div className="text-[10px] text-slate-400">{settings.flashlight ? 'Active (ON)' : 'OFF'}</div>
            </div>
          </button>

          {/* Silent Mode */}
          <button
            onClick={() => onUpdate((s) => ({ ...s, silentMode: !s.silentMode }))}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
              settings.silentMode
                ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-lg shadow-rose-500/10'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            {settings.silentMode ? (
              <VolumeX className="w-5 h-5 text-rose-300" />
            ) : (
              <Volume2 className="w-5 h-5 text-slate-400" />
            )}
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Silent Mode</div>
              <div className="text-[10px] text-slate-400">{settings.silentMode ? 'Muted' : 'Sound ON'}</div>
            </div>
          </button>

          {/* Battery Saver */}
          <button
            onClick={() => onUpdate((s) => ({ ...s, batterySaver: !s.batterySaver }))}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
              settings.batterySaver
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <BatteryCharging className={`w-5 h-5 ${settings.batterySaver ? 'text-emerald-300' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Battery Saver</div>
              <div className="text-[10px] text-slate-400">{settings.batterySaver ? 'Optimized' : 'Normal'}</div>
            </div>
          </button>

          {/* Do Not Disturb */}
          <button
            onClick={() => onUpdate((s) => ({ ...s, doNotDisturb: !s.doNotDisturb }))}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
              settings.doNotDisturb
                ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <BellOff className={`w-5 h-5 ${settings.doNotDisturb ? 'text-purple-300' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Do Not Disturb</div>
              <div className="text-[10px] text-slate-400">{settings.doNotDisturb ? 'DND Active' : 'Off'}</div>
            </div>
          </button>
        </div>

        {/* Sliders for Brightness & Volume */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Screen Brightness
              </span>
              <span className="font-mono text-[11px] text-amber-300">{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.brightness}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdate((s) => ({ ...s, brightness: val }));
              }}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Assistant Voice Volume
              </span>
              <span className="font-mono text-[11px] text-purple-300">{settings.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdate((s) => ({ ...s, volume: val }));
              }}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Note */}
        <div className="text-[11px] text-slate-400 text-center bg-slate-950/40 p-2 rounded-xl">
          💡 You can also ask Maya directly in audio mode: <br />
          <span className="text-purple-300 italic">"Turn on flashlight"</span> or <span className="text-purple-300 italic">"Mute my device"</span>
        </div>
      </div>
    </div>
  );
};
