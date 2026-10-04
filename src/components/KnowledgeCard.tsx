import React from 'react';
import { ToolAction } from '../types';
import { 
  CloudSun, 
  Search, 
  Clock, 
  Calculator, 
  Sliders, 
  Bookmark, 
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface KnowledgeCardProps {
  action: ToolAction;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ action }) => {
  const { tool, args } = action;

  if (tool === 'check_weather') {
    return (
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/80 to-blue-900/60 border border-sky-400/30 text-white shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-300" />
            <span className="font-semibold text-xs tracking-wide uppercase text-sky-200">
              Weather for {args.location || 'Current Location'}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
            Realtime
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="text-2xl font-bold font-mono text-white">24°C / 75°F</div>
            <div className="text-xs text-sky-200">Partly Sunny • Pleasant breeze</div>
          </div>
          <div className="text-right text-[11px] text-sky-300 space-y-0.5">
            <div>Humidity: 58%</div>
            <div>Wind: 11 km/h</div>
          </div>
        </div>
      </div>
    );
  }

  if (tool === 'search_information') {
    return (
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/70 to-slate-900/90 border border-purple-500/30 text-white shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <Search className="w-4 h-4 text-purple-400" />
            <span>Search & High Knowledge Query</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/20">
            {args.contextType || 'Knowledge'}
          </span>
        </div>

        <div className="text-xs text-slate-200 font-medium bg-black/30 p-2 rounded-xl border border-white/5">
          "{args.query}"
        </div>
      </div>
    );
  }

  if (tool === 'calculate_or_convert') {
    return (
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900/90 border border-emerald-500/30 text-white shadow-lg space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Quick Calculation Result</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300 font-mono">{args.expression}</span>
          <span className="text-lg font-bold text-emerald-300 font-mono">{args.result}</span>
        </div>
      </div>
    );
  }

  if (tool === 'set_reminder') {
    return (
      <div className="my-2 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-white space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          <span>Reminder Scheduled</span>
        </div>
        <div className="text-xs text-white font-medium pl-5">
          {args.title} • <span className="text-purple-300">{args.time}</span>
        </div>
      </div>
    );
  }

  if (tool === 'set_timer_or_alarm') {
    return (
      <div className="my-2 p-3 rounded-2xl bg-pink-950/60 border border-pink-500/30 text-white space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
          <Clock className="w-4 h-4 text-pink-400" />
          <span>{args.actionType === 'alarm' ? 'Alarm Configured' : 'Timer Active'}</span>
        </div>
        <div className="text-xs text-white font-medium pl-5">
          {args.label} • {args.alarmTime || (args.durationSeconds ? `${Math.round(args.durationSeconds / 60)} min` : '')}
        </div>
      </div>
    );
  }

  return (
    <div className="my-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
      <span>Action executed: <strong className="text-white">{tool.replace(/_/g, ' ')}</strong></span>
    </div>
  );
};
