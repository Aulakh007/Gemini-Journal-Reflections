import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowUpRight, 
  MessageSquare, 
  Clock, 
  Compass, 
  Tag as TagIcon, 
  ChevronRight,
  Plus,
  Brain
} from 'lucide-react';
import type { JournalEntry, JournalMood, JournalCategory } from '../../types';

interface TimelineViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onOpenAiDialogue: (entry: JournalEntry) => void;
  onOpenInsights: (entry: JournalEntry) => void;
  onCreateNewEntry: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  entries,
  onSelectEntry,
  onOpenAiDialogue,
  onOpenInsights,
  onCreateNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All');

  const moodsList = ['All', 'Calm', 'Reflective', 'Inspired', 'Grateful', 'Energized', 'Challenged', 'Low', 'Frustrated', 'Anxious'];
  const categoriesList = [
    'All',
    'Daily Reflection',
    'Life & Growth',
    'Career & Projects',
    'Mindfulness & Gratitude',
    'Emotional Clarity',
    'Relationships',
    'Creative Ideas'
  ];

  // Extract all unique locations from entries
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    entries.forEach(e => {
      if (e.location?.city) locSet.add(e.location.city);
      else if (e.location?.name) locSet.add(e.location.name);
    });
    return ['All', ...Array.from(locSet)];
  }, [entries]);

  // Filter and sort entries chronologically descending
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        const matchesQuery = 
          !searchQuery.trim() ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (e.location?.name && e.location.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesMood = selectedMood === 'All' || e.mood === selectedMood;
        const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
        const matchesLocation = selectedLocationFilter === 'All' || 
          (e.location?.city === selectedLocationFilter || e.location?.name === selectedLocationFilter);

        return matchesQuery && matchesMood && matchesCategory && matchesLocation;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, searchQuery, selectedMood, selectedCategory, selectedLocationFilter]);

  // Group entries by Month Year (e.g., "August 2026", "July 2026")
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: JournalEntry[] } = {};
    filteredEntries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  // Location count stats
  const totalWithLocation = entries.filter(e => !!e.location?.name).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Context Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Reflection Timeline
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 text-sm mt-0.5">
            Trace your thoughts, emotional trajectories, and reflections across time and places
          </p>
        </div>

        <button
          id="timeline-new-entry-btn"
          onClick={onCreateNewEntry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Reflection</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/70 dark:border-zinc-800">
          <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">Total Timeline Nodes</div>
          <div className="text-xl font-semibold text-stone-900 dark:text-white mt-1">{filteredEntries.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/70 dark:border-zinc-800">
          <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">Location Anchors</div>
          <div className="text-xl font-semibold text-amber-600 dark:text-amber-400 mt-1">{totalWithLocation}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/70 dark:border-zinc-800">
          <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">Time Span Active</div>
          <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
            {Object.keys(groupedByMonth).length} {Object.keys(groupedByMonth).length === 1 ? 'Month' : 'Months'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/70 dark:border-zinc-800">
          <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">Unique Environments</div>
          <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {Math.max(0, uniqueLocations.length - 1)}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-zinc-800 space-y-3.5">
        {/* Search and Quick Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
            <input
              id="timeline-search-input"
              type="text"
              placeholder="Search timeline by title, thoughts, tag, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>

            {/* Location Select */}
            {uniqueLocations.length > 1 && (
              <select
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>Location: {loc}</option>
                ))}
              </select>
            )}

            {(searchQuery || selectedMood !== 'All' || selectedCategory !== 'All' || selectedLocationFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMood('All');
                  setSelectedCategory('All');
                  setSelectedLocationFilter('All');
                }}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white font-medium px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mood Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 shrink-0 mr-1">Mood:</span>
          {moodsList.map((m) => {
            const active = selectedMood === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium shrink-0 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chronological Stream */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-zinc-800/80 flex items-center justify-center mx-auto text-stone-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-200">No timeline reflections match</h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, mood filter, or location selection.
          </p>
        </div>
      ) : (
        <div className="space-y-10 relative">
          {/* Vertical central timeline line for desktop */}
          <div className="hidden sm:block absolute left-[19px] top-6 bottom-6 w-0.5 bg-stone-200 dark:bg-zinc-800 -z-0" />

          {Object.entries(groupedByMonth).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="space-y-4">
              {/* Month Year Header Node */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center shadow-xs font-semibold text-xs shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="font-semibold text-base sm:text-lg text-stone-900 dark:text-white">
                  {monthYear}
                </div>
                <div className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
                  ({monthEntries.length} {monthEntries.length === 1 ? 'reflection' : 'reflections'})
                </div>
              </div>

              {/* Entries in this Month */}
              <div className="space-y-4 pl-4 sm:pl-12">
                {monthEntries.map((entry) => {
                  const entryDate = new Date(entry.createdAt);
                  const formattedDay = entryDate.toLocaleDateString('default', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  const formattedTime = entryDate.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });

                  return (
                    <div
                      key={entry.id}
                      className="group p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all shadow-xs hover:shadow-md space-y-3 relative"
                    >
                      {/* Top Header of Node */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                            {formattedDay} • {formattedTime}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                            {entry.category}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-stone-50 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 text-[11px]">
                            {entry.mood}
                          </span>

                          {entry.location?.name && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                              <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="max-w-[180px] truncate">{entry.location.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Dialogue / Action Count Badge */}
                        {entry.messages && entry.messages.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-zinc-500 font-medium">
                            <MessageSquare className="w-3 h-3 text-indigo-500" />
                            {entry.messages.length} AI dialogues
                          </span>
                        )}
                      </div>

                      {/* Entry Title & Preview */}
                      <div 
                        onClick={() => onSelectEntry(entry)}
                        className="cursor-pointer space-y-1.5"
                      >
                        <h3 className="text-base font-semibold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {entry.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          {entry.content || '(No additional reflection text)'}
                        </p>
                      </div>

                      {/* Tags & Action Buttons */}
                      <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {entry.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] text-stone-400 dark:text-zinc-500">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Node Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenAiDialogue(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium text-[11px] transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Reflect with AI</span>
                          </button>

                          <button
                            onClick={() => onOpenInsights(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800/80 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 font-medium text-[11px] transition-colors"
                          >
                            <Brain className="w-3 h-3 text-stone-500" />
                            <span>Insight</span>
                          </button>

                          <button
                            onClick={() => onSelectEntry(entry)}
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Open in Editor"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
