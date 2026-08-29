export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type JournalMood = 
  | 'Calm'
  | 'Reflective'
  | 'Inspired'
  | 'Grateful'
  | 'Energized'
  | 'Challenged'
  | 'Low'
  | 'Frustrated'
  | 'Anxious';

export type JournalCategory = 
  | 'Daily Reflection'
  | 'Life & Growth'
  | 'Career & Projects'
  | 'Mindfulness & Gratitude'
  | 'Emotional Clarity'
  | 'Relationships'
  | 'Creative Ideas';

export type AIPersona = 
  | 'Socratic Explorer'
  | 'Empathetic Listener'
  | 'Pattern Finder'
  | 'Practical Coach';

export interface PersonaDetails {
  id: AIPersona;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ActionItem {
  id: string;
  userId: string;
  entryId?: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionalTheme {
  theme: string;
  score: number; // 0 - 100 percentage
  description?: string;
}

export interface ExecutiveInsight {
  id: string;
  userId: string;
  entryId?: string;
  summary: string;
  emotionalThemes: EmotionalTheme[];
  observedPatterns: string[];
  suggestedActions: string[];
  deepQuestion?: string;
  createdAt: string;
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
  executiveInsight?: {
    summary: string;
    themes: EmotionalTheme[];
    patterns: string[];
    actions: string[];
    deepQuestion?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultPersona: AIPersona;
  defaultMood: JournalMood;
  reduceMotion: boolean;
  autoSaveIntervalMs: number;
}

export type ActiveTab = 
  | 'dashboard'
  | 'journal'
  | 'reflections'
  | 'insights'
  | 'inspire'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}
