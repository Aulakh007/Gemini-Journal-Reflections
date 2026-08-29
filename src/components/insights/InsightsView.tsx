import React, { useState } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Brain, 
  Check, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Tag
} from 'lucide-react';
import type { JournalEntry, ActionItem, EmotionalTheme } from '../../types';

interface InsightsViewProps {
  entries: JournalEntry[];
  actions: ActionItem[];
  onAddAction: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string) => Promise<void>;
  onToggleAction: (action: ActionItem) => Promise<void>;
  onDeleteAction: (actionId: string) => Promise<void>;
  onSynthesizeEntry: (entry: JournalEntry) => Promise<void>;
  onSelectEntry: (entry: JournalEntry) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  entries,
  actions,
  onAddAction,
  onToggleAction,
  onDeleteAction,
  onSynthesizeEntry,
  onSelectEntry,
}) => {
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [selectedEntryForSynthesis, setSelectedEntryForSynthesis] = useState<string>(entries[0]?.id || '');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [filterActionStatus, setFilterActionStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Most recent executive insight from entries
  const synthesizedEntries = entries.filter(e => e.executiveInsight || e.summary);
  const latestInsightEntry = synthesizedEntries[0];

  const executiveData = latestInsightEntry?.executiveInsight || (latestInsightEntry?.summary ? {
    summary: latestInsightEntry.summary,
    themes: [
      { theme: latestInsightEntry.category || 'Clarity', score: 80 },
      { theme: latestInsightEntry.mood || 'Reflective', score: 65 }
    ],
    patterns: [
      "You frequently explore personal growth and mental clarity.",
      "Structured self-inquiry helps clarify next priorities."
    ],
    actions: [
      "Dedicate 15 minutes of uninterrupted reflection every morning.",
      "Review past insights weekly to track cognitive progress."
    ],
    deepQuestion: "What is one belief that, if softened, would bring you deep relief today?"
  } : null);

  // Filter actions
  const filteredActions = actions.filter((a) => {
    if (filterActionStatus === 'pending') return !a.completed;
    if (filterActionStatus === 'completed') return a.completed;
    return true;
  });

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    setIsAddingAction(true);
    try {
      await onAddAction(newActionTitle.trim(), newActionPriority, newActionDueDate || undefined);
      setNewActionTitle('');
      setNewActionDueDate('');
    } catch (err) {
      console.error('Failed to create action:', err);
    } finally {
      setIsAddingAction(false);
    }
  };

  const handleRunSynthesis = async () => {
    const target = entries.find(e => e.id === selectedEntryForSynthesis);
    if (!target) return;
    setIsSynthesizing(true);
    try {
      await onSynthesizeEntry(target);
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60';
      case 'medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      case 'low': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              Insight Engine
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Cognitive Insights & Action Items
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Transform thoughtful reflections into synthesized themes, identified patterns, and concrete momentum.
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedEntryForSynthesis}
              onChange={(e) => setSelectedEntryForSynthesis(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-300 focus:outline-none max-w-[200px] truncate"
            >
              {entries.map(e => (
                <option key={e.id} value={e.id}>{e.title || 'Untitled'}</option>
              ))}
            </select>
            <button
              id="synthesize-entry-btn"
              onClick={handleRunSynthesis}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Executive Summary & Observed Patterns vs Actions Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Executive Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Executive Synthesis
              </h2>
              {latestInsightEntry && (
                <span className="text-xs text-stone-400 dark:text-zinc-500">
                  From: <span className="font-medium text-stone-700 dark:text-stone-300">{latestInsightEntry.title}</span>
                </span>
              )}
            </div>

            {executiveData ? (
              <div className="space-y-4">
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal bg-stone-50/80 dark:bg-zinc-900/60 p-4 rounded-xl border border-stone-100 dark:border-zinc-800">
                  {executiveData.summary}
                </p>

                {/* Emotional Themes Distribution */}
                {executiveData.themes && executiveData.themes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                      Emotional & Cognitive Themes
                    </h3>
                    <div className="space-y-2">
                      {executiveData.themes.map((t, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
                            <span className="font-medium">{t.theme}</span>
                            <span className="text-stone-400 dark:text-zinc-500">{t.score}% focus</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${Math.min(100, Math.max(10, t.score))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observed Patterns */}
                {executiveData.patterns && executiveData.patterns.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                      Observed Cognitive Patterns
                    </h3>
                    <ul className="space-y-2">
                      {executiveData.patterns.map((p, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deep Question to Carry */}
                {executiveData.deepQuestion && (
                  <div className="p-4 rounded-xl bg-linear-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1">
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Question to Carry Forward
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 italic">
                      "{executiveData.deepQuestion}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  No reflections synthesized yet. Select an entry from the dropdown above and click "Synthesize" to generate deep cognitive insights.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Action Items Manager */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Action Steps ({actions.filter(a => !a.completed).length})
              </h2>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setFilterActionStatus('all')}
                  className={`px-2 py-0.5 rounded-md ${filterActionStatus === 'all' ? 'bg-stone-200 dark:bg-zinc-700 font-semibold' : 'text-stone-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterActionStatus('pending')}
                  className={`px-2 py-0.5 rounded-md ${filterActionStatus === 'pending' ? 'bg-stone-200 dark:bg-zinc-700 font-semibold' : 'text-stone-400'}`}
                >
                  Open
                </button>
              </div>
            </div>

            {/* Quick Add Action Form */}
            <form onSubmit={handleCreateAction} className="space-y-2 pt-1 border-t border-stone-100 dark:border-zinc-800">
              <input
                type="text"
                placeholder="Add a new action step..."
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder:text-stone-400"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value as any)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <input
                    type="date"
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingAction || !newActionTitle.trim()}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </form>

            {/* Action Items List */}
            {filteredActions.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-zinc-500 text-center py-4 italic">
                {filterActionStatus === 'completed' ? 'No completed actions yet.' : 'No open actions. Add one above or synthesize a reflection.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                      action.completed
                        ? 'bg-stone-50/50 dark:bg-zinc-900/30 border-stone-100 dark:border-zinc-800/60 opacity-60'
                        : 'bg-white dark:bg-[#1C1C1F] border-stone-200/80 dark:border-zinc-800 shadow-2xs'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={action.completed}
                      onChange={() => onToggleAction(action)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-stone-800 dark:text-stone-200 font-medium ${action.completed ? 'line-through text-stone-400 dark:text-zinc-500' : ''}`}>
                        {action.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getPriorityBadge(action.priority)}`}>
                          {action.priority}
                        </span>
                        {action.dueDate && (
                          <span className="text-[10px] text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Due: {action.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAction(action.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800"
                      title="Delete action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
