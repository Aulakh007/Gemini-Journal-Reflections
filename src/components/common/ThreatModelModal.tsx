import React from 'react';
import { Shield, Lock, X, Database, Key, Server, Cpu, CheckCircle } from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const threatZones = [
    {
      zone: '1. Input Surfaces',
      icon: Cpu,
      risks: 'Malicious prompt injections, oversized journal bodies, cross-site scripting (XSS) attempts.',
      countermeasures: 'Top-level request body parsing with strict size limits (10MB), string escaping, client markdown sanitization, no direct eval sinks.'
    },
    {
      zone: '2. Planning & Reasoning',
      icon: Lock,
      risks: 'System instruction overrides, persona hijacking, unauthorized command extraction.',
      countermeasures: 'Strict persona guardrails, multi-turn role structuring with distinct system boundaries, JSON schema enforcement for insights.'
    },
    {
      zone: '3. Tool Execution',
      icon: Server,
      risks: 'SSRF, privilege escalation, unverified API endpoints.',
      countermeasures: 'No dynamic code execution; all AI responses are rendered as safe text/markdown, parameterized REST handlers.'
    },
    {
      zone: '4. Memory & State',
      icon: Database,
      risks: 'Cross-tenant user journal access, unauthenticated data snooping, stale session theft.',
      countermeasures: 'Zero insecure wildcards. Explicit subcollection security rules enforcing request.auth.uid == userId at /users/{userId}/entries.'
    },
    {
      zone: '5. Inter-System Communication',
      icon: Key,
      risks: 'Gemini API key leaks, insecure third-party token exposure.',
      countermeasures: 'Zero hardcoded secrets. Gemini API key is isolated server-side and retrieved via GCP Secret Manager / runtime environment.'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                Agentic Threat Model & Security Controls
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                5-Zone Security Mapping & Defense-in-Depth Specification
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

        {/* Threat Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-400">
                <th className="py-2.5 px-3 font-semibold">Threat Zone</th>
                <th className="py-2.5 px-3 font-semibold">Identified Vulnerabilities & Risks</th>
                <th className="py-2.5 px-3 font-semibold">Implemented Countermeasures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
              {threatZones.map((tz, idx) => {
                const Icon = tz.icon;
                return (
                  <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/20">
                    <td className="py-3 px-3 font-medium text-stone-900 dark:text-white whitespace-nowrap align-top flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{tz.zone}</span>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400 align-top leading-relaxed">
                      {tz.risks}
                    </td>
                    <td className="py-3 px-3 text-stone-800 dark:text-stone-200 font-normal align-top leading-relaxed">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium mr-1">
                        <CheckCircle className="w-3 h-3" />
                      </span>
                      {tz.countermeasures}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
          >
            Close Security Audit
          </button>
        </div>
      </div>
    </div>
  );
};
