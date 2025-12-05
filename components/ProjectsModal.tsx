import React, { useState } from 'react';
import { Project, ProjectStep, Quest, QuestStatus } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { LockIcon } from './icons/LockIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SwordIcon } from './icons/SwordIcon';

interface ProjectsModalProps {
    projects: Project[];
    onClose: () => void;
    onCreateProject: () => void;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const completedSteps = project.steps.filter(s => s.status === 'COMPLETED').length;
    const progress = (completedSteps / project.steps.length) * 100;

    return (
        <div className="bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-border-primary-rgb),0.3)] rounded-lg overflow-hidden transition-all duration-300">
            <div 
                className="p-4 cursor-pointer hover:bg-[rgba(var(--color-interactive-primary-rgb),0.1)] flex justify-between items-center"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-display text-[rgb(var(--color-accent-primary-rgb))]">{project.title}</h3>
                        {project.status === 'COMPLETED' && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">COMPLETED</span>}
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-secondary-rgb))] mb-2">{project.description}</p>
                    <div className="w-full h-2 bg-[rgba(var(--color-text-muted-rgb),0.2)] rounded-full overflow-hidden">
                        <div className="h-full bg-[rgb(var(--color-accent-tertiary-rgb))]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="ml-4">
                     <ChevronDownIcon className={`w-6 h-6 text-[rgb(var(--color-text-muted-rgb))] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[rgba(var(--color-border-primary-rgb),0.2)] bg-[rgba(var(--color-background-primary-rgb),0.3)] space-y-4">
                    {project.steps.map((step, index) => (
                        <StepItem key={step.id} step={step} isLast={index === project.steps.length - 1} />
                    ))}
                    <div className="text-center pt-2">
                        <span className="text-xs text-[rgb(var(--color-text-muted-rgb))] uppercase tracking-widest font-bold">Total Reward: {project.totalXp} XP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const StepItem: React.FC<{ step: ProjectStep; isLast: boolean }> = ({ step, isLast }) => {
    const isLocked = step.status === 'LOCKED';
    const isCompleted = step.status === 'COMPLETED';

    return (
        <div className={`relative pl-8 ${!isLast ? 'pb-6 border-l-2 border-[rgba(var(--color-text-muted-rgb),0.2)]' : ''}`}>
            {/* Status Icon */}
            <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[rgb(var(--color-background-primary-rgb))] ${isCompleted ? 'border-green-500' : isLocked ? 'border-[rgb(var(--color-text-muted-rgb))]' : 'border-[rgb(var(--color-accent-secondary-rgb))]'}`}>
                {isCompleted ? (
                    <CheckIcon className="w-3 h-3 text-green-500" />
                ) : isLocked ? (
                    <LockIcon className="w-3 h-3 text-[rgb(var(--color-text-muted-rgb))]" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-accent-secondary-rgb))]" />
                )}
            </div>

            <h4 className={`font-bold ${isLocked ? 'text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-text-primary-rgb))]'}`}>
                {step.title}
            </h4>
            
            {!isLocked && (
                <div className="mt-3 space-y-2">
                    {step.quests.map(quest => (
                        <div key={quest.id} className={`flex items-center gap-3 p-2 rounded-md ${quest.status === QuestStatus.LOCKED ? 'opacity-50' : 'bg-[rgba(var(--color-background-secondary-rgb),0.3)]'}`}>
                            {quest.status === QuestStatus.COMPLETED ? (
                                <div className="p-1 bg-green-600 rounded-md">
                                    <CheckIcon className="w-3 h-3 text-white" />
                                </div>
                            ) : quest.status === QuestStatus.LOCKED ? (
                                <LockIcon className="w-5 h-5 text-[rgb(var(--color-text-muted-rgb))]" />
                            ) : (
                                <SwordIcon className="w-5 h-5 text-[rgb(var(--color-accent-secondary-rgb))]" />
                            )}
                            
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${quest.status === QuestStatus.COMPLETED ? 'line-through text-[rgb(var(--color-text-muted-rgb))]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>
                                    {quest.title}
                                </p>
                            </div>
                            <span className="text-xs font-bold text-[rgb(var(--color-accent-tertiary-rgb))]">+{quest.xp} XP</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectsModal: React.FC<ProjectsModalProps> = ({ projects, onClose, onCreateProject }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[rgba(var(--color-accent-secondary-rgb),0.2)] rounded-lg">
                             <FolderIcon className="w-6 h-6 text-[rgb(var(--color-accent-secondary-rgb))]" />
                        </div>
                        <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Active Projects</h2>
                    </div>
                    <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                            <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">No Projects Founded</h3>
                            <p className="mt-2 mb-6">Start a new long-term journey to track your progress.</p>
                            <button 
                                onClick={onCreateProject}
                                className="px-6 py-2 bg-[rgb(var(--color-interactive-primary-rgb))] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Start Sample Project
                            </button>
                        </div>
                    )}
                </div>
                 {projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] text-right">
                         <button 
                                onClick={onCreateProject}
                                className="text-sm font-bold text-[rgb(var(--color-accent-secondary-rgb))] hover:underline"
                            >
                                + Add Another Sample Project
                            </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ProjectsModal;