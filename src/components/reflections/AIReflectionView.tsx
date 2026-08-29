import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Plus, 
  RefreshCw, 
  Compass, 
  HeartHandshake, 
  GitMerge, 
  Target, 
  BookOpen, 
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  MapPin,
  Eye,
  Hourglass,
  Scale,
  Brain,
  Zap,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import type { JournalEntry, AIPersona, ChatMessage, PersonaDetails, ActionItem } from '../../types';

interface AIReflectionViewProps {
  activeEntry: JournalEntry | null;
  allEntries?: JournalEntry[];
  onSaveEntryMessages: (entry: JournalEntry, messages: ChatMessage[]) => Promise<void>;
  onAddActionItem: (title: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  onBackToJournal?: () => void;
  defaultPersona?: AIPersona;
  defaultAgentType?: 'agent' | 'explore';
}

export const AIReflectionView: React.FC<AIReflectionViewProps> = ({
  activeEntry,
  allEntries = [],
  onSaveEntryMessages,
  onAddActionItem,
  onBackToJournal,
  defaultPersona = 'Gentle Reflector',
  defaultAgentType = 'explore',
}) => {
  // Mode toggle: 'agent' | 'explore'
  const [activeMode, setActiveMode] = useState<'agent' | 'explore'>(defaultAgentType);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(defaultPersona);
  const [conversation, setConversation] = useState<ChatMessage[]>(activeEntry?.messages || []);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [addedActionIndex, setAddedActionIndex] = useState<number | null>(null);

  // Agent mode state
  const [agentSynthesis, setAgentSynthesis] = useState<{
    statusHeadline: string;
    keyObservations: string[];
    streakInsight: string;
    suggestedMicroActions: Array<{ title: string; priority: 'low' | 'medium' | 'high'; rationale?: string }>;
    proactivePrompt: string;
  } | null>(null);
  const [isAgentSynthesizing, setIsAgentSynthesizing] = useState(false);
  const [agentChatHistory, setAgentChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string; time: string }>>([
    {
      role: 'agent',
      text: "👋 Hello! I am your ReflectAI Autonomous Agent. I proactively scan your reflection stream to identify cognitive focus areas, calculate rhythm insights, and draft high-impact micro-actions. How can I assist your clarity today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [agentPromptInput, setAgentPromptInput] = useState('');
  const [isAgentChatting, setIsAgentChatting] = useState(false);
  const [addedAgentActionIndex, setAddedAgentActionIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const agentChatEndRef = useRef<HTMLDivElement>(null);

  const personas: PersonaDetails[] = [
    {
      id: 'Gentle Reflector',
      name: 'Gentle Reflector',
      tagline: 'Empathetic & Calm',
      description: 'Provides empathetic and calm reflection, validating emotions and practicing self-compassion without rushing to fix.',
      badge: 'Compassion',
      iconName: 'HeartHandshake',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60',
    },
    {
      id: 'Perspective Guide',
      name: 'Perspective Guide',
      tagline: 'Alternative Vantage Points',
      description: 'Helps you examine situations from fresh angles, external vantage points, and alternate timelines to unstick fixed narratives.',
      badge: 'Vantage',
      iconName: 'Eye',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60',
    },
    {
      id: 'Pattern Explorer',
      name: 'Pattern Explorer',
      tagline: 'Connect the Dots',
      description: 'Focuses on recurring themes, mental habits, and subtle triggers across your thoughts using non-dogmatic insights.',
      badge: 'Themes',
      iconName: 'GitMerge',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/60',
    },
    {
      id: 'Growth Coach',
      name: 'Growth Coach',
      tagline: 'Constructive Next Steps',
      description: 'Focuses on learning, resilience, and constructive momentum. Converts raw thoughts into high-leverage micro-actions.',
      badge: 'Growth',
      iconName: 'Target',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      id: 'Curious Questioner',
      name: 'Curious Questioner',
      tagline: 'Thoughtful Inquiry',
      description: 'Asks penetrating, open-ended follow-up questions that help you examine underlying assumptions and core beliefs.',
      badge: 'Inquiry',
      iconName: 'Compass',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      id: 'Balanced Perspective',
      name: 'Balanced Perspective',
      tagline: 'Multiple Viewpoints',
      description: 'Helps you consider multiple viewpoints, calibrate emotional extremes, and find equilibrium between competing priorities.',
      badge: 'Equilibrium',
      iconName: 'Scale',
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/60 dark:border-cyan-800/60',
    },
  ];

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  useEffect(() => {
    agentChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentChatHistory, isAgentChatting]);

  // Sync conversation when activeEntry changes
  useEffect(() => {
    if (activeEntry?.messages) {
      setConversation(activeEntry.messages);
    }
  }, [activeEntry?.id]);

  // Trigger autonomous agent synthesis
  const handleRunAgentSynthesis = async () => {
    setIsAgentSynthesizing(true);
    try {
      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'synthesize',
          entries: allEntries.length > 0 ? allEntries : (activeEntry ? [activeEntry] : []),
          activeEntry,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.synthesis) {
        setAgentSynthesis(json.data.synthesis);
      }
    } catch (err) {
      console.error('Agent synthesis failed:', err);
    } finally {
      setIsAgentSynthesizing(false);
    }
  };

  // Run initial synthesis if entering agent mode with entries
  useEffect(() => {
    if (activeMode === 'agent' && !agentSynthesis && (allEntries.length > 0 || activeEntry)) {
      handleRunAgentSynthesis();
    }
  }, [activeMode]);

  // Send message to Agent Chat
  const handleSendAgentChat = async (presetPrompt?: string) => {
    const textToSend = (presetPrompt || agentPromptInput).trim();
    if (!textToSend) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAgentChatHistory(prev => [...prev, userMsg]);
    setAgentPromptInput('');
    setIsAgentChatting(true);

    try {
      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          userPrompt: textToSend,
          entries: allEntries.length > 0 ? allEntries : (activeEntry ? [activeEntry] : []),
          activeEntry,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.reply) {
        setAgentChatHistory(prev => [
          ...prev,
          {
            role: 'agent' as const,
            text: json.data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setAgentChatHistory(prev => [
          ...prev,
          {
            role: 'agent' as const,
            text: "I was unable to complete the analysis. Please check your connection and try again.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setAgentChatHistory(prev => [
        ...prev,
        {
          role: 'agent' as const,
          text: `Network error: ${err?.message || 'Unable to reach agent endpoint.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAgentChatting(false);
    }
  };

  // Handle Send Message in AI Explore
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend && !activeEntry?.content) return;

    setErrorMsg(null);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: promptToSend || `Please explore my reflection: "${activeEntry?.title}"`,
      timestamp: new Date().toISOString(),
    };

    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalTitle: activeEntry?.title || 'Personal Reflection',
          journalContent: activeEntry?.content || '',
          category: activeEntry?.category || 'Daily Reflection',
          mood: activeEntry?.mood || 'Reflective',
          locationName: activeEntry?.location?.name || '',
          conversation: newConversation,
          persona: selectedPersona,
          userPrompt: promptToSend,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Failed to receive AI reflection');
      }

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'model',
        content: resData.data.reply,
        timestamp: new Date().toISOString(),
        modelUsed: resData.data.modelUsed,
      };

      const finalConversation = [...newConversation, aiMessage];
      setConversation(finalConversation);

      // Persist to entry if activeEntry exists
      if (activeEntry) {
        await onSaveEntryMessages(activeEntry, finalConversation);
      }
    } catch (err: any) {
      console.error('Error generating AI reflection:', err);
      setErrorMsg(err?.message || 'Unable to connect to reflection model. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleExtractAction = async (text: string, index: number) => {
    const cleanAction = text.split('\n')[0].replace(/^###\s*|\*+\s*|\-\s*|👣\s*|⚡\s*/g, '').trim();
    if (cleanAction) {
      await onAddActionItem(cleanAction, 'medium');
      setAddedActionIndex(index);
      setTimeout(() => setAddedActionIndex(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-stone-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToJournal && (
              <button
                onClick={onBackToJournal}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {/* Quick Segmented Mode Selector */}
            <div className="inline-flex p-1 rounded-xl bg-stone-100 dark:bg-zinc-800/80 border border-stone-200/70 dark:border-zinc-700/60">
              <button
                id="mode-agent-btn"
                type="button"
                onClick={() => setActiveMode('agent')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'agent'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Agent</span>
              </button>

              <button
                id="mode-explore-btn"
                type="button"
                onClick={() => setActiveMode('explore')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'explore'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>AI Explore</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            {activeMode === 'agent' ? 'Autonomous Reflection Agent' : 'Cognitive Reflection Dialogue'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {activeMode === 'agent'
              ? 'Autonomous synthesis, cognitive pulse tracking, and proactive micro-action planning across your reflections.'
              : 'Engage in structured, multi-turn inquiry with 6 tailored philosophical and coaching personas.'}
          </p>
        </div>

        {activeEntry && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2 max-w-md">
            <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="truncate flex-1">
              <span className="text-stone-400 dark:text-zinc-500 block text-[10px]">Active Reflection:</span>
              <span className="font-medium truncate block">{activeEntry.title}</span>
            </div>
            {activeEntry.location?.name && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px] shrink-0 font-medium">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span className="max-w-[100px] truncate">{activeEntry.location.name}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Agent Type Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Agent Type</span>
          </label>
          <span className="text-[11px] text-stone-400 dark:text-zinc-500">
            {activeMode === 'agent' ? 'Autonomous cognitive processing' : 'Interactive guided exploration'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Agent Option (Left) */}
          <button
            id="agent-type-agent-btn"
            type="button"
            onClick={() => setActiveMode('agent')}
            className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group cursor-pointer ${
              activeMode === 'agent'
                ? 'bg-white dark:bg-[#1C1C1F] border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-[#1C1C1F]/60 border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 hover:bg-stone-50/50 dark:hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    activeMode === 'agent'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                    Agent
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      Autonomous
                    </span>
                  </h3>
                </div>
              </div>
              {activeMode === 'agent' && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Synthesizes longitudinal reflection trends, tracks cognitive rhythm, and proactively drafts high-impact micro-actions.
            </p>
          </button>

          {/* AI Explore Option (Right) */}
          <button
            id="agent-type-explore-btn"
            type="button"
            onClick={() => setActiveMode('explore')}
            className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group cursor-pointer ${
              activeMode === 'explore'
                ? 'bg-white dark:bg-[#1C1C1F] border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-[#1C1C1F]/60 border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 hover:bg-stone-50/50 dark:hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    activeMode === 'explore'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                    AI Explore
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                      Multi-Turn Dialogue
                    </span>
                  </h3>
                </div>
              </div>
              {activeMode === 'explore' && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Engage in multi-turn philosophical, empathetic, and coaching exploration with 6 specialized cognitive personas.
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: AUTONOMOUS AGENT VIEW                             */}
      {/* ========================================================= */}
      {activeMode === 'agent' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Autonomous Synthesis Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
                    Autonomous Cognitive Pulse
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                    Proactive synthesis based on your {allEntries.length || 1} reflections
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAgentSynthesis}
                disabled={isAgentSynthesizing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-medium transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAgentSynthesizing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze Stream</span>
              </button>
            </div>

            {isAgentSynthesizing && !agentSynthesis ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-stone-500 dark:text-zinc-400">The agent is synthesizing your reflection stream...</p>
              </div>
            ) : agentSynthesis ? (
              <div className="space-y-4">
                {/* Headline Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 leading-snug">
                    &quot;{agentSynthesis.statusHeadline}&quot;
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Observations */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200/60 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Key Longitudinal Observations</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-300">
                      {agentSynthesis.keyObservations.map((obs, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Continuity Insight & Proactive Prompt */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200/60 dark:border-zinc-800 space-y-2.5">
                    <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Rhythm & Proactive Prompt</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-zinc-300">
                      {agentSynthesis.streakInsight}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700 text-xs italic text-stone-700 dark:text-stone-200">
                      &quot;{agentSynthesis.proactivePrompt}&quot;
                    </div>
                  </div>
                </div>

                {/* Suggested Micro-Actions */}
                {agentSynthesis.suggestedMicroActions && agentSynthesis.suggestedMicroActions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Agent Recommended Micro-Actions:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {agentSynthesis.suggestedMicroActions.map((act, idx) => {
                        const isAdded = addedAgentActionIndex === idx;
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className="font-medium text-stone-900 dark:text-white truncate">{act.title}</p>
                              {act.rationale && (
                                <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">{act.rationale}</p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                await onAddActionItem(act.title, act.priority || 'medium');
                                setAddedAgentActionIndex(idx);
                                setTimeout(() => setAddedAgentActionIndex(null), 2500);
                              }}
                              disabled={isAdded}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                                isAdded
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Action</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Interactive Autonomous Agent Workspace */}
          <div className="rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col min-h-[420px] max-h-[560px] overflow-hidden">
            <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/80 border-b border-stone-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Autonomous Agent Command Workspace</span>
              </div>
              <span className="text-[11px] text-stone-400 dark:text-zinc-500">Autonomous Reasoning Enabled</span>
            </div>

            {/* Agent Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {agentChatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${item.role === 'agent' ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                      item.role === 'agent'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-200'
                    }`}
                  >
                    {item.role === 'agent' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                      item.role === 'agent'
                        ? 'bg-stone-50 dark:bg-zinc-900/90 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-stone-200'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    <div className="prose prose-stone dark:prose-invert prose-xs sm:prose-sm max-w-none">
                      <ReactMarkdown>{item.text}</ReactMarkdown>
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-zinc-500 text-right">
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}

              {isAgentChatting && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Analyzing your journal stream and formulating actionable strategy...</span>
                  </div>
                </div>
              )}

              <div ref={agentChatEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-4 py-2 bg-stone-50/50 dark:bg-zinc-900/40 border-t border-stone-100 dark:border-zinc-800/60 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-stone-400 shrink-0">Command Starters:</span>
              <button
                onClick={() => handleSendAgentChat("Synthesize my main cognitive challenges this week.")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 hover:border-indigo-400 whitespace-nowrap"
              >
                Summarize challenges
              </button>
              <button
                onClick={() => handleSendAgentChat("Extract 3 immediate micro-actions from my recent reflections.")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 hover:border-indigo-400 whitespace-nowrap"
              >
                Extract 3 micro-actions
              </button>
              <button
                onClick={() => handleSendAgentChat("Identify potential cognitive blind spots in my thinking.")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 hover:border-indigo-400 whitespace-nowrap"
              >
                Find cognitive blind spots
              </button>
            </div>

            {/* Agent Input Bar */}
            <div className="p-3 bg-stone-50/80 dark:bg-zinc-900/60 border-t border-stone-200/80 dark:border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAgentChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="agent-command-input"
                  type="text"
                  placeholder="Direct the autonomous agent (e.g. 'Analyze my emotional trajectory', 'Plan tomorrow's reflection')..."
                  value={agentPromptInput}
                  onChange={(e) => setAgentPromptInput(e.target.value)}
                  disabled={isAgentChatting}
                  className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder:text-stone-400 disabled:opacity-50"
                />
                <button
                  id="agent-send-btn"
                  type="submit"
                  disabled={isAgentChatting || !agentPromptInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                  title="Send to Autonomous Agent"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: AI EXPLORE (6 SPECIALIZED PERSONAS)               */}
      {/* ========================================================= */}
      {activeMode === 'explore' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Persona Selection Ribbon */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              Choose AI Reflection Persona (6 Perspectives):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {personas.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    id={`persona-btn-${p.id.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#1C1C1F] border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white/60 dark:bg-[#1C1C1F]/60 border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.color}`}>
                        {p.badge}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-white">{p.name}</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Thread Canvas */}
          <div className="rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col min-h-[460px] max-h-[600px] overflow-hidden">
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {conversation.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                    Begin dialogue with the {selectedPersona}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                    {activeEntry?.content
                      ? `Your reflection "${activeEntry.title}" is ready. Click below to begin exploring.`
                      : 'Type your reflection thought or choose an exploration starter below.'}
                  </p>

                  {activeEntry?.content && (
                    <button
                      id="start-reflection-dialogue-btn"
                      onClick={() => handleSendMessage()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reflect on this entry</span>
                    </button>
                  )}
                </div>
              ) : (
                conversation.map((msg, idx) => {
                  const isAI = msg.role === 'model';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                          isAI
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-200'
                        }`}
                      >
                        {isAI ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                          isAI
                            ? 'bg-stone-50 dark:bg-zinc-900/90 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-stone-200'
                            : 'bg-indigo-600 text-white shadow-xs'
                        }`}
                      >
                        <div className="prose prose-stone dark:prose-invert prose-xs sm:prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* AI Message Footer Tools */}
                        {isAI && (
                          <div className="pt-2.5 mt-2 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-stone-400 dark:text-zinc-500">
                            <span className="text-[10px]">
                              {msg.modelUsed ? `Reflected via ${msg.modelUsed}` : 'Gemini Reflection'}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyMessage(msg.content, msg.id)}
                                className="hover:text-stone-600 dark:hover:text-stone-300 flex items-center gap-1"
                                title="Copy response"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>

                              <button
                                onClick={() => handleExtractAction(msg.content, idx)}
                                className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
                                title="Create Action Item"
                              >
                                {addedActionIndex === idx ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                                <span>{addedActionIndex === idx ? 'Added Action' : '+ Action Step'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>The {selectedPersona} is carefully reflecting...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-stone-50/80 dark:bg-zinc-900/60 border-t border-stone-200/80 dark:border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="ai-prompt-input"
                  type="text"
                  placeholder={`Ask the ${selectedPersona} a question or explore a thought...`}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder:text-stone-400 disabled:opacity-50"
                />
                <button
                  id="ai-send-prompt-btn"
                  type="submit"
                  disabled={isLoading || (!inputPrompt.trim() && !activeEntry?.content)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                  title="Send to reflection persona"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
