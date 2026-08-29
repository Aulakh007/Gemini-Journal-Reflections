import React from 'react';
import { HelpCircle, BookOpen, Brain, Lightbulb, Target, Sparkles, X, Check } from 'lucide-react';

interface WalkthroughGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughGuideModal: React.FC<WalkthroughGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '1',
      title: 'Write a Reflection & Anchor Location Context',
      icon: BookOpen,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60',
      description: 'Start in the distraction-free journal editor. Choose your mood (Calm, Inspired, Challenged, etc.), tag your themes, and optionally anchor a physical place (Cafe, Park, Studio, Home) via the Location modal.',
      testHint: 'Click "+ New Reflection", type thoughts, click "Add Location" to pick a spot, then click "Save Reflection".'
    },
    {
      step: '2',
      title: 'Explore Temporal Journey in Timeline',
      icon: HelpCircle,
      color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60',
      description: 'Open the new Timeline view to browse your reflections across days, filter by mood or location presence, and observe your environment clusters.',
      testHint: 'Click "Timeline" in the sidebar, filter by mood or "Location Attached", and expand entry detail cards.'
    },
    {
      step: '3',
      title: 'Engage with 6 Specialized AI Personas',
      icon: Brain,
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
      description: 'Choose between 6 distinct cognitive guides: Socratic Explorer, Empathetic Listener, Pattern Finder, Practical Coach, Perspective Shifter, or Future Self.',
      testHint: 'In the AI Explorer tab, pick "Perspective Shifter" or "Future Self" and submit a reflection prompt. Verify structured, compassionate guidance.'
    },
    {
      step: '4',
      title: 'Longitudinal Pattern Discovery',
      icon: Sparkles,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
      description: 'Synthesize overarching cognitive tendencies, emotional cycles, and location habits across your reflections, backed by concrete evidence and micro-steps.',
      testHint: 'Navigate to "Pattern Discovery" and click "Discover Patterns". Click "Add to Actions" on any recommended micro-step.'
    },
    {
      step: '5',
      title: 'Executive Insights & Action Momentum',
      icon: Lightbulb,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
      description: 'Synthesize executive summaries, emotional theme breakdowns, and track action items with high/medium/low priority indicators and due dates.',
      testHint: 'In "Insights & Actions", check off completed steps and track your momentum score in the Dashboard.'
    },
    {
      step: '6',
      title: 'Platform Observability & Webhook Integration',
      icon: Target,
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
      description: 'Audit Gemini API health, model fallback ladder, and RBAC isolation in "Platform & Admin". Configure external Discord or Slack webhook notifications in "Settings".',
      testHint: 'Visit "Platform & Admin" to inspect live latency. In Settings, configure a webhook and click "Test Ping".'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                The ReflectAI Product Journey
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Reflection → AI Conversation → Insight → Action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-900/50 border border-stone-100 dark:border-zinc-800 flex items-start gap-3.5"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-xs border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                      {s.step}. {s.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {s.description}
                  </p>
                  <div className="pt-1.5 text-[11px] text-stone-500 dark:text-zinc-400 font-mono bg-white dark:bg-zinc-950 p-2 rounded-lg border border-stone-200/60 dark:border-zinc-800">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Walkthrough Verification: </span>
                    {s.testHint}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
          >
            Got it, start reflecting
          </button>
        </div>
      </div>
    </div>
  );
};
