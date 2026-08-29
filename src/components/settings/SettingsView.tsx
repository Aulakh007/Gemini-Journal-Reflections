import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  Sun, 
  Moon, 
  Check, 
  ExternalLink, 
  Database, 
  Key, 
  Server, 
  Sparkles,
  RefreshCw,
  FileCode,
  AlertTriangle,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { 
  UserProfile, 
  UserPreferences, 
  AIPersona, 
  JournalMood, 
  JournalEntry, 
  ActionItem,
  NotificationWebhookConfig 
} from '../../types';

interface SettingsViewProps {
  user: UserProfile | null;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  entries: JournalEntry[];
  actions: ActionItem[];
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  onClearAllData: () => Promise<void>;
  onSignOut: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  preferences,
  onUpdatePreferences,
  entries,
  actions,
  theme,
  onToggleTheme,
  onClearAllData,
  onSignOut,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Webhook state
  const defaultWebhookConfig: NotificationWebhookConfig = preferences.webhookConfig || {
    enabled: false,
    provider: 'discord',
    webhookUrl: '',
    notifyOnNewEntry: true,
    notifyOnActionItem: true,
    notifyOnInsight: false,
    privacyLevel: 'minimal_metadata',
  };
  const [webhookConfig, setWebhookConfig] = useState<NotificationWebhookConfig>(defaultWebhookConfig);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const personas: AIPersona[] = [
    'Socratic Explorer', 
    'Empathetic Listener', 
    'Pattern Finder', 
    'Practical Coach',
    'Perspective Shifter',
    'Future Self'
  ];
  const moods: JournalMood[] = ['Calm', 'Reflective', 'Inspired', 'Grateful', 'Energized', 'Challenged', 'Low', 'Frustrated', 'Anxious'];

  const handleSaveWebhookConfig = async (newConfig: NotificationWebhookConfig) => {
    setWebhookConfig(newConfig);
    await onUpdatePreferences({ webhookConfig: newConfig });
  };

  const handleTestWebhook = async () => {
    if (!webhookConfig.webhookUrl) {
      setWebhookTestFeedback({ status: 'error', message: 'Please enter a webhook URL first.' });
      return;
    }

    setIsTestingWebhook(true);
    setWebhookTestFeedback(null);

    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookConfig.webhookUrl,
          provider: webhookConfig.provider,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWebhookTestFeedback({ status: 'success', message: 'Ping received successfully by your webhook channel!' });
        await handleSaveWebhookConfig({
          ...webhookConfig,
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'success',
        });
      } else {
        setWebhookTestFeedback({ status: 'error', message: data.error?.message || 'Webhook rejected test request.' });
      }
    } catch (err: any) {
      setWebhookTestFeedback({ status: 'error', message: err?.message || 'Could not dispatch webhook test.' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Export all user reflections as JSON
  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
        },
        totalEntries: entries.length,
        totalActions: actions.length,
        entries,
        actions,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reflectai-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    setIsExporting(true);
    try {
      let md = `# ReflectAI Journal & Reflection Export\nGenerated: ${new Date().toLocaleString()}\nUser: ${user?.displayName || user?.email}\n\n---\n\n`;

      entries.forEach((entry, idx) => {
        md += `## ${idx + 1}. ${entry.title}\n`;
        md += `- **Date:** ${new Date(entry.createdAt).toLocaleString()}\n`;
        md += `- **Mood:** ${entry.mood} | **Category:** ${entry.category}\n`;
        if (entry.tags && entry.tags.length > 0) {
          md += `- **Tags:** ${entry.tags.map(t => `#${t}`).join(', ')}\n`;
        }
        md += `\n### Content\n${entry.content}\n\n`;

        if (entry.messages && entry.messages.length > 0) {
          md += `### AI Reflections\n`;
          entry.messages.forEach(m => {
            md += `**[${m.role === 'model' ? 'AI' : 'User'}]:**\n${m.content}\n\n`;
          });
        }

        if (entry.executiveInsight || entry.summary) {
          md += `### Executive Summary\n${entry.executiveInsight?.summary || entry.summary}\n\n`;
        }

        md += `---\n\n`;
      });

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reflectai-reflections-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Markdown export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200/60 dark:border-zinc-800/60">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
          Preferences & Privacy
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Manage your account settings, visual appearance, and review security boundaries.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          Account & Authentication
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border border-stone-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-base">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                {user?.displayName || 'Reflective Mind'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                <ShieldCheck className="w-3 h-3" /> Authenticated via Google OAuth
              </span>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-3.5 py-1.5 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 transition-all self-start sm:self-auto cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Application Preferences Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-5">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Application Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Visual Theme */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Visual Theme</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Current: {theme === 'dark' ? 'Dark' : 'Light'}</p>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-[#1C1C1F] border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Default AI Persona */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1.5">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Default AI Persona</p>
            <select
              value={preferences.defaultPersona}
              onChange={(e) => onUpdatePreferences({ defaultPersona: e.target.value as AIPersona })}
              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#1C1C1F] border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {personas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Default Reflection Mood */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1.5">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Default Mood</p>
            <select
              value={preferences.defaultMood}
              onChange={(e) => onUpdatePreferences({ defaultMood: e.target.value as JournalMood })}
              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#1C1C1F] border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 font-medium focus:outline-none"
            >
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* External Webhook Notifications (Slack / Discord / Custom) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              External Webhook Notifications
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Receive private reflection confirmations and action reminders in your personal Discord, Slack, or webhook channel
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={webhookConfig.enabled}
              onChange={(e) => handleSaveWebhookConfig({ ...webhookConfig, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              {webhookConfig.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {webhookConfig.enabled && (
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-zinc-800/80 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 dark:text-stone-200">Webhook Platform</label>
                <select
                  value={webhookConfig.provider}
                  onChange={(e) => handleSaveWebhookConfig({ ...webhookConfig, provider: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-stone-200 font-medium focus:outline-none"
                >
                  <option value="discord">Discord Channel Webhook</option>
                  <option value="slack">Slack Incoming Webhook</option>
                  <option value="custom">Custom HTTPS Webhook (JSON)</option>
                </select>
              </div>

              {/* Privacy Level */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 dark:text-stone-200">Privacy & Payload Scope</label>
                <select
                  value={webhookConfig.privacyLevel}
                  onChange={(e) => handleSaveWebhookConfig({ ...webhookConfig, privacyLevel: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-stone-200 font-medium focus:outline-none"
                >
                  <option value="minimal_metadata">Minimal Metadata (Date & Title only)</option>
                  <option value="include_summary">Include Short AI Reflection Summary</option>
                </select>
              </div>
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800 dark:text-stone-200">Webhook Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/services/..."
                  value={webhookConfig.webhookUrl}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, webhookUrl: e.target.value })}
                  onBlur={() => handleSaveWebhookConfig(webhookConfig)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || !webhookConfig.webhookUrl}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium text-xs hover:opacity-90 transition-all shrink-0 inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  {isTestingWebhook ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test Ping</span>
                </button>
              </div>
            </div>

            {/* Test Status Feedback Banner */}
            {webhookTestFeedback && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                webhookTestFeedback.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {webhookTestFeedback.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{webhookTestFeedback.message}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security & Threat Boundaries Transparency Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500" />
          Security Architecture & Privacy Guarantees
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Tenant Firestore Isolation
            </span>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              All documents are strictly scoped under <code className="text-indigo-600 dark:text-indigo-400">/users/{'{userId}'}/entries</code>. Rules enforce <code className="text-indigo-600 dark:text-indigo-400">request.auth.uid == userId</code> on all operations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Zero Hardcoded Secrets
            </span>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Gemini API keys are dynamically loaded server-side through GCP Secret Manager / runtime environment variables and never exposed to client browsers.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              GCP Cloud Run Ready
            </span>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Stateless Node/Express container with port 3000 ingress binding, CORS protection, and secure payload middleware.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              No Data Reselling
            </span>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Your personal reflections are private to your Google account. We do not sell data or use your personal journals for public AI training.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Export Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-500" />
          Data Portability & Management
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="export-json-btn"
            onClick={handleExportJSON}
            disabled={isExporting || entries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export as JSON ({entries.length} entries)</span>
          </button>

          <button
            id="export-md-btn"
            onClick={handleExportMarkdown}
            disabled={isExporting || entries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export as Markdown</span>
          </button>

          <button
            id="clear-data-btn"
            onClick={() => setShowClearConfirm(true)}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 transition-all disabled:opacity-50 ml-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {showClearConfirm && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
            <div className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Are you sure you want to delete all your reflection history? This action cannot be undone.</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 text-xs rounded-lg bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
