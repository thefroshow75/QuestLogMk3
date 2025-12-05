import { AchievementDefinition, QuestStatus } from '../types';
import { StarIcon } from '../components/icons/StarIcon';
import { ScrollIcon } from '../components/icons/ScrollIcon';
import { FlameIcon } from '../components/icons/FlameIcon';

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first_quest',
    name: 'First Step',
    description: 'Complete your very first quest.',
    icon: StarIcon,
    checkCondition: (user, quests) => quests.some(q => q.status === QuestStatus.COMPLETED),
  },
  {
    id: 'level_five',
    name: 'Adept Adventurer',
    description: 'Reach Level 5.',
    icon: StarIcon,
    checkCondition: (user) => user.level >= 5,
  },
  {
    id: 'ten_quests',
    name: 'Seasoned Veteran',
    description: 'Complete 10 quests.',
    icon: ScrollIcon,
    checkCondition: (user, quests) => quests.filter(q => q.status === QuestStatus.COMPLETED).length >= 10,
  },
  {
    id: 'streak_seven',
    name: 'On Fire!',
    description: 'Maintain a 7-day completion streak.',
    icon: FlameIcon,
    checkCondition: (user, quests, streak) => streak >= 7,
  },
];
