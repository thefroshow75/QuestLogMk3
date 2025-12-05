import React, { useState } from 'react';
import { User, ShopItem, ShopCategory } from '../types';
import { ShopIcon } from './icons/ShopIcon';
import { LockIcon } from './icons/LockIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ShopModalProps {
    user: User;
    items: ShopItem[];
    onClose: () => void;
    onPurchase: (item: ShopItem) => void;
}

// NPC Shopkeeper Mock Data
const shopkeeper = {
    name: "Merchant Thaddeus",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Thaddeus",
    quips: [
        "Finest wares in the realm, stranger.",
        "Got some gold burning a hole in your pocket?",
        "No refunds on magical items, policy is policy.",
        "Ah, a discerning customer!",
        "Looking to gain an edge, eh?"
    ]
};

const ShopModal: React.FC<ShopModalProps> = ({ user, items, onClose, onPurchase }) => {
    const [activeCategory, setActiveCategory] = useState<ShopCategory>('BOOSTS');
    const [currentQuip] = useState(() => shopkeeper.quips[Math.floor(Math.random() * shopkeeper.quips.length)]);

    const filteredItems = items.filter(i => i.category === activeCategory);

    const categories: { id: ShopCategory; label: string }[] = [
        { id: 'BOOSTS', label: 'Boosts' },
        { id: 'COSMETICS', label: 'Cosmetics' },
        { id: 'UTILITIES', label: 'Utilities' },
        { id: 'MYSTERY', label: 'Mystery' },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
             <div className="bg-[rgb(var(--color-background-primary-rgb))] rounded-xl border-2 border-[rgba(var(--color-border-primary-rgb),0.6)] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
                
                {/* Header / Shopkeeper Section */}
                <div className="bg-[rgba(var(--color-background-secondary-rgb),0.8)] border-b border-[rgba(var(--color-border-primary-rgb),0.3)] p-6 flex flex-col md:flex-row items-center gap-6 flex-shrink-0">
                    {/* Shopkeeper Avatar */}
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full border-2 border-[rgb(var(--color-accent-tertiary-rgb))] bg-[rgba(var(--color-background-primary-rgb),0.5)] overflow-hidden shadow-[0_0_15px_rgba(var(--color-accent-tertiary-rgb),0.4)]">
                            <img src={shopkeeper.avatar} alt={shopkeeper.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[rgb(var(--color-background-primary-rgb))]" title="Open"></div>
                    </div>

                    {/* Dialogue Bubble */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">{shopkeeper.name}</h2>
                        <div className="relative mt-2 inline-block bg-[rgba(var(--color-interactive-primary-rgb),0.2)] text-[rgb(var(--color-text-primary-rgb))] px-4 py-2 rounded-xl rounded-tl-none border border-[rgba(var(--color-interactive-primary-rgb),0.3)]">
                            <p className="italic text-sm">"{currentQuip}"</p>
                        </div>
                    </div>

                    {/* Balance & Close */}
                    <div className="flex flex-col items-end gap-3">
                         <button onClick={onClose} className="text-3xl font-light text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))] leading-none">&times;</button>
                        <div className="bg-[rgba(var(--color-background-secondary-rgb),0.8)] px-5 py-2 rounded-full border border-[rgb(var(--color-accent-primary-rgb))] shadow-sm flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse"></div>
                            <span className="text-[rgb(var(--color-accent-primary-rgb))] font-bold text-xl">{user.gold}</span>
                            <span className="text-[rgb(var(--color-text-muted-rgb))] text-xs font-bold uppercase tracking-wider">Gold</span>
                        </div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex border-b border-[rgba(var(--color-border-primary-rgb),0.3)] bg-[rgba(var(--color-background-primary-rgb),0.3)]">
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-all relative overflow-hidden group
                                ${activeCategory === cat.id 
                                    ? 'text-[rgb(var(--color-accent-secondary-rgb))] bg-[rgba(var(--color-accent-secondary-rgb),0.1)]' 
                                    : 'text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))] hover:bg-[rgba(var(--color-background-secondary-rgb),0.4)]'}
                            `}
                        >
                            {cat.label}
                            {activeCategory === cat.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgb(var(--color-accent-secondary-rgb))] shadow-[0_-2px_6px_rgba(var(--color-accent-secondary-rgb),0.6)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-[rgba(var(--color-background-primary-rgb),0.6)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map(item => {
                            const isOwned = user.unlockedItemIds.includes(item.id) && item.category !== 'BOOSTS' && item.category !== 'MYSTERY'; // Boosts/Mystery are consumable/repeatable usually, but simplified here
                            const canAfford = user.gold >= item.cost;

                            return (
                                <div key={item.id} className={`group relative p-5 rounded-xl border-2 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isOwned ? 'bg-[rgba(var(--color-interactive-primary-rgb),0.05)] border-[rgba(var(--color-interactive-primary-rgb),0.3)]' : 'bg-[rgba(var(--color-background-secondary-rgb),0.6)] border-[rgba(var(--color-border-primary-rgb),0.3)] hover:border-[rgb(var(--color-accent-secondary-rgb))]'}`}>
                                    {/* Icon / Image Placeholder */}
                                    <div className="w-full h-32 mb-4 bg-[rgba(var(--color-background-primary-rgb),0.5)] rounded-lg flex items-center justify-center overflow-hidden relative">
                                        <ShopIcon className={`w-12 h-12 ${isOwned ? 'text-[rgb(var(--color-interactive-primary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))] group-hover:text-[rgb(var(--color-accent-secondary-rgb))]'} transition-colors`} />
                                        {/* Mystery Box or special effect overlay could go here */}
                                    </div>

                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-[rgb(var(--color-text-primary-rgb))] group-hover:text-[rgb(var(--color-accent-primary-rgb))] transition-colors">{item.name}</h3>
                                        {isOwned && <CheckIcon className="w-6 h-6 text-green-500" />}
                                    </div>
                                    <p className="text-sm text-[rgb(var(--color-text-secondary-rgb))] mb-6 flex-1 leading-relaxed">{item.description}</p>
                                    
                                    <div className="mt-auto">
                                        {isOwned ? (
                                            <button disabled className="w-full py-3 rounded-lg bg-[rgba(var(--color-interactive-primary-rgb),0.1)] text-[rgb(var(--color-interactive-primary-rgb))] font-bold cursor-default border border-[rgba(var(--color-interactive-primary-rgb),0.2)]">
                                                In Inventory
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => onPurchase(item)}
                                                disabled={!canAfford}
                                                className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all shadow-md active:scale-95 ${canAfford ? 'bg-[rgb(var(--color-accent-tertiary-rgb))] text-[rgb(var(--color-background-primary-rgb))] hover:brightness-110' : 'bg-[rgba(var(--color-text-muted-rgb),0.2)] text-[rgb(var(--color-text-muted-rgb))] cursor-not-allowed'}`}
                                            >
                                                {!canAfford && <LockIcon className="w-4 h-4" />}
                                                {canAfford ? 'Purchase' : 'Locked'} 
                                                <span className="ml-1 opacity-80 text-xs font-normal">({item.cost} G)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopModal;