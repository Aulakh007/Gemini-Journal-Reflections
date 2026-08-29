import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  HelpCircle, 
  Lightbulb, 
  Compass, 
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { JournalEntry, ChatMessage, AIPersona } from '../types';

interface ChatReflectionProps {
  entry: JournalEntry;
  onAddMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
}

export const ChatReflection: React.FC<ChatReflectionProps> = ({
  entry,
  onAddMessage,
  onClearChat,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>('Empathetic Coach');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string>('gemini-2.5-flash');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const personas: AIPersona[] = [
    'Empathetic Coach',
    'Socratic Explorer',
    'Strategic Brainstormer',
    'Summarizer & Synthesizer',
  ];

  const quickQuestions = [
    'What blind spots might I be overlooking?',
    'Brainstorm 3 practical, low-friction next steps',
    'How can I reframe this situation with self-compassion?',
    'What underlying emotional pattern stands out here?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.messages, isLoading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text && !entry.content) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text || 'Please reflect on my journal entry above.',
      timestamp: new Date().toISOString(),
    };

    onAddMessage(userMessage);
    if (!promptToSend) {
      setInputPrompt('');
    }
    setIsLoading(true);

    try {
      // Build conversation array including all past turns
      const currentConversation = [...entry.messages, userMessage];

      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalTitle: entry.title,
          journalContent: entry.content,
          category: entry.category,
          mood: entry.mood,
          conversation: currentConversation,
          persona: selectedPersona,
          userPrompt: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const modelMessage: ChatMessage = {
          id: `msg_model_${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toISOString(),
          modelUsed: data.modelUsed || 'gemini-2.5-flash',
        };
        if (data.modelUsed) {
          setLastModelUsed(data.modelUsed);
        }
        onAddMessage(modelMessage);
      } else {
        throw new Error(data.error || 'No reply received');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        content: `*Apologies, I encountered an issue connecting to Gemini: ${err.message || 'Network error'}. Please try again.*`,
        timestamp: new Date().toISOString(),
      };
      onAddMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/60">
      {/* Reflection Header */}
      <div className="p-4 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900">Gemini Cognitive Reflection</h3>
            <span className="text-[10px] text-stone-500 font-mono">
              Model: {lastModelUsed}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona Selector */}
          <select
            id="chat-persona-select"
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as AIPersona)}
            className="text-xs py-1 px-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none"
          >
            {personas.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {entry.messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear dialogue history"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {entry.messages.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-stone-800">Start a Reflective Dialogue</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Ask Gemini to analyze emotional themes, brainstorm solutions, or suggest self-inquiry questions based on your journal entry.
            </p>

            {/* Quick Inspiration Chips */}
            <div className="mt-5 space-y-1.5 max-w-sm mx-auto text-left">
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                Suggested Prompts:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-white hover:bg-stone-100/80 border border-stone-200/80 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs flex items-center justify-between group"
                >
                  <span className="truncate">"{q}"</span>
                  <Sparkles className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          entry.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-stone-900 to-amber-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`
                    max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs relative group
                    ${isUser 
                      ? 'bg-stone-900 text-white rounded-tr-xs' 
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs'
                    }
                  `}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-stone max-w-none text-xs">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}

                  {/* Metadata and Copy */}
                  <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between text-[10px] opacity-70">
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:opacity-100 transition-opacity p-0.5"
                        title="Copy reflection"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-3 text-xs text-stone-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Gemini is reflecting on your entry...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-stone-200 bg-white">
        <div className="relative flex items-center">
          <textarea
            id="chat-input-textarea"
            rows={2}
            placeholder={`Ask ${selectedPersona} a question or explore an angle...`}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none pr-12 pl-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400"
          />
          <button
            id="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputPrompt.trim() && !entry.content)}
            className="absolute right-2 p-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-300 rounded-lg transition-all active:scale-90"
            title="Send reflection request"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Persona: {selectedPersona}</span>
        </div>
      </div>
    </div>
  );
};
