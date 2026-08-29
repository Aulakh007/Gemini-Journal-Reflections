import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Heart, 
  Brain, 
  Target, 
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => Promise<void>;
  onOpenThreatModel: () => void;
  onOpenWalkthrough: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSignIn,
  onOpenThreatModel,
  onOpenWalkthrough,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await onSignIn();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err?.message || 'Authentication could not be completed. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121214] text-stone-900 dark:text-stone-100 flex flex-col justify-between p-4 sm:p-8 transition-colors">
      {/* Top Header Logo */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-stone-900 dark:text-white">
            ReflectAI
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onOpenWalkthrough}
            className="text-stone-500 hover:text-indigo-600 dark:text-stone-400 dark:hover:text-indigo-400 font-medium"
          >
            Walkthrough Guide
          </button>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <button
            onClick={onOpenThreatModel}
            className="text-stone-500 hover:text-indigo-600 dark:text-stone-400 dark:hover:text-indigo-400 font-medium"
          >
            Security Model
          </button>
        </div>
      </header>

      {/* Center Auth Hero Box */}
      <div className="max-w-md w-full mx-auto my-auto py-12 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-medium mb-1">
            <Lock className="w-3 h-3" />
            <span>Private Cognitive Reflection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-white leading-tight">
            A quieter space to think clearly.
          </h1>

          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            Reflect privately, discover underlying patterns, and turn everyday thoughts into meaningful action with Gemini.
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 text-stone-800 dark:text-white border border-stone-300 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 font-medium text-sm shadow-2xs hover:shadow-xs active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                Connecting securely...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy Trust Points */}
          <div className="pt-4 border-t border-stone-100 dark:border-zinc-800/80 space-y-2.5 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Strict Firestore user tenant isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Your reflections are never used for public training</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>4 cognitive AI personas powered by Gemini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-stone-400 dark:text-zinc-600 py-2">
        <p>ReflectAI • Crafted with calm typography, isolated Firestore, and Google Gemini API.</p>
      </footer>
    </div>
  );
};
