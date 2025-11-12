export enum QuestStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  status: QuestStatus;
  dueDate?: string; // YYYY-MM-DD format
  tags?: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface ScheduleSuggestion {
  id: string;
  suggestedDate: string; // YYYY-MM-DD
}

export interface DailyBriefingItem {
  id: string;
  timeframe: string;
  hint: string;
}
