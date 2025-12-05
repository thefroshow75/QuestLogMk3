import React from 'react';
import { IconProps } from './components/icons/StarIcon';

export type Theme = 'dark-fantasy' | 'cyberpunk' | 'space' | 'scifi';

export enum QuestStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  LOCKED = 'LOCKED',
}

export enum QuestType {
  ONCE = 'ONCE',
  RECURRING = 'RECURRING',
}

export enum RepeatFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  status: QuestStatus;
  tags: string[];
  type: QuestType;
  isDaily?: boolean;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  repeatFrequency?: RepeatFrequency;
  repeatDays?: number[]; 
  completedDates?: string[]; 
  projectId?: string;
  stepId?: string;
}

export interface ProjectStep {
    id: string;
    title: string;
    order: number;
    status: 'LOCKED' | 'UNLOCKED' | 'COMPLETED';
    quests: Quest[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'ACTIVE' | 'COMPLETED';
    steps: ProjectStep[];
    totalXp: number;
}

export interface User {
  username: string;
  avatarId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  unlockedSkills: Record<string, number>;
  weeklySkips: { count: number; lastReset: string };
  // New Fields
  gold: number;
  unlockedItemIds: string[];
  activePersonalityId: string;
}

export interface Personality {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
}

export type ShopCategory = 'BOOSTS' | 'COSMETICS' | 'UTILITIES' | 'MYSTERY';

export interface ShopItem {
  id: string;
  type: 'THEME' | 'AVATAR' | 'PERSONALITY' | 'BOOST';
  category: ShopCategory;
  name: string;
  description?: string;
  cost: number;
  data: string; // themeId, avatarKey, personalityId, or boostId
}

export interface WorkspaceItem {
    id: string;
    name: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'OTHER';
    size?: string;
    date: string;
    url?: string;
    tags: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface ScheduleSuggestion {
  id: string;
  suggestedDate: string;
}

export interface DailyBriefingItem {
  id: string;
  timeframe: string;
  hint: string;
}

export interface Achievement {
  id: string;
  date: string; 
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.FC<IconProps>;
  checkCondition: (user: User, quests: Quest[], streak: number) => boolean;
}

export type SkillEffect = 
  | { type: 'XP_BOOST'; value: number }
  | { type: 'EXTRA_SUGGESTION'; value: number };

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.FC<IconProps>;
  maxLevel: number;
  cost: (level: number) => number;
  getEffect: (level: number) => SkillEffect | undefined;
  prerequisites?: Record<string, number>;
}