import React, { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged, 
  type FirebaseUser 
} from './lib/firebase';
import type { 
  UserProfile, 
  JournalEntry, 
  ActionItem, 
  UserPreferences, 
  ActiveTab, 
  ToastMessage, 
  JournalMood, 
  JournalCategory, 
  ChatMessage,
  ReflectionPattern
} from './types';
import { 
  subscribeUserEntries, 
  saveJournalEntry, 
  deleteJournalEntry, 
  subscribeUserActions, 
  saveActionItem, 
  deleteActionItem, 
  subscribeUserPreferences, 
  saveUserPreferences, 
  subscribeUserPatterns,
  saveReflectionPattern,
  createNewEntryTemplate 
} from './services/firestoreService';

import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { JournalView } from './components/journal/JournalView';
import { JournalEditor } from './components/journal/JournalEditor';
import { TimelineView } from './components/timeline/TimelineView';
import { PatternsView } from './components/patterns/PatternsView';
import { AIReflectionView } from './components/reflections/AIReflectionView';
import { InsightsView } from './components/insights/InsightsView';
import { InspireMeView } from './components/inspire/InspireMeView';
import { AdminView } from './components/admin/AdminView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthScreen } from './components/auth/AuthScreen';
import { ToastContainer } from './components/common/Toast';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { ThreatModelModal } from './components/common/ThreatModelModal';
import { WalkthroughGuideModal } from './components/common/WalkthroughGuideModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // App Navigation & Workspace State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeEditingEntry, setActiveEditingEntry] = useState<JournalEntry | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Firestore Data State
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [patterns, setPatterns] = useState<ReflectionPattern[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    defaultPersona: 'Socratic Explorer',
    defaultMood: 'Reflective',
    reduceMotion: false,
    autoSaveIntervalMs: 3000,
  });

  // UI Modals & Feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  const showToast = useCallback((type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync HTML dark class with currentTheme
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  const handleToggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    if (user) {
      saveUserPreferences(user.uid, { theme: next });
    }
  };

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Reflective User',
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
        setEntries([]);
        setActions([]);
        setActiveEditingEntry(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Subscriptions for Entries, Actions, Preferences
  useEffect(() => {
    if (!user?.uid) return;

    const unsubEntries = subscribeUserEntries(
      user.uid,
      (loadedEntries) => {
        setEntries(loadedEntries);
        // If an entry was actively open in editor, update its reference
        setActiveEditingEntry((prev) => {
          if (!prev) return null;
          const matched = loadedEntries.find((e) => e.id === prev.id);
          return matched || prev;
        });
      },
      (error) => {
        console.error('Entries subscription error:', error);
        showToast('error', 'Sync Warning', 'Unable to sync reflection entries in real time.');
      }
    );

    const unsubActions = subscribeUserActions(
      user.uid,
      (loadedActions) => {
        setActions(loadedActions);
      },
      (error) => {
        console.error('Actions subscription error:', error);
      }
    );

    const unsubPreferences = subscribeUserPreferences(user.uid, (loadedPrefs) => {
      if (loadedPrefs) {
        setPreferences((prev) => ({ ...prev, ...loadedPrefs }));
        if (loadedPrefs.theme === 'dark' || loadedPrefs.theme === 'light') {
          setCurrentTheme(loadedPrefs.theme);
        }
      }
    });

    const unsubPatterns = subscribeUserPatterns(
      user.uid,
      (loadedPatterns) => {
        setPatterns(loadedPatterns);
      },
      (error) => {
        console.error('Patterns subscription error:', error);
      }
    );

    return () => {
      unsubEntries();
      unsubActions();
      unsubPreferences();
      unsubPatterns();
    };
  }, [user?.uid, showToast]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('success', 'Welcome to ReflectAI', 'Your secure reflection space is ready.');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      showToast('error', 'Sign In Failed', err?.message || 'Could not connect with Google.');
      throw err;
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('info', 'Signed Out', 'You have been signed out safely.');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Reflection CRUD Handlers
  const handleStartNewReflection = (promptContent?: string, promptMood?: JournalMood, promptCategory?: JournalCategory) => {
    if (!user) return;
    const newEntry = createNewEntryTemplate(
      user.uid,
      promptMood || preferences.defaultMood,
      promptContent ? 'Thought Exploration' : 'Untitled Reflection',
      promptContent || ''
    );
    if (promptCategory) {
      newEntry.category = promptCategory;
    }
    setActiveEditingEntry(newEntry);
    setActiveTab('journal');
  };

  const handleSaveEntry = async (entryToSave: JournalEntry) => {
    if (!user) return;
    try {
      await saveJournalEntry(user.uid, entryToSave);
      setActiveEditingEntry(entryToSave);
      showToast('success', 'Reflection Saved', `"${entryToSave.title}" has been saved.`);
    } catch (err: any) {
      console.error('Error saving entry:', err);
      showToast('error', 'Save Failed', err?.message || 'Could not save reflection to Firestore.');
      throw err;
    }
  };

  const handleDeleteEntryConfirm = async () => {
    if (!user || !entryToDelete) return;
    setIsDeletingEntry(true);
    try {
      await deleteJournalEntry(user.uid, entryToDelete.id);
      if (activeEditingEntry?.id === entryToDelete.id) {
        setActiveEditingEntry(null);
      }
      showToast('info', 'Reflection Deleted', `"${entryToDelete.title}" was removed.`);
      setEntryToDelete(null);
    } catch (err: any) {
      console.error('Delete entry error:', err);
      showToast('error', 'Delete Failed', err?.message || 'Could not delete reflection.');
    } finally {
      setIsDeletingEntry(false);
    }
  };

  // Save Messages to Journal Entry
  const handleSaveEntryMessages = async (entry: JournalEntry, newMessages: ChatMessage[]) => {
    if (!user) return;
    const updatedEntry: JournalEntry = {
      ...entry,
      messages: newMessages,
      updatedAt: new Date().toISOString(),
    };
    await saveJournalEntry(user.uid, updatedEntry);
  };

  // Action Items CRUD Handlers
  const handleAddActionItem = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string) => {
    if (!user) return;
    const newAction: ActionItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.uid,
      entryId: activeEditingEntry?.id,
      title,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveActionItem(user.uid, newAction);
    showToast('success', 'Action Item Created', `Added: "${title}"`);
  };

  const handleToggleActionItem = async (action: ActionItem) => {
    if (!user) return;
    const updated: ActionItem = {
      ...action,
      completed: !action.completed,
      updatedAt: new Date().toISOString(),
    };
    await saveActionItem(user.uid, updated);
    if (updated.completed) {
      showToast('success', 'Action Step Completed', `"${action.title}"`);
    }
  };

  const handleDeleteActionItem = async (actionId: string) => {
    if (!user) return;
    try {
      await deleteActionItem(user.uid, actionId);
      showToast('info', 'Action Removed');
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message);
    }
  };

  // Executive Synthesis Trigger
  const handleSynthesizeEntry = async (entry: JournalEntry) => {
    if (!user) return;
    showToast('info', 'Synthesizing...', 'Extracting executive insights with Gemini.');
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalTitle: entry.title,
          journalContent: entry.content,
          category: entry.category,
          mood: entry.mood,
          conversation: entry.messages,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Insight generation failed');
      }

      const insight = resData.data.insight;
      const updated: JournalEntry = {
        ...entry,
        summary: insight.summary,
        summaryModelUsed: resData.data.modelUsed,
        executiveInsight: {
          summary: insight.summary,
          themes: insight.emotionalThemes || [],
          patterns: insight.observedPatterns || [],
          actions: insight.suggestedActions || [],
          deepQuestion: insight.deepQuestion,
        },
        updatedAt: new Date().toISOString(),
      };

      await saveJournalEntry(user.uid, updated);

      // Auto-populate suggested actions if any
      if (Array.isArray(insight.suggestedActions) && insight.suggestedActions.length > 0) {
        for (const actionTitle of insight.suggestedActions.slice(0, 2)) {
          const act: ActionItem = {
            id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: user.uid,
            entryId: entry.id,
            title: actionTitle,
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveActionItem(user.uid, act);
        }
      }

      showToast('success', 'Insights Generated', 'Executive synthesis and action items created.');
      setActiveTab('insights');
    } catch (err: any) {
      console.error('Synthesis error:', err);
      showToast('error', 'Synthesis Failed', err?.message || 'Could not synthesize insights.');
    }
  };

  // Clear all reflection data
  const handleClearAllData = async () => {
    if (!user) return;
    try {
      for (const entry of entries) {
        await deleteJournalEntry(user.uid, entry.id);
      }
      for (const action of actions) {
        await deleteActionItem(user.uid, action.id);
      }
      setEntries([]);
      setActions([]);
      setActiveEditingEntry(null);
      showToast('info', 'History Cleared', 'All reflection data was deleted.');
    } catch (err: any) {
      showToast('error', 'Failed to clear data', err?.message);
    }
  };

  // Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121214] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Connecting to ReflectAI...</p>
        </div>
      </div>
    );
  }

  // If Not Authenticated, show Serene AuthScreen
  if (!user) {
    return (
      <>
        <AuthScreen
          onSignIn={handleGoogleSignIn}
          onOpenThreatModel={() => setIsThreatModalOpen(true)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        />
        <ThreatModelModal
          isOpen={isThreatModalOpen}
          onClose={() => setIsThreatModalOpen(false)}
        />
        <WalkthroughGuideModal
          isOpen={isWalkthroughOpen}
          onClose={() => setIsWalkthroughOpen(false)}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Authenticated App Shell & View Router
  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={(tab) => {
        if (tab !== 'journal') {
          setActiveEditingEntry(null);
        }
        setActiveTab(tab);
      }}
      user={user}
      onSignOut={handleSignOut}
      onNewReflection={() => handleStartNewReflection()}
      onOpenInspire={() => setActiveTab('inspire')}
      onOpenThreatModel={() => setIsThreatModalOpen(true)}
      onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      theme={currentTheme}
      onToggleTheme={handleToggleTheme}
      searchQuery={globalSearchQuery}
      setSearchQuery={setGlobalSearchQuery}
      entryCount={entries.length}
      actionCount={actions.filter((a) => !a.completed).length}
      patternCount={patterns.length}
    >
      {/* 1. Dashboard View */}
      {activeTab === 'dashboard' && (
        <DashboardView
          user={user}
          entries={entries}
          actions={actions}
          onNewReflection={() => handleStartNewReflection()}
          onOpenInspire={() => setActiveTab('inspire')}
          onSelectEntry={(entry) => {
            setActiveEditingEntry(entry);
            setActiveTab('journal');
          }}
          onDeleteEntry={(entry) => setEntryToDelete(entry)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onToggleAction={handleToggleActionItem}
        />
      )}

      {/* 2. Timeline View (Temporal & Environmental Journey) */}
      {activeTab === 'timeline' && (
        <TimelineView
          entries={entries}
          onSelectEntry={(entry) => {
            setActiveEditingEntry(entry);
            setActiveTab('journal');
          }}
          onOpenAiDialogue={(entry) => {
            setActiveEditingEntry(entry);
            setActiveTab('reflections');
          }}
          onOpenInsights={(entry) => handleSynthesizeEntry(entry)}
          onCreateNewEntry={() => handleStartNewReflection()}
        />
      )}

      {/* 3. Pattern Discovery View (Longitudinal AI Patterns) */}
      {activeTab === 'patterns' && (
        <PatternsView
          entries={entries}
          savedPatterns={patterns}
          onSavePattern={async (pattern) => {
            if (user) {
              await saveReflectionPattern(user.uid, pattern);
            }
          }}
          onAddActionItem={(title, priority) => handleAddActionItem(title, priority)}
          onSelectEntryById={(entryId) => {
            const matched = entries.find((e) => e.id === entryId);
            if (matched) {
              setActiveEditingEntry(matched);
              setActiveTab('journal');
            }
          }}
        />
      )}

      {/* 4. Journal View & Editor */}
      {activeTab === 'journal' && (
        activeEditingEntry ? (
          <JournalEditor
            entry={activeEditingEntry}
            onSave={handleSaveEntry}
            onBack={() => setActiveEditingEntry(null)}
            onOpenAiDialogue={(entry) => {
              setActiveEditingEntry(entry);
              setActiveTab('reflections');
            }}
            onOpenSummary={(entry) => handleSynthesizeEntry(entry)}
          />
        ) : (
          <JournalView
            entries={entries}
            searchQuery={globalSearchQuery}
            setSearchQuery={setGlobalSearchQuery}
            onNewReflection={() => handleStartNewReflection()}
            onSelectEntry={(entry) => setActiveEditingEntry(entry)}
            onDeleteEntry={(entry) => setEntryToDelete(entry)}
          />
        )
      )}

      {/* 5. AI Explorer View */}
      {activeTab === 'reflections' && (
        <AIReflectionView
          activeEntry={activeEditingEntry || (entries.length > 0 ? entries[0] : null)}
          allEntries={entries}
          onSaveEntryMessages={handleSaveEntryMessages}
          onAddActionItem={(title, priority) => handleAddActionItem(title, priority)}
          onBackToJournal={activeEditingEntry ? () => setActiveTab('journal') : undefined}
          defaultPersona={preferences.defaultPersona}
        />
      )}

      {/* 6. Insights & Actions View */}
      {activeTab === 'insights' && (
        <InsightsView
          entries={entries}
          actions={actions}
          onAddAction={handleAddActionItem}
          onToggleAction={handleToggleActionItem}
          onDeleteAction={handleDeleteActionItem}
          onSynthesizeEntry={handleSynthesizeEntry}
          onSelectEntry={(entry) => {
            setActiveEditingEntry(entry);
            setActiveTab('journal');
          }}
        />
      )}

      {/* 7. Inspire Me View */}
      {activeTab === 'inspire' && (
        <InspireMeView
          onStartReflectionWithPrompt={(promptText, mood, category) => {
            handleStartNewReflection(promptText, mood, category);
          }}
        />
      )}

      {/* 8. Platform & Admin Observability View */}
      {activeTab === 'admin' && (
        <AdminView
          user={user}
          onUpdateRole={(newRole) => {
            if (user) {
              setUser({ ...user, role: newRole });
              showToast('info', 'RBAC Role Switched', `Active role simulated as ${newRole.toUpperCase()}.`);
            }
          }}
        />
      )}

      {/* 9. Settings & Privacy View */}
      {activeTab === 'settings' && (
        <SettingsView
          user={user}
          preferences={preferences}
          onUpdatePreferences={async (prefs) => {
            if (user) {
              await saveUserPreferences(user.uid, prefs);
              setPreferences((prev) => ({ ...prev, ...prefs }));
              showToast('success', 'Preferences Updated');
            }
          }}
          entries={entries}
          actions={actions}
          theme={currentTheme}
          onToggleTheme={handleToggleTheme}
          onClearAllData={handleClearAllData}
          onSignOut={handleSignOut}
        />
      )}

      {/* Confirmation & Security Modals */}
      <DeleteConfirmModal
        isOpen={!!entryToDelete}
        title="Delete Reflection?"
        message={`Are you sure you want to delete "${entryToDelete?.title || 'this reflection'}"? This action cannot be undone.`}
        onConfirm={handleDeleteEntryConfirm}
        onCancel={() => setEntryToDelete(null)}
        isDeleting={isDeletingEntry}
      />

      <ThreatModelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
      />

      <WalkthroughGuideModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Toast Feedback System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppShell>
  );
}
