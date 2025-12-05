import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Quest, QuestStatus, QuestType, RepeatFrequency, ChatMessage, User } from '../types';
import QuestItem from './QuestItem';
import { ScrollIcon } from './icons/ScrollIcon';
import AddQuestForm from './AddQuestForm';
import { PlusIcon } from './icons/PlusIcon';
import { generateDailyBriefing } from '../services/geminiService';
import QuestSuggestionEngine from './QuestSuggestionEngine';
import { CheckIcon } from './icons/CheckIcon';
import { SwordIcon } from './icons/SwordIcon';
import { HeartIcon } from './icons/HeartIcon';
import { BookIcon } from './icons/BookIcon';
import { LotusIcon } from './icons/LotusIcon';
import { ShopIcon } from './icons/ShopIcon';

interface QuestBoardProps {
  quests: Quest[];
  dailyQuests: Quest[];
  isDailyQuestsVisible: boolean;
  onSkipDailyQuest: (questId: string) => void;
  weeklySkips: User['weeklySkips'];
  onCompleteQuest: (questId: string, date: string) => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
  onOpenPlanner: () => void;
  hasUnscheduledQuests: boolean;
  chatHistory: ChatMessage[];
  selectedDate: string;
  extraSuggestions: number;
  onOpenShop: () => void;
}

type QuestFilter = 'active' | 'completed' | 'today' | 'selected_day';

const isQuestForDate = (quest: Quest, dateStr: string): boolean => {
    if (quest.status !== QuestStatus.ACTIVE) return false;
    
    const targetDate = new Date(dateStr + 'T00:00:00');

    if (quest.type === QuestType.RECURRING) {
        if (!quest.startDate) return false;
        const startDate = new Date(quest.startDate + 'T00:00:00');
        if (targetDate < startDate) return false;

        if (quest.endDate) {
            const endDate = new Date(quest.endDate + 'T00:00:00');
            if (targetDate > endDate) return false;
        }

        if (quest.repeatFrequency === RepeatFrequency.DAILY) {
            return true;
        }

        if (quest.repeatFrequency === RepeatFrequency.WEEKLY) {
            const targetDay = targetDate.getDay();
            return quest.repeatDays?.includes(targetDay) ?? false;
        }
    } else { // QuestType.ONCE
        return quest.dueDate === dateStr;
    }
    return false;
};

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, dailyQuests, isDailyQuestsVisible, onSkipDailyQuest, weeklySkips, onCompleteQuest, onAddQuest, onOpenPlanner, hasUnscheduledQuests, chatHistory, selectedDate, extraSuggestions, onOpenShop }) => {
  const [filter, setFilter] = useState<QuestFilter>('selected_day');
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [briefing, setBriefing] = useState<Map<string, { timeframe: string; hint: string; }> | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  
  const addMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setFilter('selected_day');
    setExpandedQuestId(null);
  }, [selectedDate]);

  const questsToDisplay = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    switch(filter) {
      case 'active':
        return quests.filter(q => q.status === QuestStatus.ACTIVE && !q.isDaily);
      case 'completed':
        return quests.filter(q => q.status === QuestStatus.COMPLETED);
      case 'today':
        return quests.filter(q => isQuestForDate(q, todayStr) && !q.isDaily);
      case 'selected_day':
        return quests.filter(q => isQuestForDate(q, selectedDate) && !q.isDaily);
      default:
        return [];
    }
  }, [quests, filter, selectedDate]);

  const isQuestCompletedForDate = (quest: Quest, date: string) => {
      return quest.completedDates?.includes(date);
  }
  
  const dateForCompletion = useMemo(() => {
      if (filter === 'today') return new Date().toISOString().split('T')[0];
      if (filter === 'selected_day') return selectedDate;
      return new Date().toISOString().split('T')[0];
  }, [filter, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const questsForBriefing = questsToDisplay.filter(q => !q.isDaily);
    const shouldFetchBriefing = (filter === 'today' || filter === 'selected_day') && questsForBriefing.length > 0;
    if (shouldFetchBriefing) {
      const fetchBriefing = async () => {
        setIsBriefingLoading(true);
        setBriefing(null);
        const briefingItems = await generateDailyBriefing(questsForBriefing);
        if (briefingItems) {
          const briefingMap = new Map<string, { timeframe: string; hint: string; }>();
          briefingItems.forEach(item => {
            briefingMap.set(item.id, { timeframe: item.timeframe, hint: item.hint });
          });
          setBriefing(briefingMap);
        }
        setIsBriefingLoading(false);
      };
      fetchBriefing();
    } else {
      setBriefing(null);
    }
  }, [filter, questsToDisplay]);


  const handleToggleExpand = (questId: string) => {
    setExpandedQuestId(prevId => (prevId === questId ? null : questId));
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as QuestFilter);
    setExpandedQuestId(null);
  }

  const getDailyQuestIcon = (quest: Quest) => {
    const className = "w-5 h-5 text-[rgb(var(--color-accent-secondary-rgb))] flex-shrink-0";
    if (quest.tags.includes('health')) return <HeartIcon className={className} />;
    if (quest.tags.includes('learning') || quest.tags.includes('productivity')) return <BookIcon className={className} />;
    if (quest.tags.includes('mindfulness') || quest.tags.includes('creativity')) return <LotusIcon className={className} />;
    return <SwordIcon className={className} />; // Fallback
  };

  return (
    <>
    {isAddFormVisible && <AddQuestForm onAddQuest={onAddQuest} onClose={() => setIsAddFormVisible(false)} />}
    <div className="h-full relative flex flex-col overflow-hidden">
      <div className="px-6 pt-2 flex justify-between items-center pb-4 flex-shrink-0">
          <h2 className="font-display text-3xl text-[rgb(var(--color-accent-primary-rgb))]">Quest Board</h2>
          <div className="flex items-center space-x-2">
            <button
                onClick={onOpenShop}
                className="w-10 h-10 bg-[rgba(var(--color-accent-tertiary-rgb),0.2)] text-[rgb(var(--color-accent-tertiary-rgb))] rounded-full flex items-center justify-center hover:bg-[rgba(var(--color-accent-tertiary-rgb),0.4)] transition-colors"
                title="Open Shop"
            >
                <ShopIcon className="w-6 h-6" />
            </button>
            <div className="relative" ref={addMenuRef}>
              <button 
                onClick={() => setIsAddMenuOpen(prev => !prev)}
                className="w-10 h-10 bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Add or plan quests"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-background-primary-rgb))] border border-[rgba(var(--color-border-primary-rgb),0.5)] rounded-lg shadow-xl z-20">
                  <button
                    onClick={() => { setIsAddFormVisible(true); setIsAddMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-text-secondary-rgb))] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.5)]"
                  >
                    Forge New Quest
                  </button>
                  {hasUnscheduledQuests && (
                    <button
                      onClick={() => { onOpenPlanner(); setIsAddMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-text-secondary-rgb))] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.5)]"
                    >
                      Plan Quests
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>

      <div className="mb-4 flex-shrink-0 px-6">
        <label htmlFor="quest-filter" className="sr-only">Filter quests</label>
        <select 
          id="quest-filter" 
          value={filter} 
          onChange={handleFilterChange}
          className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] font-bold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]"
        >
          <option value="active">All Quests</option>
          <option value="today">Today's Quests</option>
          <option value="selected_day">Selected Day's Quests</option>
          <option value="completed">Completed Quests</option>
        </select>
      </div>

      {/* Daily Quests Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 px-6 ${isDailyQuestsVisible ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="p-3 bg-[rgba(var(--color-interactive-primary-rgb),0.1)] rounded-lg border border-[rgba(var(--color-border-primary-rgb),0.3)]">
          <h3 className="font-display text-xl text-[rgb(var(--color-accent-primary-rgb))]">Daily Rituals</h3>
          <p className="text-xs text-[rgb(var(--color-text-secondary-rgb))] mb-2">Complete all 3 to extend your streak!</p>
          <div className="space-y-2">
              {dailyQuests.map(quest => {
                  const isDone = quest.status === QuestStatus.COMPLETED || quest.status === QuestStatus.SKIPPED;
                  return (
                      <div key={quest.id} className={`p-2 rounded-md flex items-center gap-3 transition-opacity ${isDone ? 'opacity-50' : ''} ${quest.status === QuestStatus.SKIPPED ? 'bg-[rgba(var(--color-text-muted-rgb),0.2)]' : 'bg-[rgba(var(--color-background-primary-rgb),0.5)]'}`}>
                          {getDailyQuestIcon(quest)}
                          <div className="flex-1">
                              <p className={`text-sm font-bold truncate ${isDone ? 'line-through' : ''}`} title={quest.title}>{quest.title}</p>
                              <p className="text-xs text-[rgb(var(--color-accent-tertiary-rgb))]">+{quest.xp} XP</p>
                          </div>
                          {!isDone ? (
                              <div className="flex gap-1">
                                  <button onClick={() => onCompleteQuest(quest.id, new Date().toISOString().split('T')[0])} className="p-1.5 bg-green-600 rounded-md hover:bg-green-500"><CheckIcon className="w-4 h-4 text-white" /></button>
                                  <button onClick={() => onSkipDailyQuest(quest.id)} disabled={weeklySkips.count <= 0} className="p-1.5 bg-[rgb(var(--color-text-muted-rgb))] rounded-md hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                  </button>
                              </div>
                          ) : quest.status === QuestStatus.SKIPPED ? (
                              <span className="text-xs font-bold text-[rgb(var(--color-text-muted-rgb))]">SKIPPED</span>
                          ) : null}
                      </div>
                  )
              })}
          </div>
        </div>
      </div>
      
      {/* Scrollable Quest List */}
      <div className="space-y-3 flex-1 overflow-y-auto px-6 pb-20 scrollbar-thin scrollbar-thumb-[rgba(var(--color-accent-primary-rgb),0.3)] scrollbar-track-transparent">
        {isBriefingLoading && (
          <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))] animate-pulse">
            <p>Consulting the stars for the day's briefing...</p>
          </div>
        )}
        {questsToDisplay.length > 0 ? (
          questsToDisplay.map(quest => (
            <QuestItem 
              key={quest.id} 
              quest={quest} 
              isExpanded={expandedQuestId === quest.id}
              onToggleExpand={() => handleToggleExpand(quest.id)}
              onComplete={(questId) => onCompleteQuest(questId, dateForCompletion)}
              briefing={briefing?.get(quest.id)}
              isCompletedForDate={isQuestCompletedForDate(quest, dateForCompletion)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
             <ScrollIcon className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold">The Quest Log is Empty</h3>
            <p className="mt-2">No quests match the current filter.</p>
          </div>
        )}
      </div>

      {/* Suggestion Engine */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <QuestSuggestionEngine 
          contextQuests={questsToDisplay} 
          filter={filter} 
          onAddQuest={onAddQuest} 
          chatHistory={chatHistory} 
          selectedDate={selectedDate}
          extraSuggestions={extraSuggestions}
        />
      </div>

    </div>
    </>
  );
};

export default QuestBoard;