import React from 'react';
import { Sparkles, X, Check, Save, Download, Copy, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isGenerating: boolean;
  onRegenerate: () => void;
  onSaveToEntry: () => void;
  isSaved?: boolean;
  modelUsed?: string;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  isGenerating,
  onRegenerate,
  onSaveToEntry,
  isSaved = false,
  modelUsed = 'gemini-2.5-flash',
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-summary-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="summary-modal-container"
        className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Executive Synthesis & Key Takeaways</h3>
                <span className="text-[10px] font-mono uppercase bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700/60">
                  {modelUsed}
                </span>
              </div>
              <p className="text-xs text-stone-300">Generated from journal body and reflection dialogue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-stone-800">Synthesizing Reflection Themes & Insights...</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Gemini is extracting emotional nuances, core takeaways, and actionable next steps.
              </p>
            </div>
          ) : (
            <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed">
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 mb-4 text-xs text-amber-900">
                💡 <strong>Tip:</strong> This structured synthesis can be saved directly to your journal document in Firestore so you can reference it anytime.
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <Markdown>{summary}</Markdown>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              id="summary-modal-copy-btn"
              onClick={handleCopy}
              disabled={isGenerating || !summary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              id="summary-modal-download-btn"
              onClick={handleDownload}
              disabled={isGenerating || !summary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              id="summary-modal-regenerate-btn"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="summary-modal-save-btn"
              onClick={onSaveToEntry}
              disabled={isGenerating || !summary}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-60"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved to Entry</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Summary to Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
