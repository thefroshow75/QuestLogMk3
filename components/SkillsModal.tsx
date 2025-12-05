import React from 'react';
import { User, SkillDefinition } from '../types';
import { skillDefinitions } from '../data/skills';

interface SkillsModalProps {
    user: User;
    onClose: () => void;
    onSpendSkillPoint: (skillId: string) => void;
}

const SkillCard: React.FC<{
    skill: SkillDefinition;
    user: User;
    onSpend: (skillId: string) => void;
}> = ({ skill, user, onSpend }) => {
    const currentLevel = user.unlockedSkills[skill.id] || 0;
    const isMaxLevel = currentLevel >= skill.maxLevel;
    const nextLevelCost = skill.cost(currentLevel + 1);
    const canAfford = user.skillPoints >= nextLevelCost;

    let isLocked = false;
    let prereqText = '';
    if (skill.prerequisites) {
        for (const prereqId in skill.prerequisites) {
            const requiredLevel = skill.prerequisites[prereqId];
            const currentPrereqLevel = user.unlockedSkills[prereqId] || 0;
            if (currentPrereqLevel < requiredLevel) {
                isLocked = true;
                const prereqSkill = skillDefinitions.find(s => s.id === prereqId);
                prereqText = `Requires ${prereqSkill?.name} Lv. ${requiredLevel}`;
                break;
            }
        }
    }

    const isDisabled = isLocked || isMaxLevel || !canAfford;
    const effect = skill.getEffect(currentLevel);

    return (
        <div className={`p-4 rounded-lg border-2 transition-all ${isLocked ? 'bg-[rgba(var(--color-text-muted-rgb),0.1)] border-[rgba(var(--color-text-muted-rgb),0.2)]' : 'bg-[rgba(var(--color-interactive-primary-rgb),0.15)] border-[rgba(var(--color-border-primary-rgb),0.4)]'}`}>
            <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full ${isLocked ? 'bg-[rgba(var(--color-text-muted-rgb),0.3)]' : 'bg-[rgba(var(--color-accent-secondary-rgb),0.3)]'}`}>
                   <skill.icon className={`w-6 h-6 ${isLocked ? 'text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-secondary-rgb))]'}`} />
                </div>
                <div className="flex-1">
                    <h4 className={`font-bold text-lg ${isLocked ? 'text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-accent-primary-rgb))]'}`}>{skill.name}</h4>
                    <p className="text-sm text-[rgb(var(--color-text-secondary-rgb))] mt-1">{skill.description}</p>
                    {effect && (
                        <p className="text-xs font-bold text-[rgb(var(--color-accent-tertiary-rgb))] mt-1">
                            Current Bonus: +{effect.value}{effect.type === 'XP_BOOST' ? '%' : ''}
                        </p>
                    )}
                    {prereqText && <p className="text-xs font-bold text-red-400 mt-1">{prereqText}</p>}
                </div>
                <div className="text-center">
                    <div className="font-bold text-lg">{currentLevel} / {skill.maxLevel}</div>
                    <div className="text-xs text-[rgb(var(--color-text-muted-rgb))]">Level</div>
                </div>
            </div>
            {!isMaxLevel && !isLocked && (
                <div className="flex justify-end items-center mt-3">
                     <button 
                        onClick={() => onSpend(skill.id)}
                        disabled={isDisabled}
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       Upgrade (Cost: {nextLevelCost} SP)
                    </button>
                </div>
            )}
        </div>
    )
}


const SkillsModal: React.FC<SkillsModalProps> = ({ user, onClose, onSpendSkillPoint }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Skills</h2>
                    <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>
                
                <div className="text-center mb-4 p-3 bg-[rgba(var(--color-background-secondary-rgb),0.5)] rounded-lg">
                    <p className="text-xl font-bold">Available Skill Points: <span className="text-[rgb(var(--color-accent-tertiary-rgb))]">{user.skillPoints}</span></p>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="font-display text-xl text-[rgb(var(--color-accent-secondary-rgb))]">Forge Master</h3>
                    {skillDefinitions.map(skill => (
                        <SkillCard key={skill.id} skill={skill} user={user} onSpend={onSpendSkillPoint} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SkillsModal;
