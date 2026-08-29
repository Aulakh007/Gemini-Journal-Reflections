import React, { useEffect, useState } from 'react';
import { 
  Compass, 
  HeartHandshake, 
  GitMerge, 
  Target, 
  Sparkles, 
  Search, 
  Plus, 
  BookOpen, 
  LayoutDashboard, 
  Brain, 
  Lightbulb, 
  CheckSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Moon, 
  Sun, 
  Lock, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight,
  HelpCircle,
  Shield
} from 'lucide-react';
import type { ActiveTab, UserProfile, JournalMood, JournalCategory, AIPersona } from '../../types';

interface AppShellProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile | null;
  onSignOut: () => void;
  onNewReflection: () => void;
  onOpenInspire: () => void;
  onOpenThreatModel: () => void;
  onOpenWalkthrough: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  entryCount: number;
  actionCount: number;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignOut,
  onNewReflection,
  onOpenInspire,
  onOpenThreatModel,
  onOpenWalkthrough,
  theme,
  onToggleTheme,
  searchQuery,
  setSearchQuery,
  entryCount,
  actionCount,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal' as ActiveTab, label: 'Journal', icon: BookOpen, badge: entryCount > 0 ? String(entryCount) : undefined },
    { id: 'reflections' as ActiveTab, label: 'AI Explorer', icon: Brain },
    { id: 'insights' as ActiveTab, label: 'Insights & Actions', icon: Lightbulb, badge: actionCount > 0 ? String(actionCount) : undefined },
    { id: 'inspire' as ActiveTab, label: 'Inspire Me', icon: Sparkles },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#121214] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5">
                ReflectAI
                <span className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">Pro</span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar & Quick Tools */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search reflections, insights, or mood tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full bg-stone-100/90 dark:bg-zinc-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Header Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
            <Lock className="w-3 h-3" />
            <span>Private & Encrypted</span>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Guide & Threat Model Shortcuts */}
          <button
            id="open-guide-btn"
            onClick={onOpenWalkthrough}
            className="hidden sm:flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="User walkthrough guide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline font-medium">Guide</span>
          </button>

          <button
            id="open-security-model-btn"
            onClick={onOpenThreatModel}
            className="hidden sm:flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Security & Threat Model review"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden xl:inline font-medium">Security</span>
          </button>

          {/* Primary New Reflection CTA */}
          <button
            id="header-new-reflection-btn"
            onClick={onNewReflection}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline font-medium">New Reflection</span>
            <span className="xs:hidden">New</span>
          </button>

          {/* User Profile Avatar / Menu */}
          {user && (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/30 transition-all focus:outline-none"
                aria-label="User account menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User profile'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1C1C1F] rounded-xl shadow-lg border border-stone-200/80 dark:border-zinc-800 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-zinc-800">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{user.displayName || 'Reflective Mind'}</p>
                    <p className="text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
                  </div>
                  <button
                    id="dropdown-settings-btn"
                    onClick={() => {
                      setActiveTab('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800/80 flex items-center gap-2"
                  >
                    <SettingsIcon className="w-4 h-4 text-stone-400" />
                    Preferences & Privacy
                  </button>
                  <button
                    id="dropdown-signout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-stone-100 dark:border-zinc-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main App Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col ${sidebarCollapsed ? 'w-18' : 'w-60'} border-r border-stone-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-[#18181B]/60 backdrop-blur-sm p-3 transition-all duration-200`}>
          <div className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800/60 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-zinc-500'}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Inspiring Spark Card in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3.5 rounded-2xl bg-linear-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 mt-auto">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Spark</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-2.5">
                "What is one small boundary that would bring you peace today?"
              </p>
              <button
                id="sidebar-spark-btn"
                onClick={onOpenInspire}
                className="w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-white/80 dark:bg-zinc-900/80 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 transition-colors shadow-2xs"
              >
                Explore Prompts →
              </button>
            </div>
          )}

          {/* Sidebar Collapse Toggle */}
          <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
            {!sidebarCollapsed && <span className="text-[11px]">ReflectAI v2.5</span>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white dark:bg-[#18181B] h-full p-4 flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-white">ReflectAI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-2">
                <button
                  onClick={() => {
                    onNewReflection();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Reflection
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-rose-600 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Workspace Container */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-6">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border-t border-stone-200/80 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium ${
            activeTab === 'journal' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
        </button>

        <button
          onClick={onNewReflection}
          className="w-10 h-10 -mt-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 active:scale-95"
          aria-label="New Reflection"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('reflections')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium ${
            activeTab === 'reflections' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>AI Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium ${
            activeTab === 'insights' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Insights</span>
        </button>
      </nav>
    </div>
  );
};
