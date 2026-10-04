import React, { useState } from 'react';
import { TimerItem } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Timer as TimerIcon, 
  Bell, 
  Check, 
  Flame 
} from 'lucide-react';
import { sounds } from '../utils/audioUtils';

interface TimersViewProps {
  timers: TimerItem[];
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onDeleteTimer: (id: string) => void;
  onAddTimer: (label: string, seconds: number, isAlarm?: boolean, alarmTime?: string) => void;
}

export const TimersView: React.FC<TimersViewProps> = ({
  timers,
  onToggleTimer,
  onResetTimer,
  onDeleteTimer,
  onAddTimer,
}) => {
  const [label, setLabel] = useState('');
  const [minutes, setMinutes] = useState('5');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(minutes, 10) * 60;
    if (isNaN(duration) || duration <= 0) return;
    onAddTimer(label.trim() || 'Focus Session', duration);
    setLabel('');
    setIsAdding(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Timers & Alarms</span>
            <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full font-mono">
              {timers.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Audible chimes & smart tracking for Chandan</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md flex items-center gap-1 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Timer</span>
        </button>
      </div>

      {/* Quick preset chips */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Presets:</span>
        {[
          { name: '1 min', sec: 60 },
          { name: '5 min', sec: 300 },
          { name: '15 min', sec: 900 },
          { name: '25m Pomodoro', sec: 1500 },
        ].map((p) => (
          <button
            key={p.name}
            onClick={() => onAddTimer(p.name, p.sec)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 whitespace-nowrap active:scale-95 transition-all"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Add Custom Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 bg-slate-800/80 border-b border-pink-500/20 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs text-slate-300 font-medium">Timer Label</label>
              <input
                type="text"
                placeholder="e.g. Code sprint, Chai break"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium">Minutes</label>
              <input
                type="number"
                min="1"
                max="180"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 shadow-md"
            >
              Start Timer
            </button>
          </div>
        </form>
      )}

      {/* Timers list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {timers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <TimerIcon className="w-12 h-12 stroke-1 mb-2 text-pink-400/40" />
            <p className="text-sm font-medium text-slate-300">No active timers or alarms</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Say to Maya: <br />
              <span className="text-pink-300 italic">"Maya, set a 10 minute workout timer"</span> or <br />
              <span className="text-pink-300 italic">"Set an alarm for 7:30 AM"</span>
            </p>
          </div>
        ) : (
          timers.map((timer) => {
            const progress = timer.totalSeconds > 0
              ? Math.max(0, (timer.remainingSeconds / timer.totalSeconds) * 100)
              : 0;

            const isFinished = timer.remainingSeconds <= 0;

            return (
              <div
                key={timer.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isFinished
                    ? 'bg-rose-500/20 border-rose-500/50 animate-pulse'
                    : 'bg-slate-800/70 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {timer.isAlarm ? (
                      <Bell className="w-4 h-4 text-amber-400" />
                    ) : (
                      <TimerIcon className="w-4 h-4 text-pink-400" />
                    )}
                    <span className="text-sm font-semibold text-white">
                      {timer.label}
                    </span>
                  </div>

                  {timer.isAlarm && timer.alarmTime && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      {timer.alarmTime}
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteTimer(timer.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Big Time Display */}
                <div className="flex items-center justify-between">
                  <div className="font-mono text-3xl font-extrabold tracking-wider text-white">
                    {isFinished ? '00:00 - Done!' : formatSeconds(timer.remainingSeconds)}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isFinished && (
                      <button
                        onClick={() => onToggleTimer(timer.id)}
                        className={`p-2.5 rounded-xl text-white font-semibold transition-transform active:scale-95 ${
                          timer.isRunning
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                        title={timer.isRunning ? 'Pause' : 'Start'}
                      >
                        {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={() => onResetTimer(timer.id)}
                      className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-transform active:scale-95"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {!timer.isAlarm && (
                  <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
