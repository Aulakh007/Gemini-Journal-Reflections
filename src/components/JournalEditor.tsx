import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  Tag, 
  Lightbulb, 
  HelpCircle, 
  Smile, 
  Check, 
  RefreshCw,
  Eye,
  Edit3
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { JournalEntry, JournalMood, JournalCategory } from '../types';

interface JournalEditorProps {
  entry: JournalEntry;
  onChange: (updated: Partial<JournalEntry>) => void;
  onSave: () => void;
  isSaving: boolean;
  onOpenSummaryModal: () => void;
  hasSummary: boolean;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onChange,
  onSave,
  isSaving,
  onOpenSummaryModal,
  hasSummary,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [sparkPrompts, setSparkPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  const moods: JournalMood[] = [
    'Contemplative',
    'Grateful',
    'Peaceful',
    'Energized',
    'Challenged',
    'Anxious',
    'Inspired',
  ];

  const categories: JournalCategory[] = [
    'Daily Reflection',
    'Deep Brainstorming',
    'Mindfulness & Gratitude',
    'Goal Setting & Strategy',
    'Emotional Processing',
    'Creative Ideas',
  ];

  const handleFetchPrompts = async () => {
    try {
      setIsLoadingPrompts(true);
      setShowPrompts(true);
      const res = await fetch('/api/gemini/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: entry.category,
          mood: entry.mood,
        }),
      });
      const data = await res.json();
      if (data.prompts && Array.isArray(data.prompts)) {
        setSparkPrompts(data.prompts);
      }
    } catch (err) {
      console.error('Failed to fetch spark prompts:', err);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleInsertPrompt = (promptText: string) => {
    const newContent = entry.content 
      ? `${entry.content}\n\n> *Prompt: ${promptText}*\n`
      : `> *Prompt: ${promptText}*\n\n`;
    onChange({ content: newContent });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/40">
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            id="editor-category-select"
            value={entry.category}
            onChange={(e) => onChange({ category: e.target.value as JournalCategory })}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Mood Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-stone-200">
            <Smile className="w-3.5 h-3.5 text-stone-500" />
            <select
              id="editor-mood-select"
              value={entry.mood}
              onChange={(e) => onChange({ mood: e.target.value as JournalMood })}
              className="text-xs font-medium text-stone-700 bg-transparent focus:outline-none"
            >
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Spark Prompt Trigger */}
          <button
            id="editor-spark-prompts-btn"
            onClick={handleFetchPrompts}
            disabled={isLoadingPrompts}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors"
          >
            <Lightbulb className={`w-3.5 h-3.5 text-amber-700 ${isLoadingPrompts ? 'animate-bounce' : ''}`} />
            <span>{isLoadingPrompts ? 'Generating...' : 'Spark Prompts'}</span>
          </button>

          {/* Synthesis Summary Modal Trigger */}
          <button
            id="editor-open-summary-btn"
            onClick={onOpenSummaryModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{hasSummary ? 'View Summary' : 'Synthesize Summary'}</span>
          </button>

          {/* Markdown Toggle */}
          <button
            id="editor-preview-toggle-btn"
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 bg-white transition-colors"
            title={isPreview ? 'Switch to Edit' : 'Switch to Markdown Preview'}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Explicit Save Button */}
          <button
            id="editor-save-doc-btn"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save to Firestore</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spark Prompts Banner */}
      {showPrompts && sparkPrompts.length > 0 && (
        <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              AI Prompt Ideas (tailored to {entry.mood} / {entry.category}):
            </span>
            <button
              onClick={() => setShowPrompts(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sparkPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertPrompt(p)}
                className="text-left text-xs p-2 rounded-lg bg-white/90 hover:bg-white border border-amber-200 text-stone-800 hover:text-stone-900 transition-colors shadow-2xs"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        {/* Title input */}
        <input
          id="editor-title-input"
          type="text"
          placeholder="Title of your reflection or brainstorm..."
          value={entry.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full text-xl sm:text-2xl font-bold font-serif text-stone-900 placeholder:text-stone-300 border-0 focus:outline-none focus:ring-0 bg-transparent mb-4"
        />

        {/* Content Body */}
        {isPreview ? (
          <div className="flex-1 bg-stone-50/50 p-4 rounded-xl border border-stone-200 prose prose-stone max-w-none text-sm overflow-y-auto">
            {entry.content ? (
              <Markdown>{entry.content}</Markdown>
            ) : (
              <p className="text-stone-400 italic">No entry text written yet...</p>
            )}
          </div>
        ) : (
          <textarea
            id="editor-content-textarea"
            placeholder="Write your journal entry, stream of consciousness, or brainstorming notes here. Then converse with Gemini on the right to unpack insights, challenge assumptions, and explore deeper reflections..."
            value={entry.content}
            onChange={(e) => onChange({ content: e.target.value })}
            className="w-full flex-1 resize-none border-0 focus:outline-none focus:ring-0 bg-transparent text-stone-800 text-sm leading-relaxed placeholder:text-stone-400 font-sans"
          />
        )}
      </div>

      {/* Word / Character / Metadata Footer */}
      <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{entry.content ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0} words</span>
          <span>{entry.content ? entry.content.length : 0} characters</span>
        </div>
        <span className="font-mono text-stone-400">ID: {entry.id.substring(0, 16)}...</span>
      </div>
    </div>
  );
};
