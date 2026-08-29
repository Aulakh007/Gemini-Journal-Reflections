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
      title: 'Write a Reflection',
      icon: BookOpen,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60',
      description: 'Start in the distraction-free journal editor. Choose your mood (Calm, Reflective, Energized, etc.), assign tags, and write your raw thoughts.',
      testHint: 'Click "+ New Reflection", type a title and body, then click "Save Reflection". Verify the entry appears in your Dashboard.'
    },
    {
      step: '2',
      title: 'Engage with AI Personas',
      icon: Brain,
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
      description: 'Choose between 4 specialized cognitive guides: Socratic Explorer, Empathetic Listener, Pattern Finder, or Practical Coach for multi-turn dialogue.',
      testHint: 'In the editor or AI Explorer, choose a persona and click "Reflect on this entry". Notice the structured Observation, Question, and Next Step.'
    },
    {
      step: '3',
      title: 'Synthesize Executive Insights',
      icon: Lightbulb,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
      description: 'Generate an executive summary with emotional theme scores, observed cognitive patterns, and a guiding philosophical question to carry forward.',
      testHint: 'Navigate to "Insights & Actions", pick your reflection, and click "Synthesize". Check the theme percentage bars.'
    },
    {
      step: '4',
      title: 'Turn Insights into Concrete Action',
      icon: Target,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
      description: 'Convert AI suggestions into actionable checklist items with priority indicators (High, Medium, Low) and optional due dates.',
      testHint: 'Check off actions as you complete them, and watch your dashboard metrics reflect your progress.'
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
