import { ShopItem } from '../types';

export const shopItems: ShopItem[] = [
    // --- BOOSTS ---
    {
        id: 'item_boost_xp_small',
        type: 'BOOST',
        category: 'BOOSTS',
        name: 'Minor XP Potion',
        description: '+10% XP for the next 24 hours.',
        cost: 50,
        data: 'boost_xp_10'
    },
    {
        id: 'item_boost_streak_freeze',
        type: 'BOOST',
        category: 'BOOSTS',
        name: 'Chronos Freeze',
        description: 'Protect your streak for one missed day.',
        cost: 200,
        data: 'boost_streak_freeze'
    },

    // --- COSMETICS (Avatars & Themes) ---
    {
        id: 'item_avatar_wizard',
        type: 'AVATAR',
        category: 'COSMETICS',
        name: 'The Wizard',
        description: 'A master of arcane arts.',
        cost: 100,
        data: 'wizard'
    },
    {
        id: 'item_avatar_rogue',
        type: 'AVATAR',
        category: 'COSMETICS',
        name: 'The Rogue',
        description: 'Stealthy and quick.',
        cost: 150,
        data: 'rogue'
    },
    {
        id: 'item_theme_cyberpunk',
        type: 'THEME',
        category: 'COSMETICS',
        name: 'Neon City',
        description: 'High tech, low life aesthetic.',
        cost: 300,
        data: 'cyberpunk'
    },
    {
        id: 'item_theme_space',
        type: 'THEME',
        category: 'COSMETICS',
        name: 'Stardust',
        description: 'For those who look to the stars.',
        cost: 300,
        data: 'space'
    },
    {
        id: 'item_theme_scifi',
        type: 'THEME',
        category: 'COSMETICS',
        name: 'The Grid',
        description: 'Clean, futuristic interface.',
        cost: 300,
        data: 'scifi'
    },

    // --- UTILITIES (Personalities & Tools) ---
    {
        id: 'item_persona_sergeant',
        type: 'PERSONALITY',
        category: 'UTILITIES',
        name: 'Sergeant Iron',
        description: 'A tough drill instructor to keep you disciplined.',
        cost: 500,
        data: 'sergeant_iron'
    },
    {
        id: 'item_persona_sage',
        type: 'PERSONALITY',
        category: 'UTILITIES',
        name: 'Sage Willow',
        description: 'A mystical guide for a balanced journey.',
        cost: 500,
        data: 'sage_willow'
    },
    {
        id: 'item_persona_glitch',
        type: 'PERSONALITY',
        category: 'UTILITIES',
        name: 'Glitch',
        description: 'A cyberpunk hacker AI.',
        cost: 750,
        data: 'glitch_cyber'
    },

    // --- MYSTERY ---
    {
        id: 'item_mystery_box_common',
        type: 'BOOST', // Placeholder type
        category: 'MYSTERY',
        name: 'Old Crate',
        description: 'Contains a random small reward.',
        cost: 75,
        data: 'mystery_common'
    },
    {
        id: 'item_mystery_box_rare',
        type: 'BOOST',
        category: 'MYSTERY',
        name: 'Gilded Chest',
        description: 'Contains a rare cosmetic or large gold sum.',
        cost: 400,
        data: 'mystery_rare'
    }
];