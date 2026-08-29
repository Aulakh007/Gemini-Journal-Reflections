export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
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
  | 'Practical Coach'
  | 'Perspective Shifter'
  | 'Future Self';

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

export interface JournalLocation {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: JournalCategory;
  mood: JournalMood;
  tags: string[];
  location?: JournalLocation | null;
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

export type PatternConfidence = 
  | 'Emerging pattern'
  | 'Recurring theme'
  | 'Strong recurring theme'
  | 'Worth exploring';

export type PatternCategory = 
  | 'Theme'
  | 'Emotional Pattern'
  | 'Behavioral Tendency'
  | 'Location Context';

export interface ReflectionPattern {
  id: string;
  userId: string;
  title: string;
  category: PatternCategory;
  confidenceLabel: PatternConfidence;
  description: string;
  evidenceBasis: {
    reflectionCount: number;
    dateRange: string;
    sampleEntryTitles: string[];
    sampleEntryIds: string[];
    keywords: string[];
  };
  suggestedInquiry: string;
  potentialMicroAction?: string;
  createdAt: string;
}

export interface NotificationWebhookConfig {
  enabled: boolean;
  provider: 'discord' | 'slack' | 'custom';
  webhookUrl: string;
  notifyOnNewEntry: boolean;
  notifyOnActionItem: boolean;
  notifyOnInsight: boolean;
  privacyLevel: 'minimal_metadata' | 'include_summary';
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultPersona: AIPersona;
  defaultMood: JournalMood;
  reduceMotion: boolean;
  autoSaveIntervalMs: number;
  webhookConfig?: NotificationWebhookConfig;
}

export type ActiveTab = 
  | 'dashboard'
  | 'journal'
  | 'timeline'
  | 'reflections'
  | 'insights'
  | 'patterns'
  | 'inspire'
  | 'settings'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface SystemTelemetryMetrics {
  uptimeSeconds: number;
  status: 'healthy' | 'degraded' | 'maintenance';
  serverTimestamp: string;
  geminiStatus: {
    primaryModel: string;
    availableFallbackModels: string[];
    averageLatencyMs: number;
    fallbackRatePercent: number;
  };
  apiHealth: {
    healthCheck: 'ok';
    lastChecked: string;
  };
  securityAudit: {
    rateLimitEnforcements: number;
    unauthorizedBlocks: number;
    activeTenants: number;
    encryptionStatus: string;
  };
}

