import React from 'react';
import { ShieldCheck, X, AlertTriangle, CheckCircle2, Lock, Cpu, Database, Network, Key } from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const threats = [
    {
      zone: '1. Input Surfaces',
      icon: AlertTriangle,
      scope: 'User prompts, reflection text, custom titles, category selections, external API payloads.',
      risks: 'Prompt injection (OWASP LLM01), XSS payload injection in rich journal fields, malformed or oversized payloads triggering resource starvation.',
      countermeasures: 'Top-level request body parsing with strict size bounds (10MB), server-side input sanitization, encoding LLM markdown output safely with react-markdown, and explicit typing across all endpoints.',
    },
    {
      zone: '2. Planning & Reasoning',
      icon: Cpu,
      scope: 'System prompt instructions, persona modes (Coach, Explorer, Brainstormer, Synthesizer), model routing.',
      risks: 'System instruction leakage, persona subversion or jailbreak attempts via user reflection entries.',
      countermeasures: 'Strict server-side persona system instructions framing user entries as plain text data blocks, clear role segregation, and immutable backend model parameters.',
    },
    {
      zone: '3. Tool Execution & Model Resilience',
      icon: ShieldCheck,
      scope: 'Server-side Gemini generateContent API calls, fallback ladders, and status code handling.',
      risks: 'API quota exhaustion, transient 503/429 failures, SSRF via uncontrolled API routing, credential exposure.',
      countermeasures: 'Automated 4-tier model fallback ladder (gemini-3.6-flash → gemini-3.1-flash-lite → gemini-flash-latest → gemini-3.7-flash), zero client-side API key leakage, Express proxy isolation.',
    },
    {
      zone: '4. Memory & State (Database Isolation)',
      icon: Database,
      scope: 'Cloud Firestore persistence at /users/{userId}/entries/{entryId}, session tokens, local cache.',
      risks: 'Cross-user data leakage (OWASP A01 Broken Access Control), unauthorized read/writes, corrupt undefined writes crashing driver.',
      countermeasures: 'Deterministic owner-bound Firestore security rules (request.auth.uid == userId), strict undefined-stripping utility (cleanPayload), client-side Auth listener verification.',
    },
    {
      zone: '5. Inter-System Communication & Auth',
      icon: Network,
      scope: 'Firebase Auth Google Sign-In tokens, Google Secret Manager, Cloud Run container environment.',
      risks: 'Credential exposure in Git, hardcoded tokens in source code, token spoofing or interception.',
      countermeasures: 'Zero hardcoded secrets; credentials injected dynamically via Secret Manager and .env, federated Google OAuth (no stored plaintext passwords), encrypted HTTPS transport.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="threat-model-modal-container"
        className="bg-white rounded-2xl max-w-4xl w-full border border-stone-200 shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Agentic Threat Model: 5 Threat Zones</h2>
              <p className="text-xs text-stone-300">OWASP Top 10 Web & LLM Security Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-3 w-1/5">Threat Zone</th>
                  <th className="p-3 w-1/4">Scope & Assets</th>
                  <th className="p-3 w-1/4">Identified Threats</th>
                  <th className="p-3 w-1/3">Security Countermeasures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs sm:text-xs text-stone-700">
                {threats.map((t, idx) => {
                  const Icon = t.icon;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3 align-top font-semibold text-stone-900 flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{t.zone}</span>
                      </td>
                      <td className="p-3 align-top text-stone-600 leading-relaxed">
                        {t.scope}
                      </td>
                      <td className="p-3 align-top text-rose-800 bg-rose-50/50 rounded-lg font-mono text-[11px] leading-relaxed">
                        {t.risks}
                      </td>
                      <td className="p-3 align-top text-emerald-900 bg-emerald-50/40 rounded-lg leading-relaxed">
                        <div className="flex items-start gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{t.countermeasures}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Firestore Security Rules Block */}
          <div className="mt-6 p-4 bg-stone-900 rounded-xl text-stone-200 border border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-300 font-bold">Deployed firestore.rules (Isolation Verification):</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Active in Production</span>
            </div>
            <pre className="text-[11px] font-mono bg-stone-950 p-3 rounded-lg overflow-x-auto text-stone-300">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Threat Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
