import React, { useState } from 'react';
import { NoteItem } from '../types';
import { BookOpen, Copy, Check, Trash2, Plus, X, Tag } from 'lucide-react';

interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Idea');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddNote({
      title: title.trim(),
      content: content.trim(),
      tag,
    });
    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Chandan's Notebook</span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-mono">
              {notes.length} Notes
            </span>
          </h2>
          <p className="text-xs text-slate-400">Captured voice notes, memos & ideas</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1 text-xs font-medium"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Close' : 'New Note'}</span>
        </button>
      </div>

      {/* Add note form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-800/80 border-b border-blue-500/20 space-y-3">
          <div>
            <label className="text-xs text-slate-300 font-medium">Note Title</label>
            <input
              type="text"
              placeholder="e.g. Mobile architecture thoughts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium">Content / Details</label>
            <textarea
              rows={3}
              placeholder="Write or dictate note details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Tag:</span>
              {['Idea', 'Work', 'Tech', 'Personal'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTag(t)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                    tag === t
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 shadow-md"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <BookOpen className="w-12 h-12 stroke-1 mb-2 text-blue-400/40" />
            <p className="text-sm font-medium text-slate-300">No notes captured yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Tell Maya: <br />
              <span className="text-blue-300 italic">"Maya, save a note: Meeting with developer team at 2 PM to discuss API architecture"</span>
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-slate-800/70 border border-white/10 hover:border-blue-500/30 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  {note.tag}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Copy note"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {note.title}
              </h3>

              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              <div className="text-[10px] text-slate-500 pt-1">
                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
