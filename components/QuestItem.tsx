import React from 'react';
import { Quest, QuestStatus } from '../types';
import { SwordIcon } from './icons/SwordIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface QuestItemProps {
  quest: Quest;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: (questId: string) => void;
  briefing?: { timeframe: string; hint: string };
}

const QuestItem: React.FC<QuestItemProps> = ({ quest, isExpanded, onToggleExpand, onComplete, briefing }) => {
  const isCompleted = quest.status === QuestStatus.COMPLETED;

  return (
    <div
      className={`
        p-4 rounded-lg border 
        transition-all duration-300
        ${
          isCompleted
            ? 'bg-[rgba(var(--color-text-muted-rgb),0.2)] border-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]'
            : 'bg-[rgba(var(--color-interactive-primary-rgb),0.15)] border-[rgba(var(--color-border-primary-rgb),0.4)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.25)] hover:border-[rgba(var(--color-border-primary-rgb),0.7)]'
        }
      `}
    >
      {/* Clickable Header */}
      <div className="flex items-start space-x-4 cursor-pointer" onClick={onToggleExpand}>
        <div className={`mt-1 ${isCompleted ? 'opacity-50' : ''}`}>
          <SwordIcon className="w-6 h-6 text-[rgb(var(--color-accent-secondary-rgb))]" />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${isCompleted ? 'line-through text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-primary-rgb))]'}`}>
            {quest.title}
          </h3>
        </div>
        <div className="flex items-center space-x-3 pl-4">
          <span
            className={`
              font-bold text-sm px-3 py-1 rounded-full
              ${isCompleted ? 'bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]' : 'bg-[rgba(var(--color-accent-tertiary-rgb),0.2)] text-[rgb(var(--color-accent-tertiary-rgb))]'}
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
          <p className={`text-sm ${isCompleted ? 'text-[rgba(var(--color-text-muted-rgb),0.8)]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>
            {quest.description}
          </p>
          {briefing && (
            <div className="mt-3 p-3 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] rounded-lg border border-[rgba(var(--color-border-primary-rgb),0.5)]">
              <p className="text-sm font-bold text-[rgb(var(--color-accent-primary-rgb))]">Today's Briefing:</p>
              <p className="text-xs mt-1 text-[rgb(var(--color-text-secondary-rgb))]"><strong className="text-[rgb(var(--color-accent-quaternary-rgb))]">Timeframe:</strong> {briefing.timeframe}</p>
              <p className="text-xs mt-1 text-[rgb(var(--color-text-secondary-rgb))]"><strong className="text-[rgb(var(--color-accent-quaternary-rgb))]">Hint:</strong> {briefing.hint}</p>
            </div>
          )}
          {quest.dueDate && (
               <p className={`text-xs font-semibold ${isCompleted ? 'text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-quaternary-rgb))]'}`}>
                  Due: {new Date(quest.dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
          )}
          {quest.tags && quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quest.tags.map((tag, index) => (
                <span key={index} className={`text-xs font-semibold px-2 py-1 rounded-full ${isCompleted ? 'bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-muted-rgb))]' : 'bg-[rgba(var(--color-accent-quaternary-rgb),0.2)] text-[rgb(var(--color-accent-quaternary-rgb))]'}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
             {!isCompleted && (
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