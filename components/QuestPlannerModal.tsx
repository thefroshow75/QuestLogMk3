import React, { useState, useMemo } from 'react';
import { Quest, QuestStatus, ScheduleSuggestion } from '../types';
import { generateSchedule } from '../services/geminiService';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ScrollIcon } from './icons/ScrollIcon';

interface QuestPlannerModalProps {
    quests: Quest[];
    onClose: () => void;
    onApplySchedule: (schedule: ScheduleSuggestion[]) => void;
}

const QuestPlannerModal: React.FC<QuestPlannerModalProps> = ({ quests, onClose, onApplySchedule }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [proposedSchedule, setProposedSchedule] = useState<ScheduleSuggestion[] | null>(null);

    const { unscheduledQuests, scheduledQuests } = useMemo(() => {
        const unscheduled = quests.filter(q => q.status === QuestStatus.ACTIVE && !q.dueDate);
        const scheduled = quests.filter(q => q.status === QuestStatus.ACTIVE && !!q.dueDate);
        return { unscheduledQuests: unscheduled, scheduledQuests: scheduled };
    }, [quests]);

    const questTitleMap = useMemo(() => new Map(quests.map(q => [q.id, q.title])), [quests]);

    const handleSuggestSchedule = async () => {
        setIsLoading(true);
        setError(null);
        setProposedSchedule(null);
        try {
            const schedule = await generateSchedule(unscheduledQuests, scheduledQuests);
            if (schedule) {
                setProposedSchedule(schedule);
            } else {
                setError("The Oracle could not devise a plan. The stars are not aligned. Please try again later.");
            }
        } catch (e) {
            setError("A cosmic disturbance interrupted the Oracle's vision.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                    <MagicWandIcon className="w-16 h-16 mx-auto mb-4 animate-pulse text-[rgb(var(--color-interactive-primary-rgb))]" />
                    <h3 className="text-xl font-bold">The Oracle is consulting the stars...</h3>
                    <p className="mt-2">Please wait while a grand schedule is forged for your quests.</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-center text-red-400">{error}</p>;
        }
        
        if (proposedSchedule) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-[rgb(var(--color-accent-primary-rgb))] mb-3 text-center">Proposed Schedule</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {proposedSchedule.map(item => (
                            <li key={item.id} className="bg-[rgba(var(--color-background-secondary-rgb),0.5)] p-3 rounded-md flex justify-between items-center">
                                <span className="font-semibold">{questTitleMap.get(item.id) || 'Unknown Quest'}</span>
                                <span className="font-bold text-[rgb(var(--color-accent-quaternary-rgb))]">{new Date(item.suggestedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (unscheduledQuests.length > 0) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-[rgb(var(--color-accent-primary-rgb))] mb-3">Unscheduled Quests</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {unscheduledQuests.map(quest => <li key={quest.id} className="bg-[rgba(var(--color-background-secondary-rgb),0.5)] p-2 rounded-md">{quest.title}</li>)}
                    </ul>
                </div>
            );
        }

        return (
            <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                <ScrollIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No Quests Await Planning</h3>
                <p className="mt-2">All active quests have been scheduled. Forge new ones to continue!</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-lg flex flex-col min-h-[300px]">
                <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))] mb-4 text-center">Quest Planner</h2>
                <div className="flex-1">
                    {renderContent()}
                </div>
                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-[rgba(var(--color-text-muted-rgb),0.3)]">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-text-muted-rgb))] text-[rgb(var(--color-text-primary-rgb))] rounded-lg hover:opacity-80 transition-opacity">
                        {proposedSchedule ? 'Cancel' : 'Close'}
                    </button>
                    {proposedSchedule ? (
                        <button onClick={() => onApplySchedule(proposedSchedule)} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors">
                            Accept Schedule
                        </button>
                    ) : (
                        <button onClick={handleSuggestSchedule} disabled={isLoading || unscheduledQuests.length === 0} className="flex items-center gap-2 px-6 py-2 bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                            <MagicWandIcon className="w-5 h-5"/>
                            Suggest Schedule
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestPlannerModal;