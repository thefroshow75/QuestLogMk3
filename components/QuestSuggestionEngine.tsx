import React, { useState, useEffect } from 'react';
import { Quest, ChatMessage } from '../types';
import { generateBatchSuggestions } from '../services/geminiService';
import { MagicWandIcon } from './icons/MagicWandIcon';

type QuestFilter = 'active' | 'completed' | 'today' | 'selected_day';

interface QuestSuggestionEngineProps {
  contextQuests: Quest[];
  filter: QuestFilter;
  onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
  chatHistory: ChatMessage[];
  selectedDate: string;
}

const QuestSuggestionEngine: React.FC<QuestSuggestionEngineProps> = ({ contextQuests, filter, onAddQuest, chatHistory, selectedDate }) => {
    const [suggestions, setSuggestions] = useState<Omit<Quest, 'id' | 'status'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (chatHistory.length <= 1 && contextQuests.length === 0) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const result = await generateBatchSuggestions(contextQuests, filter, chatHistory, selectedDate);
            setSuggestions(result || []);
            setIsLoading(false);
        };
        
        // Debounce fetching to avoid rapid calls on every keystroke in chat
        const handler = setTimeout(() => {
            fetchSuggestions();
        }, 500);

        return () => {
            clearTimeout(handler);
        };

    }, [filter, contextQuests, chatHistory, selectedDate]);

    const handleAccept = (quest: Omit<Quest, 'id'|'status'>) => {
        onAddQuest(quest);
        // Remove accepted quest from suggestions
        setSuggestions(prev => prev.filter(s => s.title !== quest.title));
    }

    return (
        <div className="mt-4 pt-4 border-t border-dashed border-[rgba(var(--color-accent-secondary-rgb),0.5)]">
            <h3 className="font-display text-[rgb(var(--color-accent-primary-rgb))] text-xl mb-2 flex items-center gap-2">
                <MagicWandIcon className="w-5 h-5" />
                Suggested Quests
            </h3>
            {isLoading ? (
                 <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[rgba(var(--color-text-muted-rgb),0.2)] p-3 rounded-lg animate-pulse h-16"></div>
                    ))}
                 </div>
            ) : suggestions.length > 0 ? (
                <div className="space-y-2">
                    {suggestions.map((quest, index) => (
                        <div key={index} className="bg-[rgba(var(--color-interactive-primary-rgb),0.2)] p-2.5 rounded-lg text-sm">
                            <p className="font-bold text-[rgb(var(--color-accent-primary-rgb))] truncate" title={quest.title}>{quest.title}</p>
                            <div className="flex justify-between items-center mt-1.5">
                                <span className="font-bold text-[rgb(var(--color-accent-tertiary-rgb))] text-xs">+{quest.xp} XP</span>
                                <button
                                    onClick={() => handleAccept(quest)}
                                    className="text-xs bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] font-bold py-1 px-2.5 rounded hover:opacity-90 transition-opacity"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[rgb(var(--color-text-muted-rgb))] text-sm text-center py-4">Talk to the coach to get new quest ideas!</p>
            )}
        </div>
    );
};

export default QuestSuggestionEngine;