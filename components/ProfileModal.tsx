import React, { useState } from 'react';
import { User } from '../types';
import { avatars, avatarIds } from './avatars';
import { LockIcon } from './icons/LockIcon';

interface ProfileModalProps {
    user: User;
    onUpdateProfile: (data: Partial<Pick<User, 'username' | 'avatarId'>>) => void;
    onClose: () => void;
    unlockedItemIds: string[];
}

// Map avatar IDs to their shop item IDs (if they require purchase)
const avatarShopMap: Record<string, string> = {
    'wizard': 'item_avatar_wizard',
    'rogue': 'item_avatar_rogue',
    // 'knight' is default/free
};

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdateProfile, onClose, unlockedItemIds }) => {
    const [username, setUsername] = useState(user.username);
    const [selectedAvatarId, setSelectedAvatarId] = useState(user.avatarId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onUpdateProfile({ username: username.trim(), avatarId: selectedAvatarId });
            onClose();
        }
    };

    const currentAvatarUrl = avatars[selectedAvatarId] || avatars.knight;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[rgb(var(--color-background-primary-rgb))] p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.5)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.3)] w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Your Profile</h2>
                    <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]">&times;</button>
                </div>

                <div className="text-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-[rgba(var(--color-interactive-primary-rgb),0.4)] mx-auto flex items-center justify-center border-2 border-[rgb(var(--color-border-primary-rgb))] p-2">
                        <img src={currentAvatarUrl} alt="Selected Avatar" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-muted-rgb))] mt-2">Level {user.level}</p>
                </div>

                 <div className="grid grid-cols-3 gap-4 my-6">
                    {avatarIds.map(id => {
                        const requiredItemId = avatarShopMap[id];
                        const isUnlocked = !requiredItemId || unlockedItemIds.includes(requiredItemId);

                        return (
                            <button 
                                key={id} 
                                onClick={() => isUnlocked && setSelectedAvatarId(id)} 
                                disabled={!isUnlocked}
                                className={`
                                    relative p-2 rounded-full border-2 transition-all duration-200 
                                    ${selectedAvatarId === id 
                                        ? 'border-[rgb(var(--color-accent-secondary-rgb))] bg-[rgba(var(--color-accent-secondary-rgb),0.2)]' 
                                        : 'border-transparent hover:border-[rgba(var(--color-accent-secondary-rgb),0.5)]'}
                                    ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="bg-[rgba(var(--color-background-secondary-rgb),0.5)] rounded-full p-1 relative">
                                   <img src={avatars[id]} alt={`${id} avatar`} className={`w-full h-full object-contain ${!isUnlocked ? 'grayscale' : ''}`} style={{ imageRendering: 'pixelated' }} />
                                   {!isUnlocked && (
                                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                           <LockIcon className="w-5 h-5 text-white" />
                                       </div>
                                   )}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-bold text-[rgb(var(--color-text-secondary-rgb))] mb-1">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-lg py-2 px-3 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))]"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-text-muted-rgb))] text-[rgb(var(--color-text-primary-rgb))] rounded-lg hover:opacity-80 transition-opacity">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] font-bold rounded-lg hover:opacity-90 transition-opacity">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;