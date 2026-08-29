import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Flame, 
  BookOpen, 
  MessageSquare, 
  Smile, 
  Calendar, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2,
  Trash2,
  Edit3
} from 'lucide-react';
import type { JournalEntry, ActionItem, UserProfile, JournalMood, ActiveTab } from '../../types';

interface DashboardViewProps {
  user: UserProfile | null;
  entries: JournalEntry[];
  actions: ActionItem[];
  onNewReflection: () => void;
  onOpenInspire: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onToggleAction: (action: ActionItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  entries,
  actions,
  onNewReflection,
  onOpenInspire,
  onSelectEntry,
  onDeleteEntry,
  onNavigateTab,
  onToggleAction,
}) => {
  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

  // Calculate Metrics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const reflectionsThisWeek = entries.filter(e => new Date(e.createdAt) >= oneWeekAgo).length;

  const totalWords = entries.reduce((acc, curr) => {
    const words = curr.content ? curr.content.trim().split(/\s+/).filter(Boolean).length : 0;
    return acc + words;
  }, 0);

  const totalAiConversations = entries.reduce((acc, curr) => {
    return acc + (curr.messages ? curr.messages.length : 0);
  }, 0);

  // Calculate Streak (Consecutive days with reflections)
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(
      entries.map(e => new Date(e.createdAt).toISOString().split('T')[0])
    );
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (entryDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow streak to continue if today has no entry yet but yesterday did
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (entryDates.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Calculate Most Frequent Mood
  const moodCounts = entries.reduce((acc, curr) => {
    if (curr.mood) {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const mostFrequentMood = sortedMoods.length > 0 ? sortedMoods[0][0] : 'Calm';

  // Recent reflections (top 4)
  const recentEntries = entries.slice(0, 4);

  // Active / Pending Action Items (top 3)
  const pendingActions = actions.filter(a => !a.completed).slice(0, 3);

  // Mood color map
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Calm': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60';
      case 'Reflective': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60';
      case 'Inspired': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60';
      case 'Grateful': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      case 'Energized': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
      case 'Challenged': return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60';
      case 'Low': return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border-stone-200 dark:border-zinc-700';
      case 'Frustrated': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60';
      default: return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Primary Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
            {getGreeting()}, {displayName}.
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Take a moment to slow down and notice what's on your mind.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-inspire-btn"
            onClick={onOpenInspire}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-[#1C1C1F] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/60 shadow-2xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Inspire Me</span>
          </button>

          <button
            id="dashboard-new-reflection-btn"
            onClick={onNewReflection}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reflection</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">This Week</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight">
            {reflectionsThisWeek}
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Reflections logged</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight flex items-baseline gap-1">
            {currentStreak} <span className="text-xs font-normal text-stone-400">days</span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Consecutive habit</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">Words Written</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight">
            {totalWords.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Across all entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">AI Dialogues</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight">
            {totalAiConversations}
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Cognitive exchanges</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">Top Mood</span>
            <Smile className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight truncate">
            {entries.length > 0 ? mostFrequentMood : 'None yet'}
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Predominant state</p>
        </div>
      </div>

      {/* Main Grid: Recent Reflections & Reflection Trends / Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Reflections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recent Reflections
            </h2>
            {entries.length > 4 && (
              <button
                id="view-all-journal-btn"
                onClick={() => onNavigateTab('journal')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all ({entries.length}) <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Your thoughts have a place here</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                Start your first reflection and begin building your personal reflection history with gentle AI support.
              </p>
              <button
                id="empty-state-new-reflection-btn"
                onClick={onNewReflection}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Write your first reflection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  id={`entry-card-${entry.id}`}
                  onClick={() => onSelectEntry(entry)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getMoodColor(entry.mood)}`}>
                          {entry.mood}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-zinc-500">
                          {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {entry.summary && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lightbulb className="w-2.5 h-2.5" /> Synthesized
                          </span>
                        )}
                        {entry.messages && entry.messages.length > 0 && (
                          <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <MessageSquare className="w-2.5 h-2.5" /> {entry.messages.length} replies
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {entry.title || 'Untitled Reflection'}
                      </h3>

                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {entry.content || '(No content written yet)'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntry(entry);
                        }}
                        className="p-1.5 text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
                        title="Edit reflection"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEntry(entry);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mood Distribution & Pending Action Steps */}
        <div className="space-y-6">
          {/* Reflection Patterns / Mood Distribution Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Emotional Distribution
            </h3>

            {entries.length < 2 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed italic">
                Your reflection patterns and emotional themes will appear here as you continue journaling.
              </p>
            ) : (
              <div className="space-y-2.5">
                {sortedMoods.slice(0, 4).map(([mood, count]) => {
                  const percentage = Math.round((count / entries.length) * 100);
                  return (
                    <div key={mood} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                        <span className="font-medium">{mood}</span>
                        <span className="text-stone-400 dark:text-zinc-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Action Items Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Action Steps
              </h3>
              <button
                onClick={() => onNavigateTab('insights')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Actions →
              </button>
            </div>

            {pendingActions.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                No open action steps. Synthesize any journal entry to turn reflection into grounded next steps.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-100 dark:border-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={action.completed}
                      onChange={() => onToggleAction(action)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-800 dark:text-stone-200 font-medium line-clamp-1">{action.title}</p>
                      {action.dueDate && (
                        <span className="text-[10px] text-stone-400 dark:text-zinc-500">Due: {action.dueDate}</span>
                      )}
                    </div>
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
