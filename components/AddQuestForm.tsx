import React, { useState } from 'react';
import { Quest } from '../types';

interface AddQuestFormProps {
    onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
    onClose: () => void;
}

const AddQuestForm: React.FC<AddQuestFormProps> = ({ onAddQuest, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [xp, setXp] = useState(50);
    const [dueDate, setDueDate] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert('Title and description are required.');
            return;
        }

        const newQuest: Omit<Quest, 'id' | 'status'> = {
            title,
            description,
            xp: Number(xp),
            dueDate: dueDate || undefined,
            tags: tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag),
        };

        onAddQuest(newQuest);
        onClose(); // Close the form after submission
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-lg">
                <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))] mb-4">Forge a New Quest</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Quest Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]"></textarea>
                    </div>
                    <div>
                        <label htmlFor="xp" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">XP Reward</label>
                        <input id="xp" type="number" value={xp} onChange={e => setXp(Number(e.target.value))} min="10" max="100" required className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" />
                    </div>
                     <div>
                        <label htmlFor="dueDate" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Due Date (Optional)</label>
                        <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]" style={{ colorScheme: 'dark' }} />
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