import React from 'react';
import { Achievement, AchievementDefinition } from '../types';

interface AchievementsModalProps {
    achievements: Achievement[];
    definitions: AchievementDefinition[];
    onClose: () => void;
}

const AchievementCard: React.FC<{
    definition: AchievementDefinition;
    unlocked: Achievement | undefined;
}> = ({ definition, unlocked }) => {
    return (
        <div className={`p-4 rounded-lg border-2 flex items-start gap-4 transition-all ${unlocked ? 'bg-[rgba(var(--color-interactive-primary-rgb),0.15)] border-[rgba(var(--color-accent-tertiary-rgb),0.7)]' : 'bg-[rgba(var(--color-text-muted-rgb),0.1)] border-[rgba(var(--color-text-muted-rgb),0.2)] opacity-60'}`}>
            <div className={`mt-1 p-2 rounded-full ${unlocked ? 'bg-[rgba(var(--color-accent-tertiary-rgb),0.3)]' : 'bg-[rgba(var(--color-text-muted-rgb),0.3)]'}`}>
                <definition.icon className={`w-8 h-8 ${unlocked ? 'text-[rgb(var(--color-accent-tertiary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))]'}`} />
            </div>
            <div className="flex-1">
                <h4 className={`font-bold text-lg ${unlocked ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))]'}`}>{definition.name}</h4>
                <p className="text-sm text-[rgb(var(--color-text-secondary-rgb))] mt-1">{definition.description}</p>
                {unlocked && (
                    <p className="text-xs text-[rgb(var(--color-accent-quaternary-rgb))] mt-2">
                        Unlocked on: {new Date(unlocked.date).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

const AchievementsModal: React.FC<AchievementsModalProps> = ({ achievements, definitions, onClose }) => {
    const unlockedMap = new Map(achievements.map(a => [a.id, a]));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Achievements</h2>
                    <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {definitions.map(def => (
                        <AchievementCard key={def.id} definition={def} unlocked={unlockedMap.get(def.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
