import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  MessageSquare, 
  Lightbulb, 
  Check, 
  Tag as TagIcon, 
  Plus, 
  X, 
  Clock, 
  FileText,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { JournalEntry, JournalMood, JournalCategory, AIPersona } from '../../types';

interface JournalEditorProps {
  entry: JournalEntry;
  onSave: (entry: JournalEntry) => Promise<void>;
  onBack: () => void;
  onOpenAiDialogue: (entry: JournalEntry) => void;
  onOpenSummary: (entry: JournalEntry) => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSave,
  onBack,
  onOpenAiDialogue,
  onOpenSummary,
}) => {
  const [title, setTitle] = useState(entry.title || '');
  const [content, setContent] = useState(entry.content || '');
  const [mood, setMood] = useState<JournalMood>(entry.mood || 'Reflective');
  const [category, setCategory] = useState<JournalCategory>(entry.category || 'Daily Reflection');
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialMount = useRef(true);

  const moods: { mood: JournalMood; emoji: string; label: string }[] = [
    { mood: 'Calm', emoji: '😊', label: 'Calm' },
    { mood: 'Reflective', emoji: '😌', label: 'Reflective' },
    { mood: 'Inspired', emoji: '✨', label: 'Inspired' },
    { mood: 'Grateful', emoji: '🙏', label: 'Grateful' },
    { mood: 'Energized', emoji: '⚡', label: 'Energized' },
    { mood: 'Challenged', emoji: '🧗', label: 'Challenged' },
    { mood: 'Low', emoji: '😔', label: 'Low' },
    { mood: 'Frustrated', emoji: '😤', label: 'Frustrated' },
    { mood: 'Anxious', emoji: '🌀', label: 'Anxious' },
  ];

  const categories: JournalCategory[] = [
    'Daily Reflection',
    'Life & Growth',
    'Career & Projects',
    'Mindfulness & Gratitude',
    'Emotional Clarity',
    'Relationships',
    'Creative Ideas'
  ];

  // Calculate word count and estimated reading time
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Auto-resize textarea
  useEffect(() => {
    if (contentTextareaRef.current) {
      contentTextareaRef.current.style.height = 'auto';
      contentTextareaRef.current.style.height = `${Math.max(380, contentTextareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  // Track unsaved state when inputs change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSaveStatus('unsaved');
  }, [title, content, mood, category, tags]);

  // Handle Tag Addition
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Perform Save
  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const updated: JournalEntry = {
        ...entry,
        title: title.trim() || 'Untitled Reflection',
        content,
        mood,
        category,
        tags,
        updatedAt: new Date().toISOString(),
      };
      await onSave(updated);
      setIsSaving(false);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to save reflection:', err);
      setIsSaving(false);
      setSaveStatus('unsaved');
    }
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-200 ${isDistractionFree ? 'fixed inset-0 z-50 bg-[#FAF9F6] dark:bg-[#121214] p-6 sm:p-12 overflow-y-auto' : ''}`}>
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-200/60 dark:border-zinc-800/60">
        <button
          id="editor-back-btn"
          onClick={async () => {
            if (saveStatus === 'unsaved') {
              await handleManualSave();
            }
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Save Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 dark:text-zinc-500">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" /> {lastSavedTime ? `Saved at ${lastSavedTime}` : 'All changes saved'}
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
              </span>
            )}
          </div>

          {/* Distraction Free Toggle */}
          <button
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title={isDistractionFree ? 'Exit distraction-free mode' : 'Enter distraction-free mode'}
          >
            {isDistractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* AI Dialogue Trigger Button */}
          <button
            id="editor-ai-reflect-btn"
            onClick={() => onOpenAiDialogue({ ...entry, title, content, mood, category, tags })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reflect with AI</span>
            <span className="xs:hidden">AI</span>
          </button>

          {/* Generate Insights Button */}
          <button
            id="editor-summary-btn"
            onClick={() => onOpenSummary({ ...entry, title, content, mood, category, tags })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-2xs"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Generate Insights</span>
            <span className="xs:hidden">Insights</span>
          </button>

          {/* Save Button */}
          <button
            id="editor-save-btn"
            onClick={handleManualSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Writing Canvas Surface */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mood Selector Strip */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
            <span className="font-medium">How are you feeling right now?</span>
            <span className="text-stone-400 dark:text-zinc-500 text-[11px]">Choose a reflective mood</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {moods.map((item) => (
              <button
                key={item.mood}
                onClick={() => setMood(item.mood)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  mood === item.mood
                    ? 'bg-indigo-600 text-white shadow-xs scale-102'
                    : 'bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200/60 dark:border-zinc-800'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Bar (Category & Tags) */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 dark:text-zinc-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as JournalCategory)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tags Manager */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <TagIcon className="w-3.5 h-3.5 text-stone-400" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-[11px] font-medium"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="w-20 px-2 py-0.5 text-[11px] rounded-md bg-white dark:bg-[#1C1C1F] border border-stone-200 dark:border-zinc-800 focus:outline-none focus:w-28 transition-all"
              />
              {newTagInput && (
                <button
                  onClick={handleAddTag}
                  className="p-1 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 hover:text-indigo-600"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <input
            id="reflection-title-input"
            type="text"
            placeholder="What's on your mind today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-white bg-transparent border-none focus:outline-none placeholder:text-stone-300 dark:placeholder:text-zinc-600 tracking-tight"
          />
        </div>

        {/* Distraction-Free Text Writing Area */}
        <div className="relative rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs p-6 sm:p-8">
          <textarea
            id="reflection-content-textarea"
            ref={contentTextareaRef}
            placeholder="Start writing freely... Your thoughts are private, safe, and protected. Notice what feelings arise, explore recent challenges, or let your thoughts unfold naturally."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none resize-none text-stone-800 dark:text-stone-200 text-base sm:text-lg leading-relaxed placeholder:text-stone-300 dark:placeholder:text-zinc-600 min-h-[380px]"
          />

          {/* Bottom Word Count & Reading Time */}
          <div className="pt-4 mt-4 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {wordCount} words
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTimeMinutes} min read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
