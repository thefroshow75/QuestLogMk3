import React from 'react';

type Theme = 'dark-fantasy' | 'cyberpunk' | 'space' | 'scifi';

interface SettingsModalProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onClose: () => void;
}

const themes: { id: Theme; name: string; colors: string[] }[] = [
    { id: 'dark-fantasy', name: 'Dark Fantasy', colors: ['#FCD34D', '#8B5CF6', '#6EE7B7'] },
    { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#ff00e5', '#00f6ff', '#00ff00'] },
    { id: 'space', name: 'Space', colors: ['#f0f8ff', '#87CEEB', '#5a67d8'] },
    { id: 'scifi', name: 'Sci-Fi', colors: ['#4299e1', '#4fd1c5', '#9f7aea'] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ currentTheme, onThemeChange, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Select Theme</h2>
                    <button onClick={onClose} className="text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => onThemeChange(theme.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${currentTheme === theme.id ? 'border-[rgb(var(--color-accent-secondary-rgb))]' : 'border-transparent hover:border-[rgba(var(--color-accent-secondary-rgb),0.5)]'}`}
                        >
                            <div className="flex justify-center space-x-2 mb-3">
                                {theme.colors.map(color => (
                                    <div key={color} style={{ backgroundColor: color }} className="w-6 h-6 rounded-full"></div>
                                ))}
                            </div>
                            <span className="font-bold text-center block text-[rgb(var(--color-text-secondary-rgb))]">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;