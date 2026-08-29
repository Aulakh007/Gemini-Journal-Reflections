import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Compass, 
  Heart, 
  Flame, 
  Lightbulb, 
  BookOpen,
  Shuffle
} from 'lucide-react';
import type { JournalMood, JournalCategory } from '../../types';

interface InspireMeViewProps {
  onStartReflectionWithPrompt: (prompt: string, mood?: JournalMood, category?: JournalCategory) => void;
}

export const InspireMeView: React.FC<InspireMeViewProps> = ({
  onStartReflectionWithPrompt,
}) => {
  const [selectedMood, setSelectedMood] = useState<JournalMood>('Reflective');
  const [selectedCategory, setSelectedCategory] = useState<JournalCategory>('Life & Growth');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [prompts, setPrompts] = useState<Array<{ text: string; category: JournalCategory; mood: JournalMood }>>([
    {
      text: "What are you avoiding because you already know the answer?",
      category: "Life & Growth",
      mood: "Reflective"
    },
    {
      text: "What is currently energizing you, and what is subtly draining your attention?",
      category: "Daily Reflection",
      mood: "Calm"
    },
    {
      text: "If you let go of trying to control the outcome, what feels true right now?",
      category: "Emotional Clarity",
      mood: "Inspired"
    },
    {
      text: "What is one small boundary that would bring you immediate peace this week?",
      category: "Mindfulness & Gratitude",
      mood: "Grateful"
    }
  ]);

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

  const handleFetchFreshPrompts = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/gemini/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          category: selectedCategory,
        }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data?.prompts) && data.data.prompts.length > 0) {
        setPrompts(data.data.prompts.map((p: string) => ({
          text: p,
          category: selectedCategory,
          mood: selectedMood,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch new prompts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              Inspiration Engine
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Inspire Your Next Reflection
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Discover thoughtful questions crafted to open your perspective, unblock creativity, and cultivate mindfulness.
          </p>
        </div>

        <button
          id="refresh-prompts-btn"
          onClick={handleFetchFreshPrompts}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-white dark:bg-[#1C1C1F] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 shadow-2xs transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          <span>{isRefreshing ? 'Generating Sparks...' : 'Generate New Sparks'}</span>
        </button>
      </div>

      {/* Mood & Focus Filter Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-500 dark:text-zinc-400">Target Focus:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as JournalCategory)}
              className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-500 dark:text-zinc-400">Current Mood:</span>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as JournalMood)}
              className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Interactive Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prompts.map((prompt, idx) => (
          <div
            key={idx}
            id={`prompt-card-${idx}`}
            onClick={() => onStartReflectionWithPrompt(prompt.text, prompt.mood, prompt.category)}
            className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 hover:border-indigo-400/80 dark:hover:border-indigo-600/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
                  {prompt.category}
                </span>
                <span className="text-xs text-stone-400 dark:text-zinc-500">Spark #{idx + 1}</span>
              </div>

              <h2 className="text-base sm:text-lg font-medium text-stone-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                "{prompt.text}"
              </h2>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-stone-400 dark:text-zinc-500">Tuned for: {prompt.mood}</span>
              <button
                id={`explore-prompt-btn-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartReflectionWithPrompt(prompt.text, prompt.mood, prompt.category);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
              >
                Explore this question <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
