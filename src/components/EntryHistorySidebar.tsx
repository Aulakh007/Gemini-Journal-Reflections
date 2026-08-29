import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  Filter, 
  Calendar, 
  FileDown, 
  Check, 
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type { JournalEntry, JournalMood, JournalCategory } from '../types';

interface EntryHistorySidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const EntryHistorySidebar: React.FC<EntryHistorySidebarProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onDeleteEntry,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const moods: JournalMood[] = ['Peaceful', 'Energized', 'Grateful', 'Contemplative', 'Challenged', 'Anxious', 'Inspired'];
  const categories: JournalCategory[] = [
    'Daily Reflection',
    'Deep Brainstorming',
    'Mindfulness & Gratitude',
    'Goal Setting & Strategy',
    'Emotional Processing',
    'Creative Ideas',
  ];

  // Filtering
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;

    return matchesSearch && matchesMood && matchesCategory;
  });

  const getMoodColor = (mood: JournalMood) => {
    switch (mood) {
      case 'Peaceful': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Energized': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Grateful': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Contemplative': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Challenged': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Anxious': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Inspired': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 z-20 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-20
        w-80 lg:w-88 bg-white border-r border-stone-200 flex flex-col
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-700" />
            <h2 className="font-semibold text-stone-900 text-sm">Past Reflections</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
              {entries.length}
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-stone-500 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 border-b border-stone-100 space-y-2 bg-stone-50/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search reflections & chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              id="history-mood-filter"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              aria-label="Filter by mood"
              className="w-1/2 text-[11px] py-1 px-2 rounded-md border border-stone-200 bg-white text-stone-700 focus:outline-none"
            >
              <option value="all">All Moods</option>
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              id="history-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-1/2 text-[11px] py-1 px-2 rounded-md border border-stone-200 bg-white text-stone-700 focus:outline-none truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-stone-500 text-xs">
              <p className="font-medium text-stone-700">No reflections found</p>
              <p className="mt-1 text-stone-400">
                {searchQuery || selectedMood !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start by writing your first reflection above!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isActive = entry.id === activeEntryId;
              return (
                <div
                  key={entry.id}
                  id={`entry-card-${entry.id}`}
                  onClick={() => {
                    onSelectEntry(entry);
                    onCloseMobile();
                  }}
                  className={`
                    group relative p-3 rounded-xl cursor-pointer text-left transition-all border
                    ${isActive 
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs' 
                      : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-200/70 hover:border-stone-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-white' : 'text-stone-900'}`}>
                      {entry.title || 'Untitled Reflection'}
                    </h4>
                    <button
                      id={`delete-entry-btn-${entry.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry);
                      }}
                      title="Delete Entry"
                      className={`
                        p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100
                        ${isActive ? 'text-stone-400 hover:text-rose-300 hover:bg-stone-800' : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'}
                      `}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className={`text-[11px] line-clamp-2 mt-1 leading-relaxed ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                    {entry.content || (entry.messages.length > 0 ? entry.messages[0].content : 'No reflection body text...')}
                  </p>

                  {/* Metadata Tags */}
                  <div className="mt-2.5 flex items-center justify-between gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${isActive ? 'bg-stone-800 text-stone-200 border-stone-700' : getMoodColor(entry.mood)}`}>
                        {entry.mood}
                      </span>
                      {entry.messages.length > 0 && (
                        <span className={`flex items-center gap-0.5 ${isActive ? 'text-amber-300' : 'text-stone-500'}`}>
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{entry.messages.length}</span>
                        </span>
                      )}
                      {entry.summary && (
                        <span className={`flex items-center gap-0.5 ${isActive ? 'text-amber-200' : 'text-amber-700'}`} title="Summary generated">
                          <Sparkles className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <span className={isActive ? 'text-stone-400 font-mono' : 'text-stone-400 font-mono'}>
                      {formatDate(entry.updatedAt || entry.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Storage Isolation Note Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="truncate">Isolated Path: <code>/users/&#123;uid&#125;/...</code></span>
          <span className="text-emerald-700 font-medium shrink-0 ml-1">Live</span>
        </div>
      </aside>
    </>
  );
};
