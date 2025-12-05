import React from 'react';
import { Quest, QuestStatus, QuestType } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import { MapIcon } from './icons/MapIcon';

interface QuestItemProps {
  quest: Quest;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: (questId: string) => void;
  briefing?: { timeframe: string; hint: string };
  isCompletedForDate?: boolean;
}

const QuestItem: React.FC<QuestItemProps> = ({ quest, isExpanded, onToggleExpand, onComplete, briefing, isCompletedForDate }) => {
  const isCompleted = quest.status === QuestStatus.COMPLETED || isCompletedForDate;
  const isActionable = quest.status === QuestStatus.ACTIVE && !isCompletedForDate;

  const getDueDateDisplay = () => {
    if (quest.type === QuestType.RECURRING) {
      let schedule = quest.repeatFrequency === 'DAILY' ? 'Daily' : 'Weekly';
      if (quest.repeatFrequency === 'WEEKLY' && quest.repeatDays?.length) {
         const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
         schedule = quest.repeatDays.map(d => days[d]).join(', ');
      }
      return `Repeats: ${schedule}`;
    }
    if (quest.dueDate) {
       return `Due: ${new Date(quest.dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`;
    }
    return null;
  }
  const dueDateDisplay = getDueDateDisplay();

  return (
    <div
      className={`
        p-4 rounded-lg border 
        transition-all duration-300
        ${
          !isActionable
            ? 'bg-[rgba(var(--color-text-muted-rgb),0.2)] border-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]'
            : 'bg-[rgba(var(--color-interactive-primary-rgb),0.15)] border-[rgba(var(--color-border-primary-rgb),0.4)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.25)] hover:border-[rgba(var(--color-border-primary-rgb),0.7)]'
        }
      `}
    >
      {/* Clickable Header */}
      <div className="flex items-start space-x-4 cursor-pointer" onClick={onToggleExpand}>
        <div className={`mt-1 ${!isActionable ? 'opacity-50' : ''}`}>
           {quest.type === QuestType.RECURRING
            ? <RepeatIcon className="w-6 h-6 text-[rgb(var(--color-accent-quaternary-rgb))]" />
            : <MapIcon className="w-6 h-6 text-[rgb(var(--color-accent-secondary-rgb))]" />}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${!isActionable ? 'line-through text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-primary-rgb))]'}`}>
            {quest.title}
          </h3>
        </div>
        <div className="flex items-center space-x-3 pl-4">
          <span
            className={`
              font-bold text-sm px-3 py-1 rounded-full
              ${!isActionable ? 'bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]' : 'bg-[rgba(var(--color-accent-tertiary-rgb),0.2)] text-[rgb(var(--color-accent-tertiary-rgb))]'}
            `}
          >
            +{quest.xp} XP
          </span>
          <ChevronDownIcon className={`w-5 h-5 text-[rgb(var(--color-text-muted-rgb))] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 pt-4' : 'max-h-0'}`}>
        <div className="pl-10 space-y-3">
          <p className={`text-sm ${!isActionable ? 'text-[rgba(var(--color-text-muted-rgb),0.8)]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>
            {quest.description}
          </p>
          {briefing && (
            <div className="mt-3 p-3 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] rounded-lg border border-[rgba(var(--color-border-primary-rgb),0.5)]">
              <p className="text-sm font-bold text-[rgb(var(--color-accent-primary-rgb))]">Today's Briefing:</p>
              <p className="text-xs mt-1 text-[rgb(var(--color-text-secondary-rgb))]"><strong className="text-[rgb(var(--color-accent-quaternary-rgb))]">Timeframe:</strong> {briefing.timeframe}</p>
              <p className="text-xs mt-1 text-[rgb(var(--color-text-secondary-rgb))]"><strong className="text-[rgb(var(--color-accent-quaternary-rgb))]">Hint:</strong> {briefing.hint}</p>
            </div>
          )}
          {dueDateDisplay && (
               <p className={`text-xs font-semibold ${!isActionable ? 'text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-quaternary-rgb))]'}`}>
                  {dueDateDisplay}
              </p>
          )}
          {quest.tags && quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quest.tags.map((tag, index) => (
                <span key={index} className={`text-xs font-semibold px-2 py-1 rounded-full ${!isActionable ? 'bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]' : 'bg-[rgba(var(--color-accent-quaternary-rgb),0.2)] text-[rgb(var(--color-accent-quaternary-rgb))]'}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
             {isActionable && (
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(quest.id); }}
                  className="group flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-lg bg-[rgba(var(--color-text-muted-rgb),0.4)] hover:bg-green-600 border border-[rgba(var(--color-text-muted-rgb),0.5)] hover:border-green-500 transition-colors duration-200 text-[rgb(var(--color-text-secondary-rgb))] hover:text-white"
                  aria-label={`Complete quest: ${quest.title}`}
                >
                  <CheckIcon className="w-5 h-5" />
                  Complete Quest
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestItem;