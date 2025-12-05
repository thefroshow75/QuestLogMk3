import React, { useState, useEffect } from 'react';
import { Quest, ChatMessage } from '../types';
import { generateBatchSuggestions } from '../services/geminiService';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';

type QuestFilter = 'active' | 'completed' | 'today' | 'selected_day';

interface QuestSuggestionEngineProps {
  contextQuests: Quest[];
  filter: QuestFilter;
  onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
  chatHistory: ChatMessage[];
  selectedDate: string;
  extraSuggestions: number;
}

const QuestSuggestionEngine: React.FC<QuestSuggestionEngineProps> = ({ contextQuests, filter, onAddQuest, chatHistory, selectedDate, extraSuggestions }) => {
    const [suggestions, setSuggestions] = useState<Omit<Quest, 'id' | 'status'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (chatHistory.length <= 1 && contextQuests.length === 0) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const numberOfSuggestions = 3 + extraSuggestions;
            const result = await generateBatchSuggestions(contextQuests, filter, chatHistory, selectedDate, numberOfSuggestions);
            setSuggestions(result || []);
            setIsLoading(false);
        };
        
        // Fetch when opened if empty
        if (isOpen && suggestions.length === 0 && !isLoading) {
             fetchSuggestions();
        }

    }, [isOpen, filter, contextQuests, chatHistory, selectedDate, extraSuggestions]);

    const handleAccept = (quest: Omit<Quest, 'id'|'status'>) => {
        onAddQuest(quest);
        setSuggestions(prev => prev.filter(s => s.title !== quest.title));
    }

    return (
        <div className={`
            bg-[rgb(var(--color-background-primary-rgb))] 
            border-t border-[rgba(var(--color-border-primary-rgb),0.5)] 
            rounded-t-xl 
            shadow-[0_-4px_6px_-1px_rgba(var(--color-interactive-primary-rgb),0.3)]
            transition-all duration-300 ease-in-out
            flex flex-col
            ${isOpen ? 'h-80' : 'h-12'}
        `}>
            {/* Toggle Header */}
            <div 
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(var(--color-interactive-primary-rgb),0.1)] transition-colors rounded-t-xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <MagicWandIcon className="w-5 h-5 text-[rgb(var(--color-accent-primary-rgb))]" />
                    <h3 className="font-display text-[rgb(var(--color-accent-primary-rgb))] text-lg">
                        Quest Predictions
                    </h3>
                </div>
                {/* Drop-up arrow indicator */}
                <div className="flex items-center gap-2">
                     <span className="text-xs text-[rgb(var(--color-text-muted-rgb))] uppercase font-bold tracking-wider">{isOpen ? 'Hide' : 'Reveal'}</span>
                     <ChevronDownIcon className={`w-6 h-6 text-[rgb(var(--color-text-muted-rgb))] transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
                </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto px-4 pb-4 ${isOpen ? 'block' : 'hidden'}`}>
                {isLoading ? (
                     <div className="space-y-2 mt-2">
                        {[...Array(3 + extraSuggestions)].map((_, i) => (
                            <div key={i} className="bg-[rgba(var(--color-text-muted-rgb),0.2)] p-3 rounded-lg animate-pulse h-16"></div>
                        ))}
                     </div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-2 mt-2">
                        {suggestions.map((quest, index) => (
                            <div key={index} className="bg-[rgba(var(--color-interactive-primary-rgb),0.1)] p-3 rounded-lg border border-[rgba(var(--color-interactive-primary-rgb),0.2)] flex justify-between items-start gap-3 group hover:border-[rgba(var(--color-interactive-primary-rgb),0.5)] transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-[rgb(var(--color-accent-primary-rgb))]">{quest.title}</h4>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary-rgb))] mt-1 line-clamp-2">{quest.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-bold text-[rgb(var(--color-accent-tertiary-rgb))]">+{quest.xp} XP</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAccept(quest); }}
                                    className="p-2 bg-[rgb(var(--color-interactive-primary-rgb))] text-white rounded-lg hover:opacity-90 transition-opacity"
                                    title="Accept Quest"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-[rgb(var(--color-text-muted-rgb))]">
                        <p>No visions appear at this moment. Chat more with the Oracle or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestSuggestionEngine;