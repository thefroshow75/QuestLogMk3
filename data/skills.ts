import { SkillDefinition } from '../types';
import { StarIcon } from '../components/icons/StarIcon';
import { MagicWandIcon } from '../components/icons/MagicWandIcon';

export const skillDefinitions: SkillDefinition[] = [
    {
        id: 'xp_boost',
        name: "Apprentice's Insight",
        description: 'Permanently increases all XP gains from quests.',
        icon: StarIcon,
        maxLevel: 5,
        cost: (level) => level, // 1 for level 1, 2 for 2, etc.
        getEffect: (level) => {
            if (level > 0) {
                return { type: 'XP_BOOST', value: level * 5 }; // 5% per level
            }
            return undefined;
        },
    },
    {
        id: 'extra_suggestion',
        name: "Diviner's Eye",
        description: 'The AI Coach will provide one additional quest suggestion.',
        icon: MagicWandIcon,
        maxLevel: 1,
        cost: () => 2, // cost is 2 skill points
        getEffect: (level) => {
            if (level > 0) {
                return { type: 'EXTRA_SUGGESTION', value: 1 };
            }
            return undefined;
        },
        prerequisites: {
            'xp_boost': 1, // Requires at least level 1 of XP Boost
        },
    }
];
