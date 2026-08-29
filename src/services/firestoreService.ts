import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  cleanPayload,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import type { JournalEntry, ActionItem, UserPreferences, AIPersona, JournalMood } from '../types';

/**
 * Subscribes to real-time updates for a specific user's journal entries.
 * Strictly queries the subcollection `/users/{userId}/entries` ensuring owner isolation.
 */
export function subscribeUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const path = `users/${userId}/entries`;
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JournalEntry;
          entries.push({
            ...data,
            id: docSnap.id,
          });
        });
        onUpdate(entries);
      },
      (error) => {
        console.error('Firestore entries subscription error:', error);
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (err: any) {
          onError(err);
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to initialize entries subscription:', err);
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch (wrappedErr: any) {
      onError(wrappedErr);
    }
    return () => {};
  }
}

/**
 * Saves or updates a journal entry in `/users/{userId}/entries/{entryId}`.
 * Strictly strips undefined fields to prevent Firestore payload crashes.
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) {
    throw new Error('Authentication required to save entry');
  }

  const path = `users/${userId}/entries/${entry.id}`;
  try {
    const entryRef = doc(db, 'users', userId, 'entries', entry.id);
    const sanitized = cleanPayload({
      ...entry,
      userId,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(entryRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a journal entry from `/users/{userId}/entries/{entryId}`
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) {
    throw new Error('User ID and Entry ID required for deletion');
  }

  const path = `users/${userId}/entries/${entryId}`;
  try {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to user action items in `/users/{userId}/actions`
 */
export function subscribeUserActions(
  userId: string,
  onUpdate: (actions: ActionItem[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const path = `users/${userId}/actions`;
  try {
    const actionsRef = collection(db, 'users', userId, 'actions');
    const q = query(actionsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const actions: ActionItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ActionItem;
          actions.push({
            ...data,
            id: docSnap.id,
          });
        });
        onUpdate(actions);
      },
      (error) => {
        console.error('Firestore actions subscription error:', error);
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (err: any) {
          onError(err);
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to initialize actions subscription:', err);
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch (wrappedErr: any) {
      onError(wrappedErr);
    }
    return () => {};
  }
}

/**
 * Saves or updates an action item in `/users/{userId}/actions/{actionId}`
 */
export async function saveActionItem(userId: string, action: ActionItem): Promise<void> {
  if (!userId) throw new Error('Authentication required');
  const path = `users/${userId}/actions/${action.id}`;
  try {
    const actionRef = doc(db, 'users', userId, 'actions', action.id);
    const sanitized = cleanPayload({
      ...action,
      userId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(actionRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes an action item
 */
export async function deleteActionItem(userId: string, actionId: string): Promise<void> {
  if (!userId || !actionId) throw new Error('User and Action ID required');
  const path = `users/${userId}/actions/${actionId}`;
  try {
    const actionRef = doc(db, 'users', userId, 'actions', actionId);
    await deleteDoc(actionRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to user preferences in `/users/{userId}/preferences/main`
 */
export function subscribeUserPreferences(
  userId: string,
  onUpdate: (prefs: UserPreferences) => void
): () => void {
  if (!userId) return () => {};
  const path = `users/${userId}/preferences/main`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'main');
    return onSnapshot(prefRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as UserPreferences);
      }
    });
  } catch {
    return () => {};
  }
}

/**
 * Saves user preferences
 */
export async function saveUserPreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/preferences/main`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'main');
    await setDoc(prefRef, cleanPayload(prefs), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Creates an empty default journal entry object
 */
export function createNewEntryTemplate(
  userId: string, 
  defaultMood: JournalMood = 'Reflective', 
  promptTitle: string = 'Untitled Reflection',
  promptContent: string = ''
): JournalEntry {
  const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    userId,
    title: promptTitle,
    content: promptContent,
    category: 'Daily Reflection',
    mood: defaultMood,
    tags: [],
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}
