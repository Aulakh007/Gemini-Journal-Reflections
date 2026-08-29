export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type JournalMood = 'Peaceful' | 'Energized' | 'Grateful' | 'Contemplative' | 'Challenged' | 'Anxious' | 'Inspired';

export type JournalCategory = 
  | 'Daily Reflection'
  | 'Deep Brainstorming'
  | 'Mindfulness & Gratitude'
  | 'Goal Setting & Strategy'
  | 'Emotional Processing'
  | 'Creative Ideas';

export type AIPersona = 
  | 'Empathetic Coach'
  | 'Socratic Explorer'
  | 'Strategic Brainstormer'
  | 'Summarizer & Synthesizer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: JournalCategory;
  mood: JournalMood;
  tags: string[];
  messages: ChatMessage[];
  summary?: string;
  summaryModelUsed?: string;
  createdAt: string;
  updatedAt: string;
}
