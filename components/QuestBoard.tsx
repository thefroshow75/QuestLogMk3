import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Quest, QuestStatus, DailyBriefingItem, ChatMessage } from '../types';
import QuestItem from './QuestItem';
import { ScrollIcon } from './icons/ScrollIcon';
import AddQuestForm from './AddQuestForm';
import { PlusIcon } from './icons/PlusIcon';
import { generateDailyBriefing } from '../services/geminiService';
import QuestSuggestionEngine from './QuestSuggestionEngine';

interface QuestBoardProps {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
  onOpenPlanner: () => void;
  hasUnscheduledQuests: boolean;
  chatHistory: ChatMessage[];
  selectedDate: string;
}

type QuestFilter = 'active' | 'completed' | 'today' | 'selected_day';

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onCompleteQuest, onAddQuest, onOpenPlanner, hasUnscheduledQuests, chatHistory, selectedDate }) => {
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
        return quests.filter(q => q.status === QuestStatus.ACTIVE);
      case 'completed':
        return quests.filter(q => q.status === QuestStatus.COMPLETED);
      case 'today':
        return quests.filter(q => q.status === QuestStatus.ACTIVE && q.dueDate === todayStr);
      case 'selected_day':
        return quests.filter(q => q.status === QuestStatus.ACTIVE && q.dueDate === selectedDate);
      default:
        return [];
    }
  }, [quests, filter, selectedDate]);

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
    if ((filter === 'today' || filter === 'selected_day') && questsToDisplay.length > 0) {
      const fetchBriefing = async () => {
        setIsBriefingLoading(true);
        setBriefing(null);
        const briefingItems = await generateDailyBriefing(questsToDisplay);
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

  return (
    <>
    {isAddFormVisible && <AddQuestForm onAddQuest={onAddQuest} onClose={() => setIsAddFormVisible(false)} />}
    <div className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.2)] h-full flex flex-col">
      <div className="flex justify-between items-center pb-4 flex-shrink-0">
          <h2 className="font-display text-3xl text-[rgb(var(--color-accent-primary-rgb))]">Quest Board</h2>
          <div className="flex items-center space-x-2">
            <div className="relative" ref={addMenuRef}>
              <button 
                onClick={() => setIsAddMenuOpen(prev => !prev)}
                className="w-10 h-10 bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Add or plan quests"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-background-primary-rgb))] border border-[rgba(var(--color-border-primary-rgb),0.5)] rounded-lg shadow-xl z-10">
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

      <div className="mb-4 flex-shrink-0">
        <label htmlFor="quest-filter" className="sr-only">Filter quests</label>
        <select 
          id="quest-filter" 
          value={filter} 
          onChange={handleFilterChange}
          className="w-full bg-[rgba(var(--color-background-primary-rgb),0.8)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] font-bold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]"
        >
          <option value="active">Active Quests</option>
          <option value="today">Today's Quests</option>
          <option value="selected_day">Selected Day's Quests</option>
          <option value="completed">Completed Quests</option>
        </select>
      </div>
      
      <div className="space-y-2 flex-1 overflow-y-auto pt-1 pr-2 -mr-2">
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
              onComplete={onCompleteQuest}
              briefing={briefing?.get(quest.id)}
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

      <div className="flex-shrink-0">
        <QuestSuggestionEngine contextQuests={questsToDisplay} filter={filter} onAddQuest={onAddQuest} chatHistory={chatHistory} selectedDate={selectedDate} />
      </div>

    </div>
    </>
  );
};

export default QuestBoard;