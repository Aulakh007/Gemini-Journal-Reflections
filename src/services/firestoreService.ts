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
import type { JournalEntry } from '../types';

/**
 * Subscribes to real-time updates for a specific user's journal entries.
 * Strictly queries the subcollection `/users/{userId}/entries` to guarantee isolated tenancy.
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
        console.error('Firestore snapshot subscription error:', error);
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (err: any) {
          onError(err);
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to initialize subscription:', err);
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch (wrappedErr: any) {
      onError(wrappedErr);
    }
    return () => {};
  }
}

/**
 * Saves or updates a journal entry in the isolated user path `/users/{userId}/entries/{entryId}`.
 * Strictly strips undefined fields before passing to Firestore.
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
 * Generates an empty default journal entry object
 */
export function createNewEntryTemplate(userId: string): JournalEntry {
  const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    userId,
    title: 'Untitled Reflection',
    content: '',
    category: 'Daily Reflection',
    mood: 'Contemplative',
    tags: [],
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}
