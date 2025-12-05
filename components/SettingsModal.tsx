import React from 'react';
import { Theme } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { LockIcon } from './icons/LockIcon';

interface SettingsModalProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onClose: () => void;
    unlockedItemIds: string[];
}

const themes: { id: Theme; name: string; colors: string[]; itemId?: string }[] = [
    { id: 'dark-fantasy', name: 'Dark Fantasy', colors: ['#FCD34D', '#8B5CF6', '#6EE7B7'] }, // Default
    { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#ff00e5', '#00f6ff', '#00ff00'], itemId: 'item_theme_cyberpunk' },
    { id: 'space', name: 'Space', colors: ['#f0f8ff', '#87CEEB', '#5a67d8'], itemId: 'item_theme_space' },
    { id: 'scifi', name: 'Sci-Fi', colors: ['#4299E1', '#38A169', '#E0E5F0'], itemId: 'item_theme_scifi' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ currentTheme, onThemeChange, onClose, unlockedItemIds }) => {
    
    const handleThemeSelect = (theme: typeof themes[0]) => {
        if (!theme.itemId || unlockedItemIds.includes(theme.itemId)) {
            onThemeChange(theme.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Settings</h2>
                    <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-3">Visual Theme</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {themes.map(theme => {
                                const isUnlocked = !theme.itemId || unlockedItemIds.includes(theme.itemId);
                                const isActive = currentTheme === theme.id;

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme)}
                                        className={`
                                            relative flex items-center justify-between p-3 rounded-lg border-2 transition-all
                                            ${isActive 
                                                ? 'border-[rgb(var(--color-accent-secondary-rgb))] bg-[rgba(var(--color-accent-secondary-rgb),0.1)]' 
                                                : 'border-[rgba(var(--color-text-muted-rgb),0.3)] bg-[rgba(var(--color-background-secondary-rgb),0.5)]'
                                            }
                                            ${!isUnlocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-[rgba(var(--color-accent-secondary-rgb),0.5)]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex space-x-1">
                                                {theme.colors.map(color => (
                                                    <div key={color} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                            <span className={`font-bold ${isActive ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>
                                                {theme.name}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            {isActive && <CheckIcon className="w-5 h-5 text-[rgb(var(--color-accent-secondary-rgb))]" />}
                                            {!isUnlocked && <LockIcon className="w-5 h-5 text-[rgb(var(--color-text-muted-rgb))]" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;