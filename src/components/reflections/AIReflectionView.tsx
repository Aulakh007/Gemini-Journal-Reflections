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
  CheckCircle2
} from 'lucide-react';
import type { JournalEntry, AIPersona, ChatMessage, PersonaDetails, ActionItem } from '../../types';

interface AIReflectionViewProps {
  activeEntry: JournalEntry | null;
  onSaveEntryMessages: (entry: JournalEntry, messages: ChatMessage[]) => Promise<void>;
  onAddActionItem: (title: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  onBackToJournal?: () => void;
  defaultPersona?: AIPersona;
}

export const AIReflectionView: React.FC<AIReflectionViewProps> = ({
  activeEntry,
  onSaveEntryMessages,
  onAddActionItem,
  onBackToJournal,
  defaultPersona = 'Socratic Explorer',
}) => {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(defaultPersona);
  const [conversation, setConversation] = useState<ChatMessage[]>(activeEntry?.messages || []);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [addedActionIndex, setAddedActionIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const personas: PersonaDetails[] = [
    {
      id: 'Socratic Explorer',
      name: 'Socratic Explorer',
      tagline: 'Uncover Assumptions',
      description: 'Helps you examine underlying beliefs and look at challenges from fresh angles with thoughtful inquiry.',
      badge: 'Inquiry',
      iconName: 'Compass',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      id: 'Empathetic Listener',
      name: 'Empathetic Listener',
      tagline: 'Emotional Processing',
      description: 'Helps you slow down, validate difficult emotions, and practice mindful self-compassion without rushing.',
      badge: 'Compassion',
      iconName: 'HeartHandshake',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60',
    },
    {
      id: 'Pattern Finder',
      name: 'Pattern Finder',
      tagline: 'Connect the Dots',
      description: 'Highlights recurring cognitive themes, emotional triggers, and subtle behavioral habits across your thoughts.',
      badge: 'Synthesis',
      iconName: 'GitMerge',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/60',
    },
    {
      id: 'Practical Coach',
      name: 'Practical Coach',
      tagline: 'Actionable Momentum',
      description: 'Turns reflective insights into realistic, grounded micro-steps with clear momentum and accountability.',
      badge: 'Action',
      iconName: 'Target',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
    },
  ];

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  // Handle Send Message
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
    // Extract first sentence or bullet
    const cleanAction = text.split('\n')[0].replace(/^###\s*|\*+\s*|\-\s*|👣\s*|⚡\s*/g, '').trim();
    if (cleanAction) {
      await onAddActionItem(cleanAction, 'medium');
      setAddedActionIndex(index);
      setTimeout(() => setAddedActionIndex(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Context Bar */}
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              AI Explorer
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Cognitive Reflection Dialogue
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Engage in structured, multi-turn inquiry with tailored philosophical and coaching personas.
          </p>
        </div>

        {activeEntry && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2 max-w-sm">
            <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="truncate">
              <span className="text-stone-400 dark:text-zinc-500 block text-[10px]">Active Reflection:</span>
              <span className="font-medium truncate block">{activeEntry.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Persona Selection Ribbon */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-500 dark:text-zinc-400">Choose AI Reflection Persona:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col min-h-[460px] max-h-[600px] overflow-hidden">
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
  );
};
