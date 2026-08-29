import React from 'react';
import { 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  BookOpenCheck, 
  PlusCircle, 
  CheckCircle2, 
  Cloud,
  FileCode
} from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onNewEntry: () => void;
  onOpenThreatModel: () => void;
  onOpenWalkthrough: () => void;
  isSaving?: boolean;
  hasActiveEntry?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onNewEntry,
  onOpenThreatModel,
  onOpenWalkthrough,
  isSaving = false,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-900 flex items-center justify-center text-amber-200 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 tracking-tight text-lg">ReflectAI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200/60">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">Private Reflections & Cognitive Dialogue</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Save status */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-600 bg-stone-50 rounded-lg border border-stone-200/80">
              {isSaving ? (
                <>
                  <Cloud className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                  <span className="text-amber-700 font-medium">Syncing Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-stone-600">Isolated Tenant Synced</span>
                </>
              )}
            </div>
          )}

          {/* New Entry Button */}
          {user && (
            <button
              id="nav-new-entry-btn"
              onClick={onNewEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>New Entry</span>
            </button>
          )}

          {/* Threat Model Trigger */}
          <button
            id="nav-threat-model-btn"
            onClick={onOpenThreatModel}
            title="View Security Threat Model"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-stone-600" />
            <span className="hidden lg:inline">Threat Model</span>
          </button>

          {/* Test Walkthrough Trigger */}
          <button
            id="nav-walkthrough-btn"
            onClick={onOpenWalkthrough}
            title="View Interactive Test Walkthrough"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors"
          >
            <BookOpenCheck className="w-4 h-4 text-amber-700" />
            <span className="hidden lg:inline">Test Walkthrough</span>
          </button>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-stone-300">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left text-xs">
                <p className="font-medium text-stone-800 leading-tight truncate max-w-[120px]">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-stone-500 truncate max-w-[120px]">{user.email}</p>
              </div>
              <button
                id="nav-sign-out-btn"
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
