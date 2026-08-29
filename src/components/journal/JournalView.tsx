import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Lightbulb, 
  Sparkles, 
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import type { JournalEntry, JournalMood, JournalCategory } from '../../types';

interface JournalViewProps {
  entries: JournalEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewReflection: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  searchQuery,
  setSearchQuery,
  onNewReflection,
  onSelectEntry,
  onDeleteEntry,
}) => {
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const moods: JournalMood[] = ['Calm', 'Reflective', 'Inspired', 'Grateful', 'Energized', 'Challenged', 'Low', 'Frustrated', 'Anxious'];
  const categories: JournalCategory[] = [
    'Daily Reflection',
    'Life & Growth',
    'Career & Projects',
    'Mindfulness & Gratitude',
    'Emotional Clarity',
    'Relationships',
    'Creative Ideas'
  ];

  // Filtering Logic
  const filteredEntries = entries.filter((entry) => {
    // Search match (title, content, tags)
    const matchesSearch = 
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || entry.category === selectedCategoryFilter;

    return matchesSearch && matchesMood && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const getMoodBadge = (mood: string) => {
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Title and New Reflection CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Journal Entries
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Your private repository of reflections, insights, and cognitive notes.
          </p>
        </div>

        <button
          id="journal-new-reflection-btn"
          onClick={onNewReflection}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Reflection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keywords, insights, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {/* Mood Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-stone-400 dark:text-zinc-500 font-medium mr-1 text-[11px]">Mood:</span>
          <button
            onClick={() => setSelectedMoodFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedMoodFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMoodFilter(m)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedMoodFilter === m
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
            {entries.length === 0 ? 'Your thoughts have a place here' : 'Nothing matched your search'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            {entries.length === 0
              ? 'Start your first reflection and begin building your personal reflection history.'
              : 'Try another keyword, mood tag, or clear your filters to find your reflection.'}
          </p>
          {entries.length === 0 ? (
            <button
              onClick={onNewReflection}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Write your first reflection
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMoodFilter('all');
                setSelectedCategoryFilter('all');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 px-4 py-2 rounded-xl transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const wordCount = entry.content ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0;
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 hover:border-indigo-400/80 dark:hover:border-indigo-600/80 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getMoodBadge(entry.mood)}`}>
                      {entry.mood}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-zinc-500">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {entry.title || 'Untitled Reflection'}
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {entry.content || '(No written text)'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400">{entry.category}</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};
