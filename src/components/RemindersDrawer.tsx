import React, { useState } from 'react';
import { Reminder } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Tag,
  Check,
  X
} from 'lucide-react';

interface RemindersDrawerProps {
  reminders: Reminder[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => void;
  onClose?: () => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  reminders,
  onToggleComplete,
  onDelete,
  onAdd,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<Reminder['category']>('Personal');
  const [priority, setPriority] = useState<Reminder['priority']>('medium');

  const filtered = reminders.filter((r) => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;
    onAdd({
      title: title.trim(),
      time: time.trim(),
      category,
      priority,
    });
    setTitle('');
    setTime('');
    setIsAdding(false);
  };

  const getPriorityBadge = (p: Reminder['priority']) => {
    switch (p) {
      case 'high':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">High</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Med</span>;
      case 'low':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Low</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Chandan's Reminders</span>
            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-mono">
              {reminders.filter((r) => !r.completed).length} active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Syncs with voice commands to Maya</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md flex items-center gap-1 text-xs font-medium"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Cancel' : 'New'}</span>
        </button>
      </div>

      {/* Add New Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-800/80 border-b border-purple-500/20 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-300">Reminder Title</label>
            <input
              type="text"
              placeholder="e.g. Review machine learning paper with Chandan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-300">Time / Date</label>
              <input
                type="text"
                placeholder="e.g. Today 5:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Priority:</span>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border transition-all ${
                    priority === p
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 shadow-md"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-2 flex gap-2 border-b border-white/5 bg-slate-950/40">
        {(['all', 'pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs capitalize px-3 py-1 rounded-lg font-medium transition-all ${
              filter === tab
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab} ({reminders.filter((r) => tab === 'all' ? true : tab === 'pending' ? !r.completed : r.completed).length})
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Clock className="w-12 h-12 stroke-1 mb-2 text-purple-400/40" />
            <p className="text-sm font-medium text-slate-300">No reminders here</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Ask Maya in voice mode: <br />
              <span className="text-purple-300 italic">"Maya, remind me to check flight tickets tomorrow at 10 AM"</span>
            </p>
          </div>
        ) : (
          filtered.map((reminder) => (
            <div
              key={reminder.id}
              className={`group flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                reminder.completed
                  ? 'bg-slate-900/40 border-white/5 opacity-60'
                  : 'bg-slate-800/60 border-white/10 hover:border-purple-500/30 hover:bg-slate-800/90'
              }`}
            >
              <button
                onClick={() => onToggleComplete(reminder.id)}
                className="mt-0.5 text-purple-400 hover:text-purple-300 transition-colors"
                title={reminder.completed ? 'Mark pending' : 'Mark completed'}
              >
                {reminder.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-snug break-words ${
                    reminder.completed ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {reminder.title}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px] text-purple-300">
                    <Clock className="w-3 h-3" />
                    {reminder.time}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                    {reminder.category}
                  </span>
                  {getPriorityBadge(reminder.priority)}
                </div>
              </div>

              <button
                onClick={() => onDelete(reminder.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                title="Delete reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
