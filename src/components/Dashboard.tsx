import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, 
  PlusCircle, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Download,
  Share2,
  FileText
} from 'lucide-react';
import type { UserProfile, JournalEntry, ChatMessage } from '../types';
import { 
  subscribeUserEntries, 
  saveJournalEntry, 
  deleteJournalEntry, 
  createNewEntryTemplate 
} from '../services/firestoreService';
import { EntryHistorySidebar } from './EntryHistorySidebar';
import { JournalEditor } from './JournalEditor';
import { ChatReflection } from './ChatReflection';
import { SummaryModal } from './SummaryModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Summary Modal State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeSummaryText, setActiveSummaryText] = useState('');
  const [summaryModelUsed, setSummaryModelUsed] = useState('gemini-2.5-flash');

  // Delete Modal State
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time Firestore Subscription
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeUserEntries(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        // If no active entry is selected, select the first or create new
        setCurrentEntry((prev) => {
          if (prev) {
            // Keep current entry updated with latest server version if exists
            const matched = fetchedEntries.find((e) => e.id === prev.id);
            return matched || prev;
          }
          if (fetchedEntries.length > 0) {
            return fetchedEntries[0];
          }
          return createNewEntryTemplate(user.uid);
        });
      },
      (error) => {
        console.error('Real-time Firestore listener error:', error);
        setSaveError(`Database sync issue: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  // Handle creating a new entry
  const handleCreateNewEntry = () => {
    const newEntry = createNewEntryTemplate(user.uid);
    setCurrentEntry(newEntry);
    setIsSidebarOpen(false);
  };

  // Handle entry updates in editor
  const handleEntryChange = (updates: Partial<JournalEntry>) => {
    if (!currentEntry) return;
    const updated = {
      ...currentEntry,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setCurrentEntry(updated);
  };

  // Save entry to Firestore
  const handleSaveToFirestore = async (entryToSave = currentEntry) => {
    if (!entryToSave || !user.uid) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      await saveJournalEntry(user.uid, entryToSave);
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 2500);
    } catch (err: any) {
      console.error('Failed to save journal to Firestore:', err);
      setSaveError(err?.message || 'Failed to save entry to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a chat reflection turn and auto-persist to entry
  const handleAddChatMessage = async (msg: ChatMessage) => {
    if (!currentEntry) return;

    const updatedMessages = [...currentEntry.messages, msg];
    const updatedEntry: JournalEntry = {
      ...currentEntry,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    setCurrentEntry(updatedEntry);
    // Persist immediately to maintain conversation continuity in Firestore
    await handleSaveToFirestore(updatedEntry);
  };

  // Clear chat conversation
  const handleClearChat = async () => {
    if (!currentEntry) return;
    const updatedEntry: JournalEntry = {
      ...currentEntry,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setCurrentEntry(updatedEntry);
    await handleSaveToFirestore(updatedEntry);
  };

  // Generate Executive Summary
  const handleGenerateSummary = async () => {
    if (!currentEntry) return;

    setIsSummaryModalOpen(true);
    setIsGeneratingSummary(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalTitle: currentEntry.title,
          journalContent: currentEntry.content,
          category: currentEntry.category,
          mood: currentEntry.mood,
          conversation: currentEntry.messages,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setActiveSummaryText(data.summary);
        setSummaryModelUsed(data.modelUsed || 'gemini-2.5-flash');
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setActiveSummaryText(`*Could not generate summary: ${err.message}. Please try again.*`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Attach generated summary to active entry document in Firestore
  const handleSaveSummaryToEntry = async () => {
    if (!currentEntry || !activeSummaryText) return;

    const updatedEntry: JournalEntry = {
      ...currentEntry,
      summary: activeSummaryText,
      summaryModelUsed: summaryModelUsed,
      updatedAt: new Date().toISOString(),
    };

    setCurrentEntry(updatedEntry);
    await handleSaveToFirestore(updatedEntry);
  };

  // Open Summary Modal (either generate or display existing)
  const handleOpenSummaryModal = () => {
    if (currentEntry?.summary) {
      setActiveSummaryText(currentEntry.summary);
      setSummaryModelUsed(currentEntry.summaryModelUsed || 'gemini-2.5-flash');
      setIsSummaryModalOpen(true);
    } else {
      handleGenerateSummary();
    }
  };

  // Delete an entry from Firestore
  const handleConfirmDelete = async () => {
    if (!entryToDelete || !user.uid) return;

    try {
      setIsDeleting(true);
      await deleteJournalEntry(user.uid, entryToDelete.id);

      // If we deleted the active entry, switch to first remaining or create new
      if (currentEntry?.id === entryToDelete.id) {
        const remaining = entries.filter((e) => e.id !== entryToDelete.id);
        if (remaining.length > 0) {
          setCurrentEntry(remaining[0]);
        } else {
          setCurrentEntry(createNewEntryTemplate(user.uid));
        }
      }
      setEntryToDelete(null);
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      setSaveError(`Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-stone-100 overflow-hidden">
      {/* Error Alert Banner */}
      {saveError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-800 flex items-center justify-between z-10 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button
            onClick={() => handleSaveToFirestore()}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px] transition-colors"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Success Notification Toast */}
      {saveSuccessNotification && (
        <div className="fixed bottom-4 right-4 z-40 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg border border-stone-700 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Saved securely to Cloud Firestore</span>
        </div>
      )}

      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden p-2.5 bg-white border-b border-stone-200 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg border border-stone-200"
        >
          <Menu className="w-4 h-4" />
          <span>Reflections ({entries.length})</span>
        </button>

        <button
          onClick={handleCreateNewEntry}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-stone-900 rounded-lg"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Past Entry History Sidebar */}
        <EntryHistorySidebar
          entries={entries}
          activeEntryId={currentEntry?.id || null}
          onSelectEntry={(entry) => setCurrentEntry(entry)}
          onDeleteEntry={(entry) => setEntryToDelete(entry)}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Center & Right: Dual-Pane Workspace */}
        {currentEntry ? (
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
            {/* Center (7 Cols on desktop): Journal Editor */}
            <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
              <JournalEditor
                entry={currentEntry}
                onChange={handleEntryChange}
                onSave={() => handleSaveToFirestore()}
                isSaving={isSaving}
                onOpenSummaryModal={handleOpenSummaryModal}
                hasSummary={!!currentEntry.summary}
              />
            </div>

            {/* Right (5 Cols on desktop): Multi-Turn Chat with Gemini */}
            <div className="lg:col-span-5 h-full flex flex-col overflow-hidden border-t lg:border-t-0 lg:border-l border-stone-200">
              <ChatReflection
                entry={currentEntry}
                onAddMessage={handleAddChatMessage}
                onClearChat={handleClearChat}
              />
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500 bg-white">
            <div>
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-stone-900">No Entry Selected</h3>
              <p className="text-xs text-stone-400 mt-1">Select an existing reflection or create a new one.</p>
              <button
                onClick={handleCreateNewEntry}
                className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                Create New Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary Modal */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={activeSummaryText}
        isGenerating={isGeneratingSummary}
        onRegenerate={handleGenerateSummary}
        onSaveToEntry={handleSaveSummaryToEntry}
        isSaved={currentEntry?.summary === activeSummaryText}
        modelUsed={summaryModelUsed}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!entryToDelete}
        entryTitle={entryToDelete?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
