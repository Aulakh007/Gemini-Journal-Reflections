import React, { useState } from 'react';
import { BookOpenCheck, X, CheckSquare, Sparkles, Database, Lock, Play, ArrowRight } from 'lucide-react';

interface WalkthroughGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughGuideModal: React.FC<WalkthroughGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'auth' | 'journal' | 'chat' | 'summary' | 'persistence'>('auth');

  const testSuites = {
    auth: {
      title: '1. Authentication & Tenant Verification Flow',
      steps: [
        {
          id: 'AUTH-01',
          name: 'Landing Page Arrival',
          action: 'Navigate to application root URL.',
          expected: 'Landing hero displays with value proposition, security highlights, and "Continue with Google Sign-In" action. No private entries are visible.',
        },
        {
          id: 'AUTH-02',
          name: 'Google Identity Sign-In',
          action: 'Click "Continue with Google Sign-In" and complete Google account authorization.',
          expected: 'Firebase Auth transitions state. User is redirected to private Dashboard with profile photo, name, and isolated Firestore listener enabled.',
        },
        {
          id: 'AUTH-03',
          name: 'Sign Out & Session Teardown',
          action: 'Click the Sign Out icon in the top navigation header.',
          expected: 'Auth session clears immediately. App returns to landing page. Dashboard state unmounts and snapshot listeners unsubscribe cleanly.',
        },
      ],
    },
    journal: {
      title: '2. Journal Entry Composition & Mood Tagging',
      steps: [
        {
          id: 'JRNL-01',
          name: 'New Entry Initialization',
          action: 'Click "+ New Entry" button in header or sidebar.',
          expected: 'A blank journal template is generated with title "Untitled Reflection", default category "Daily Reflection", and a fresh unique entry ID.',
        },
        {
          id: 'JRNL-02',
          name: 'Rich Editing & Mood Selection',
          action: 'Type custom title (e.g., "Navigating Career Crossroads"), choose mood pill "Contemplative", and write reflections in the body textarea.',
          expected: 'Title, mood, and content update in real-time. Word/character counter accurately updates.',
        },
        {
          id: 'JRNL-03',
          name: 'AI Spark Prompts Generator',
          action: 'Click "Generate Spark Prompts" button above the text area.',
          expected: 'API requests `/api/gemini/prompts` and populates 4 tailored prompts based on chosen mood and category. Clicking a prompt appends it to the body.',
        },
      ],
    },
    chat: {
      title: '3. Multi-Turn AI Reflection with Gemini 3.6 Flash',
      steps: [
        {
          id: 'CHAT-01',
          name: 'First Reflection Turn',
          action: 'Type a question in the reflection chat input (e.g. "What blind spots should I consider?") or click a quick suggestion chip, then click Send.',
          expected: 'Input buffer is locked with loading spinner. Gemini returns an empathetic, structured Markdown reply via resilient fallback helper. User message + AI response are appended to conversation.',
        },
        {
          id: 'CHAT-02',
          name: 'Persona Switching',
          action: 'Switch AI Persona dropdown between "Empathetic Coach", "Socratic Explorer", and "Strategic Brainstormer". Send a follow-up query.',
          expected: 'Gemini adopts the selected cognitive role, maintaining conversation history while tailoring its tone and framing.',
        },
        {
          id: 'CHAT-03',
          name: 'Multi-turn Context Retention',
          action: 'Ask a follow-up referencing earlier points (e.g. "Given what I said about my team, how should I start the conversation?").',
          expected: 'Gemini references earlier messages accurately, demonstrating complete multi-turn dialogue memory.',
        },
      ],
    },
    summary: {
      title: '4. Executive Synthesis & Deep Summary Flow',
      steps: [
        {
          id: 'SUMM-01',
          name: 'Generate Structured Synthesis',
          action: 'Click "Synthesize Summary" button in the reflection workspace header.',
          expected: 'Modal opens showing Gemini generated synthesis: Executive Summary, Key Insights & Themes, Actionable Next Steps, and Deep Reflection Question.',
        },
        {
          id: 'SUMM-02',
          name: 'Attach Summary to Document',
          action: 'Click "Save Summary to Entry" in modal.',
          expected: 'Summary is stored in the Firestore entry document, badge appears in history sidebar, and summary persists across reloads.',
        },
      ],
    },
    persistence: {
      title: '5. Cloud Firestore Persistence & User Isolation Flow',
      steps: [
        {
          id: 'PERS-01',
          name: 'Zero Undefined Write Verification',
          action: 'Save an entry with optional fields left blank.',
          expected: 'Payload is passed through `cleanPayload` sanitizer, stripping undefined values without crashing Firestore SDK.',
        },
        {
          id: 'PERS-02',
          name: 'Tenant Isolation Verification',
          action: 'Sign in with User A, write 2 entries. Sign out, sign in with User B.',
          expected: 'User B sees only their own entries (empty if fresh). User A entries are completely inaccessible due to `/users/{userId}/...` path isolation & security rules.',
        },
        {
          id: 'PERS-03',
          name: 'Search, Filter & Delete Operations',
          action: 'Type query in search bar, filter by category/mood. Delete an entry via trash icon.',
          expected: 'List filters instantly in memory. Delete triggers confirmation dialog; on confirm, doc is permanently removed from `/users/{userId}/entries/{entryId}`.',
        },
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="walkthrough-guide-modal-container"
        className="bg-white rounded-2xl max-w-4xl w-full border border-stone-200 shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Functional Stability & Test Walkthroughs</h2>
              <p className="text-xs text-stone-300">Complete verification guide for all user interactions & processes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'auth', label: '1. Auth & Tenant' },
            { id: 'journal', label: '2. Journaling & Prompts' },
            { id: 'chat', label: '3. Gemini Multi-Turn' },
            { id: 'summary', label: '4. AI Summaries' },
            { id: 'persistence', label: '5. Firestore Isolation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-stone-900 bg-white text-stone-900 shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Test Steps Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              {testSuites[activeTab].title}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Execute each step below in order to verify functional stability and error handling.
            </p>
          </div>

          <div className="space-y-3">
            {testSuites[activeTab].steps.map((step) => (
              <div key={step.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-200 text-stone-800 rounded">
                      {step.id}
                    </span>
                    <span className="text-sm font-semibold text-stone-900">{step.name}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready to Test
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                    <span className="font-semibold text-stone-700 block mb-1 text-[11px] uppercase tracking-wider">
                      User Action:
                    </span>
                    <p className="text-stone-600 leading-relaxed">{step.action}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                    <span className="font-semibold text-emerald-800 block mb-1 text-[11px] uppercase tracking-wider">
                      Expected System Outcome:
                    </span>
                    <p className="text-stone-700 leading-relaxed">{step.expected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <span className="text-xs text-stone-500">
            Total 15 Automated/Manual Verification Points
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
