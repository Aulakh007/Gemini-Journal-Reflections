import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Database, 
  Cpu, 
  Key, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Layers,
  FileText
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  isLoading: boolean;
  onOpenThreatModel: () => void;
  onOpenWalkthrough: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isLoading,
  onOpenThreatModel,
  onOpenWalkthrough,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50 flex flex-col justify-between text-stone-900">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
          <span>User-Isolated Firestore & Gemini 3.6 Flash</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 font-serif leading-tight max-w-4xl mx-auto">
          Deep reflections & multi-turn cognitive dialogue, with privacy built-in.
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Capture thoughts, brainstorm complex ideas, and engage in reflective conversations with Gemini. Every journal entry is isolated in Cloud Firestore strictly bound to your authenticated identity.
        </p>

        {/* Action CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="landing-sign-in-google-btn"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-base shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                Connecting securely...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </>
            )}
          </button>

          <button
            id="landing-threat-model-btn"
            onClick={onOpenThreatModel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-medium text-sm border border-stone-200 shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>5 Threat Zones & Countermeasures</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Owner-Bound Tenant Isolation</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Security rules enforce <code>request.auth.uid == userId</code> on all Firestore paths. User data is strictly unreadable and unwritable by any other authenticated user.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>OWASP Top 10 & A01 Enforced</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Gemini 3.6 Flash Multi-Turn AI</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Empowered with 4 thinking personas: Empathetic Coach, Socratic Explorer, Strategic Brainstormer, and Synthesizer, backed by automated fallback resilience.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Resilient Model Fallback Ladder</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Persistent History & Summaries</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Save full multi-turn conversations, tag moods, filter by topics, and generate structured executive takeaways with actionable micro-habits.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-stone-700 font-medium">
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Real-time Snapshot Synchronization</span>
            </div>
          </div>
        </div>

        {/* Security & Verification Panel */}
        <div className="mt-10 p-5 rounded-2xl bg-stone-900 text-stone-100 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-800 text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Zero Hardcoding & Secret Manager Hygiene</h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Gemini API credentials are protected server-side via environment variables. Google OAuth credentials never store raw passwords.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              id="landing-view-walkthrough-btn"
              onClick={onOpenWalkthrough}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-medium rounded-lg border border-stone-700 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Test Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500">
        <p>Built with Google Cloud Firestore, Firebase Auth, and the Gemini 3.6 Flash API</p>
      </footer>
    </div>
  );
};
