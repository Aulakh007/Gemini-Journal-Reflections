import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  RotateCw, 
  CheckCircle2, 
  Plus, 
  HelpCircle, 
  ShieldCheck, 
  Flame, 
  Compass, 
  HeartHandshake, 
  TrendingUp, 
  Layers, 
  MapPin, 
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { 
  JournalEntry, 
  ReflectionPattern, 
  PatternCategory, 
  PatternConfidence 
} from '../../types';

interface PatternsViewProps {
  entries: JournalEntry[];
  savedPatterns: ReflectionPattern[];
  onSavePattern: (pattern: ReflectionPattern) => Promise<void>;
  onAddActionItem: (title: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  onSelectEntryById: (entryId: string) => void;
}

export const PatternsView: React.FC<PatternsViewProps> = ({
  entries,
  savedPatterns,
  onSavePattern,
  onAddActionItem,
  onSelectEntryById,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [addedActionMap, setAddedActionMap] = useState<{ [key: string]: boolean }>({});
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const categories: { label: string; value: string }[] = [
    { label: 'All Patterns', value: 'All' },
    { label: 'Recurring Themes', value: 'Theme' },
    { label: 'Emotional Trajectories', value: 'Emotional Pattern' },
    { label: 'Behavioral Tendencies', value: 'Behavioral Tendency' },
    { label: 'Location & Environments', value: 'Location Context' },
  ];

  const handleRunPatternDiscovery = async () => {
    if (entries.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/gemini/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.map(e => ({
            id: e.id,
            title: e.title,
            content: e.content,
            mood: e.mood,
            category: e.category,
            location: e.location,
            createdAt: e.createdAt,
          })),
        }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data?.patterns)) {
        setModelUsed(json.data.modelUsed || 'gemini-3.6-flash');
        // Persist each pattern into Firestore
        for (const p of json.data.patterns) {
          const patternObj: ReflectionPattern = {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: entries[0]?.userId || '',
            title: p.title || 'Observed Reflection Theme',
            category: p.category || 'Theme',
            confidenceLabel: p.confidenceLabel || 'Recurring theme',
            description: p.description || '',
            evidenceBasis: {
              reflectionCount: p.evidenceBasis?.reflectionCount || entries.length,
              dateRange: p.evidenceBasis?.dateRange || 'Recent reflections',
              sampleEntryTitles: p.evidenceBasis?.sampleEntryTitles || entries.slice(0, 2).map(e => e.title),
              sampleEntryIds: entries.slice(0, 2).map(e => e.id),
              keywords: p.evidenceBasis?.keywords || ['Focus', 'Reflection'],
            },
            suggestedInquiry: p.suggestedInquiry || 'What is one way to gently explore this tendency?',
            potentialMicroAction: p.potentialMicroAction || '',
            createdAt: new Date().toISOString(),
          };
          await onSavePattern(patternObj);
        }
      } else {
        setAnalysisError(json.error?.message || 'Unable to synthesize patterns.');
      }
    } catch (err: any) {
      console.error('Pattern synthesis error:', err);
      setAnalysisError(err?.message || 'Network error while analyzing reflection patterns.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMicroAction = async (patternId: string, actionText: string) => {
    if (!actionText) return;
    try {
      await onAddActionItem(actionText, 'medium');
      setAddedActionMap(prev => ({ ...prev, [patternId]: true }));
    } catch (err) {
      console.error('Failed to add action item:', err);
    }
  };

  const filteredPatterns = savedPatterns.filter(p => {
    if (activeCategoryFilter === 'All') return true;
    return p.category === activeCategoryFilter;
  });

  const getConfidenceBadgeColor = (conf: PatternConfidence) => {
    switch (conf) {
      case 'Strong recurring theme':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'Recurring theme':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
      case 'Emerging pattern':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'Worth exploring':
      default:
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
    }
  };

  const getCategoryIcon = (category: PatternCategory) => {
    switch (category) {
      case 'Emotional Pattern':
        return <TrendingUp className="w-4 h-4 text-rose-500" />;
      case 'Behavioral Tendency':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'Location Context':
        return <MapPin className="w-4 h-4 text-amber-500" />;
      case 'Theme':
      default:
        return <Compass className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Longitudinal Pattern Discovery
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 text-sm mt-0.5">
            Identify recurring cognitive cycles, emotional trajectories, and environmental habits over time
          </p>
        </div>

        <button
          id="discover-patterns-btn"
          onClick={handleRunPatternDiscovery}
          disabled={isAnalyzing || entries.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Reflection History...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Discover Patterns ({entries.length} Reflections)</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy & Safety Statement Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
        <div className="space-y-1 leading-relaxed">
          <div className="font-semibold">Assistive Intelligence Guarantee:</div>
          <div>
            ReflectAI synthesizes qualitative patterns purely as reflective mirrors. All patterns use non-dogmatic phrasing and link back to your concrete entries so you can verify what resonates.
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => {
          const active = activeCategoryFilter === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setActiveCategoryFilter(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                active
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-[#18181B] border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Discovered Patterns List */}
      {savedPatterns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-semibold text-stone-900 dark:text-white">No Patterns Synthesized Yet</h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Click &quot;Discover Patterns&quot; to synthesize recurring cognitive themes, emotional cycles, and location habits across your {entries.length} reflections.
            </p>
          </div>
          <button
            onClick={handleRunPatternDiscovery}
            disabled={isAnalyzing || entries.length === 0}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-medium hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Pattern Discovery</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPatterns.map((pattern) => {
            const hasAddedAction = addedActionMap[pattern.id];

            return (
              <div
                key={pattern.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-stone-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800/80">
                        {getCategoryIcon(pattern.category)}
                      </div>
                      <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                        {pattern.category}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getConfidenceBadgeColor(pattern.confidenceLabel)}`}>
                      {pattern.confidenceLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-stone-900 dark:text-white leading-snug">
                    {pattern.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">
                    {pattern.description}
                  </p>
                </div>

                {/* Evidence Basis Box */}
                {pattern.evidenceBasis && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-900/80 border border-stone-200/60 dark:border-zinc-800 text-xs space-y-2">
                    <div className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Evidence Basis
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-stone-600 dark:text-zinc-300 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                        <Layers className="w-3 h-3" />
                        {pattern.evidenceBasis.reflectionCount} Reflections
                      </span>
                      <span>•</span>
                      <span>{pattern.evidenceBasis.dateRange}</span>
                    </div>

                    {pattern.evidenceBasis.sampleEntryTitles && pattern.evidenceBasis.sampleEntryTitles.length > 0 && (
                      <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                        Observed in: <span className="italic text-stone-700 dark:text-stone-300">{pattern.evidenceBasis.sampleEntryTitles.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Inquiry */}
                {pattern.suggestedInquiry && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
                    <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Suggested Inquiry</span>
                    </div>
                    <p className="text-stone-700 dark:text-zinc-300 italic leading-relaxed">
                      &quot;{pattern.suggestedInquiry}&quot;
                    </p>
                  </div>
                )}

                {/* Micro Action Button */}
                {pattern.potentialMicroAction && (
                  <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="text-stone-600 dark:text-zinc-300 text-[11px] truncate flex-1">
                      <span className="font-medium">Micro-Step:</span> {pattern.potentialMicroAction}
                    </div>

                    <button
                      onClick={() => handleAddMicroAction(pattern.id, pattern.potentialMicroAction!)}
                      disabled={hasAddedAction}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all shrink-0 ${
                        hasAddedAction
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {hasAddedAction ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Actions</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
