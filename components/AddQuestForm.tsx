import React, { useState } from 'react';
import { Quest, QuestType, RepeatFrequency } from '../types';

interface AddQuestFormProps {
    onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
    onClose: () => void;
}

const weekDays = [ 'Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa' ];

const AddQuestForm: React.FC<AddQuestFormProps> = ({ onAddQuest, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [xp, setXp] = useState(50);
    const [tags, setTags] = useState('');

    const [questType, setQuestType] = useState<QuestType>(QuestType.ONCE);

    // One-time quest state
    const [dueDate, setDueDate] = useState('');

    // Recurring quest state
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>(RepeatFrequency.WEEKLY);
    const [repeatDays, setRepeatDays] = useState<number[]>([]);


    const handleRepeatDayToggle = (dayIndex: number) => {
        setRepeatDays(prev => 
            prev.includes(dayIndex) 
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex]
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert('Title and description are required.');
            return;
        }

        const commonQuestData = {
            title,
            description,
            xp: Number(xp),
            tags: tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag),
        };

        let newQuest: Omit<Quest, 'id' | 'status'>;

        if (questType === QuestType.RECURRING) {
             if (repeatFrequency === RepeatFrequency.WEEKLY && repeatDays.length === 0) {
                alert('Please select at least one day for weekly recurring quests.');
                return;
            }
            newQuest = {
                ...commonQuestData,
                type: QuestType.RECURRING,
                startDate: startDate || new Date().toISOString().split('T')[0],
                endDate: endDate || undefined,
                repeatFrequency,
                repeatDays: repeatFrequency === RepeatFrequency.DAILY ? [] : repeatDays,
            };
        } else {
             newQuest = {
                ...commonQuestData,
                type: QuestType.ONCE,
                dueDate: dueDate || undefined,
            };
        }
        
        onAddQuest(newQuest);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-lg">
                <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))] mb-4">Forge a New Quest</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Quest Type Selector */}
                    <div className="flex rounded-lg border border-[rgba(var(--color-text-muted-rgb),0.5)] p-1">
                        <button type="button" onClick={() => setQuestType(QuestType.ONCE)} className={`w-1/2 py-2 rounded-md font-bold transition-colors ${questType === QuestType.ONCE ? 'bg-[rgb(var(--color-interactive-primary-rgb))] text-white' : 'hover:bg-[rgba(var(--color-interactive-primary-rgb),0.3)]'}`}>One-Time</button>
                        <button type="button" onClick={() => setQuestType(QuestType.RECURRING)} className={`w-1/2 py-2 rounded-md font-bold transition-colors ${questType === QuestType.RECURRING ? 'bg-[rgb(var(--color-interactive-primary-rgb))] text-white' : 'hover:bg-[rgba(var(--color-interactive-primary-rgb),0.3)]'}`}>Recurring</button>
                    </div>

                    {/* Common Fields */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Quest Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]"></textarea>
                    </div>
                    
                    {/* Conditional Fields */}
                    {questType === QuestType.ONCE ? (
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Due Date (Optional)</label>
                            <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" style={{ colorScheme: 'dark' }} />
                        </div>
                    ) : (
                        <div className="space-y-4 p-3 bg-[rgba(var(--color-background-secondary-rgb),0.3)] rounded-lg">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label htmlFor="startDate" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Start Date</label>
                                    <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" style={{ colorScheme: 'dark' }} />
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="endDate" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">End Date (Optional)</label>
                                    <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" style={{ colorScheme: 'dark' }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-2">Repeat Frequency</label>
                                <select value={repeatFrequency} onChange={e => setRepeatFrequency(e.target.value as RepeatFrequency)} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]">
                                    <option value={RepeatFrequency.WEEKLY}>Weekly</option>
                                    <option value={RepeatFrequency.DAILY}>Daily</option>
                                </select>
                            </div>
                            {repeatFrequency === RepeatFrequency.WEEKLY && (
                                <div>
                                    <label className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-2">On these days:</label>
                                    <div className="flex justify-between gap-1">
                                        {weekDays.map((day, index) => (
                                            <button type="button" key={index} onClick={() => handleRepeatDayToggle(index)} className={`w-10 h-10 flex-grow font-bold text-sm rounded-lg border-2 transition-colors ${repeatDays.includes(index) ? 'bg-[rgb(var(--color-accent-quaternary-rgb))] text-black border-transparent' : 'border-[rgba(var(--color-text-muted-rgb),0.5)] hover:bg-[rgba(var(--color-text-muted-rgb),0.3)]'}`}>
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Common Fields Continued */}
                     <div>
                        <label htmlFor="xp" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">XP Reward (per completion)</label>
                        <input id="xp" type="number" value={xp} onChange={e => setXp(Number(e.target.value))} min="10" max="100" required className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Tags (comma-separated)</label>
                        <input id="tags" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. fitness, learning, work" className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" />
                    </div>

                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-text-muted-rgb))] text-[rgb(var(--color-text-primary-rgb))] rounded-lg hover:opacity-80 transition-opacity">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] font-bold rounded-lg hover:opacity-90 transition-opacity">Forge Quest</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestForm;