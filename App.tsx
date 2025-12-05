import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quest, QuestStatus, User, ChatMessage, ScheduleSuggestion, Theme, QuestType, RepeatFrequency, Achievement, AchievementDefinition, Project, ProjectStep, ShopItem, WorkspaceItem } from './types';
import { generateQuestFromChat, generateDailyQuests } from './services/geminiService';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuestBoard from './components/QuestBoard';
import ChatBot from './components/ChatBot';
import Calendar from './components/Calendar';
import Workspace from './components/Workspace';
import QuestPlannerModal from './components/QuestPlannerModal';
import { MobileNav } from './components/MobileNav';
import SettingsModal from './components/SettingsModal';
import AchievementsModal from './components/AchievementsModal';
import Notification from './components/Notification';
import { achievementDefinitions } from './data/achievements';
import SkillsModal from './components/SkillsModal';
import { skillDefinitions } from './data/skills';
import ProfileModal from './components/ProfileModal';
import ProjectsModal from './components/ProjectsModal';
import ShopModal from './components/ShopModal';
import { shopItems } from './data/shopItems';

type View = 'quests' | 'calendar' | 'chat' | 'workspace';

const App: React.FC = () => {
    const [quests, setQuests] = useState<Quest[]>(() => {
        const savedQuests = localStorage.getItem('quests');
        return savedQuests ? JSON.parse(savedQuests) : [];
    });
    
    // Projects State
    const [projects, setProjects] = useState<Project[]>(() => {
        const savedProjects = localStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : [];
    });

    // Workspace State
    const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>(() => {
        const savedItems = localStorage.getItem('workspaceItems');
        // Initial mock data if empty
        if (!savedItems) {
            return [
                { id: '1', name: 'QuestLog_Design.png', type: 'IMAGE', size: '1.2 MB', date: '2023-10-27', tags: ['design'] },
                { id: '2', name: 'Meeting_Notes.txt', type: 'DOCUMENT', size: '12 KB', date: '2023-10-28', tags: ['work'] },
            ] as WorkspaceItem[];
        }
        return JSON.parse(savedItems);
    });

    const [user, setUser] = useState<User>(() => {
        const savedUser = localStorage.getItem('user');
        const defaultUser = {
            username: 'Adventurer',
            avatarId: 'knight',
            level: 1, 
            xp: 0, 
            xpToNextLevel: 100, 
            skillPoints: 0, 
            unlockedSkills: {},
            weeklySkips: { count: 5, lastReset: new Date().toISOString().split('T')[0] },
            gold: 0,
            unlockedItemIds: ['forge_default', 'knight', 'dark-fantasy'], // Default items
            activePersonalityId: 'forge_default',
        };

        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            // Merge defaults for new fields
            return {
                ...defaultUser,
                ...parsed,
                // Ensure array fields exist if they were missing in older saves
                unlockedItemIds: parsed.unlockedItemIds || defaultUser.unlockedItemIds,
                activePersonalityId: parsed.activePersonalityId || defaultUser.activePersonalityId,
            };
        }
        return defaultUser;
    });
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ sender: 'bot', text: "Welcome, brave adventurer! I am Forge, your AI Coach. Tell me your goals, and together we shall turn them into legendary quests." }]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [pendingQuest, setPendingQuest] = useState<Omit<Quest, 'id' | 'status'> | null>(null);
    const [isPlannerVisible, setIsPlannerVisible] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [activeView, setActiveView] = useState<View>('quests');
    
    const [theme, setTheme] = useState<Theme>('dark-fantasy');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Gamification State
    const [streak, setStreak] = useState<number>(() => {
      const savedStreak = localStorage.getItem('streak');
      return savedStreak ? JSON.parse(savedStreak) : 0;
    });
    const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(() => {
      return localStorage.getItem('lastCompletionDate');
    });
    const [achievements, setAchievements] = useState<Achievement[]>(() => {
      const savedAchievements = localStorage.getItem('achievements');
      return savedAchievements ? JSON.parse(savedAchievements) : [];
    });
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
    const [dailyQuestIds, setDailyQuestIds] = useState<string[]>([]);
    const [isDailyQuestsVisible, setIsDailyQuestsVisible] = useState(true);

    const extraSuggestions = useMemo(() => {
        const skill = skillDefinitions.find(s => s.id === 'extra_suggestion');
        if (!skill || !user.unlockedSkills.extra_suggestion) {
            return 0;
        }
        const effect = skill.getEffect(user.unlockedSkills.extra_suggestion);
        if (effect?.type === 'EXTRA_SUGGESTION') {
            return effect.value;
        }
        return 0;
    }, [user.unlockedSkills]);

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem('quests', JSON.stringify(quests));
    }, [quests]);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('workspaceItems', JSON.stringify(workspaceItems));
    }, [workspaceItems]);

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
      localStorage.setItem('streak', JSON.stringify(streak));
      localStorage.setItem('lastCompletionDate', lastCompletionDate || '');
    }, [streak, lastCompletionDate]);

    useEffect(() => {
      localStorage.setItem('achievements', JSON.stringify(achievements));
    }, [achievements]);

    // Daily Quest & Skips Logic
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastReset = new Date(user.weeklySkips.lastReset);
        const today = new Date(todayStr);
        const diffTime = today.getTime() - lastReset.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
            setUser(prev => ({...prev, weeklySkips: { count: 5, lastReset: todayStr }}));
        }

        const dailyInfoStr = localStorage.getItem('dailyQuestsInfo');
        if (dailyInfoStr) {
            const dailyInfo = JSON.parse(dailyInfoStr);
            if (dailyInfo.date === todayStr) {
                setDailyQuestIds(dailyInfo.ids);
                return;
            }
        }

        const createDailyQuests = async () => {
            const newDailyQuestsRaw = await generateDailyQuests();
            if (newDailyQuestsRaw) {
                const newDailyQuests = newDailyQuestsRaw.map(q => ({
                    ...q,
                    id: crypto.randomUUID(),
                    status: QuestStatus.ACTIVE,
                    isDaily: true,
                    dueDate: todayStr,
                }));
                const newIds = newDailyQuests.map(q => q.id);
                setQuests(prev => [...prev, ...newDailyQuests]);
                setDailyQuestIds(newIds);
                localStorage.setItem('dailyQuestsInfo', JSON.stringify({ date: todayStr, ids: newIds }));
            }
        };
        createDailyQuests();
    }, []);

    // --- Utility Functions ---
    const checkAndGrantAchievements = useCallback(() => {
      const newlyUnlocked: AchievementDefinition[] = [];
      for (const def of achievementDefinitions) {
        if (!achievements.some(a => a.id === def.id)) { // If not already unlocked
          if (def.checkCondition(user, quests, streak)) {
            newlyUnlocked.push(def);
          }
        }
      }

      if (newlyUnlocked.length > 0) {
        setAchievements(prev => [
          ...prev,
          ...newlyUnlocked.map(def => ({ id: def.id, date: new Date().toISOString() }))
        ]);
        // Show notification for the first new achievement
        setNotification(`Achievement Unlocked: ${newlyUnlocked[0].name}`);
        setTimeout(() => setNotification(null), 4000);
      }
    }, [achievements, user, quests, streak]);

    useEffect(() => {
      // Check achievements on any relevant state change
      checkAndGrantAchievements();
    }, [user.level, quests.length, streak, checkAndGrantAchievements]);


    // --- Handlers ---
    const handleAddQuest = (newQuestData: Omit<Quest, 'id' | 'status'>) => {
        const newQuest: Quest = {
            ...newQuestData,
            id: crypto.randomUUID(),
            status: QuestStatus.ACTIVE,
        };
        setQuests(prev => [...prev, newQuest]);
    };
    
    // Project Logic
    const handleCreateProject = () => {
        const newProject: Project = {
            id: crypto.randomUUID(),
            title: "Become a Python Master",
            description: "A journey from 'Hello World' to AI Expert.",
            status: 'ACTIVE',
            totalXp: 500,
            steps: [
                {
                    id: crypto.randomUUID(),
                    title: "Step 1: The Basics",
                    order: 1,
                    status: 'UNLOCKED',
                    quests: [
                        { id: crypto.randomUUID(), title: "Install Python", description: "Download and install Python.", xp: 20, status: QuestStatus.ACTIVE, tags: ['learning', 'python'], type: QuestType.ONCE },
                        { id: crypto.randomUUID(), title: "Hello World", description: "Write your first script.", xp: 30, status: QuestStatus.LOCKED, tags: ['learning', 'python'], type: QuestType.ONCE },
                    ]
                },
                {
                    id: crypto.randomUUID(),
                    title: "Step 2: Control Flow",
                    order: 2,
                    status: 'LOCKED',
                    quests: [
                        { id: crypto.randomUUID(), title: "If/Else Statements", description: "Learn logic.", xp: 40, status: QuestStatus.LOCKED, tags: ['learning', 'python'], type: QuestType.ONCE },
                        { id: crypto.randomUUID(), title: "Loops", description: "Learn for and while loops.", xp: 50, status: QuestStatus.LOCKED, tags: ['learning', 'python'], type: QuestType.ONCE },
                    ]
                }
            ]
        };
        
        // Link quests to project
        newProject.steps.forEach(step => {
            step.quests.forEach(q => {
                q.projectId = newProject.id;
                q.stepId = step.id;
            });
        });

        setProjects(prev => [...prev, newProject]);
        
        // Add the first unlocked quest to the main quests list
        const initialQuests = newProject.steps[0].quests.filter(q => q.status === QuestStatus.ACTIVE);
        setQuests(prev => [...prev, ...initialQuests]);
        
        setNotification(`Project Started: ${newProject.title}`);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleLevelUp = (currentXp: number, currentLevel: number, currentXpToNextLevel: number) => {
      let newXp = currentXp;
      let newLevel = currentLevel;
      let newXpToNextLevel = currentXpToNextLevel;
      let newSkillPoints = user.skillPoints;

      while (newXp >= newXpToNextLevel) {
          newXp -= newXpToNextLevel;
          newLevel++;
          newSkillPoints++;
          newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2);
      }

      setUser(prev => ({ ...prev, level: newLevel, xp: newXp, xpToNextLevel: newXpToNextLevel, skillPoints: newSkillPoints }));
    };

    const handleCompleteQuest = (questId: string, completionDate: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;

        // Apply XP Boost Skill
        const xpBoostSkill = skillDefinitions.find(s => s.id === 'xp_boost');
        let bonusXp = 0;
        if (xpBoostSkill && user.unlockedSkills.xp_boost) {
            const effect = xpBoostSkill.getEffect(user.unlockedSkills.xp_boost);
            if(effect?.type === 'XP_BOOST') {
                bonusXp = Math.floor(quest.xp * (effect.value / 100));
            }
        }
        const totalXpGained = quest.xp + bonusXp;
        const goldEarned = Math.floor(totalXpGained / 10);

        const updatedQuests = quests.map(q => {
            if (q.id === questId) {
                if (q.type === QuestType.RECURRING) {
                    return { ...q, completedDates: [...(q.completedDates || []), completionDate] };
                }
                return { ...q, status: QuestStatus.COMPLETED };
            }
            return q;
        });
        setQuests(updatedQuests);

        handleLevelUp(user.xp + totalXpGained, user.level, user.xpToNextLevel);
        setUser(prev => ({ ...prev, gold: prev.gold + goldEarned }));

        if (goldEarned > 0) {
            setNotification(`Completed! +${totalXpGained} XP, +${goldEarned} Gold`);
            setTimeout(() => setNotification(null), 3000);
        }
        
        if (quest.projectId && quest.stepId) {
            handleProjectProgress(quest.projectId, quest.stepId, questId);
        }

        if (quest.isDaily) {
            const todaysDailies = updatedQuests.filter(q => dailyQuestIds.includes(q.id));
            const areAllDailiesDone = todaysDailies.every(q => q.status === QuestStatus.COMPLETED || q.status === QuestStatus.SKIPPED);
            
            if (areAllDailiesDone) {
                const today = new Date().toISOString().split('T')[0];
                if (lastCompletionDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    
                    if (lastCompletionDate === yesterdayStr) {
                        setStreak(prev => prev + 1);
                    } else {
                        setStreak(1);
                    }
                    setLastCompletionDate(today);
                }
            }
        }
    };

    const handleProjectProgress = (projectId: string, stepId: string, completedQuestId: string) => {
        setProjects(prevProjects => {
            const projectIndex = prevProjects.findIndex(p => p.id === projectId);
            if (projectIndex === -1) return prevProjects;

            const newProjects = [...prevProjects];
            const project = { ...newProjects[projectIndex] };
            const stepIndex = project.steps.findIndex(s => s.id === stepId);
            if (stepIndex === -1) return prevProjects;
            
            const step = { ...project.steps[stepIndex] };
            const questIndex = step.quests.findIndex(q => q.id === completedQuestId);
            if (questIndex === -1) return prevProjects;

            step.quests = [...step.quests];
            step.quests[questIndex] = { ...step.quests[questIndex], status: QuestStatus.COMPLETED };

            const newUnlockedQuests: Quest[] = [];
            let projectCompleted = false;

            if (questIndex < step.quests.length - 1) {
                const nextQuest = { ...step.quests[questIndex + 1], status: QuestStatus.ACTIVE };
                step.quests[questIndex + 1] = nextQuest;
                newUnlockedQuests.push(nextQuest);
            } else {
                step.status = 'COMPLETED';
                if (stepIndex < project.steps.length - 1) {
                    const nextStepIndex = stepIndex + 1;
                    const nextStep = { ...project.steps[nextStepIndex], status: 'UNLOCKED' as const };
                    if (nextStep.quests.length > 0) {
                        const firstQuest = { ...nextStep.quests[0], status: QuestStatus.ACTIVE };
                        nextStep.quests = [...nextStep.quests];
                        nextStep.quests[0] = firstQuest;
                        newUnlockedQuests.push(firstQuest);
                    }
                    project.steps[nextStepIndex] = nextStep;
                    setNotification(`Step Complete! Unlocked: ${nextStep.title}`);
                } else {
                    project.status = 'COMPLETED';
                    projectCompleted = true;
                    setNotification(`Project Complete! Reward: ${project.totalXp} XP`);
                }
            }

            project.steps[stepIndex] = step;
            newProjects[projectIndex] = project;
            return newProjects;
        });
        
        // Simplified sync logic for demo
        const project = projects.find(p => p.id === projectId);
        if(!project) return;
        const step = project.steps.find(s => s.id === stepId);
        if(!step) return;
        const qIndex = step.quests.findIndex(q => q.id === completedQuestId);
        
        let newQuestsToAdd: Quest[] = [];
        let projectXpReward = 0;

        if (qIndex < step.quests.length - 1) {
             const nextQ = step.quests[qIndex+1];
             newQuestsToAdd.push({ ...nextQ, status: QuestStatus.ACTIVE });
        } else {
             const sIndex = project.steps.findIndex(s => s.id === stepId);
             if (sIndex < project.steps.length - 1) {
                 const nextStep = project.steps[sIndex + 1];
                 if(nextStep.quests.length > 0) {
                     newQuestsToAdd.push({ ...nextStep.quests[0], status: QuestStatus.ACTIVE });
                 }
             } else {
                 projectXpReward = project.totalXp;
             }
        }
        
        if (newQuestsToAdd.length > 0) {
            setQuests(prev => [...prev, ...newQuestsToAdd]);
        }
        if (projectXpReward > 0) {
            handleLevelUp(user.xp + projectXpReward, user.level, user.xpToNextLevel);
        }
    };
    
    const handleSkipDailyQuest = (questId: string) => {
        if (user.weeklySkips.count <= 0) return;
        
        setUser(prev => ({...prev, weeklySkips: {...prev.weeklySkips, count: prev.weeklySkips.count - 1 }}));
        const updatedQuests = quests.map(q => q.id === questId ? { ...q, status: QuestStatus.SKIPPED } : q);
        setQuests(updatedQuests);

        const todaysDailies = updatedQuests.filter(q => dailyQuestIds.includes(q.id));
        const areAllDailiesDone = todaysDailies.every(q => q.status === QuestStatus.COMPLETED || q.status === QuestStatus.SKIPPED);
        if (areAllDailiesDone) {
            const today = new Date().toISOString().split('T')[0];
            if (lastCompletionDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastCompletionDate === yesterdayStr) {
                    setStreak(prev => prev + 1);
                } else {
                    setStreak(1);
                }
                setLastCompletionDate(today);
            }
        }
    };

    const handleUpdateProfile = (newProfileData: Partial<Pick<User, 'username' | 'avatarId'>>) => {
        setUser(prev => ({ ...prev, ...newProfileData }));
    };
    
    const handleSpendSkillPoint = (skillId: string) => {
        const skill = skillDefinitions.find(s => s.id === skillId);
        if (!skill) return;

        const currentLevel = user.unlockedSkills[skillId] || 0;
        if (currentLevel >= skill.maxLevel) return;

        const cost = skill.cost(currentLevel + 1);
        if (user.skillPoints < cost) return;

        if (skill.prerequisites) {
            for (const prereqId in skill.prerequisites) {
                const requiredLevel = skill.prerequisites[prereqId];
                const currentPrereqLevel = user.unlockedSkills[prereqId] || 0;
                if (currentPrereqLevel < requiredLevel) {
                    return; 
                }
            }
        }
        
        setUser(prev => ({
            ...prev,
            skillPoints: prev.skillPoints - cost,
            unlockedSkills: {
                ...prev.unlockedSkills,
                [skillId]: currentLevel + 1
            }
        }));
    };

    const handleSendMessage = async (message: string) => {
        setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
        setIsChatLoading(true);
        const { textResponse, quest } = await generateQuestFromChat(message, user.activePersonalityId);
        setIsChatLoading(false);
        setChatHistory(prev => [...prev, { sender: 'bot', text: textResponse }]);
        if (quest) {
            setPendingQuest(quest);
        }
    };

    const handleAcceptQuest = () => {
        if (pendingQuest) {
            handleAddQuest(pendingQuest);
            setPendingQuest(null);
            // Optional: switch to Quests view if on desktop to see it
            if (window.innerWidth >= 768) setActiveView('quests');
        }
    };
    
    const handleDeclineQuest = () => {
        setPendingQuest(null);
    };

    const handleApplySchedule = (schedule: ScheduleSuggestion[]) => {
      setQuests(prevQuests => {
          const updatedQuests = [...prevQuests];
          schedule.forEach(item => {
              const questIndex = updatedQuests.findIndex(q => q.id === item.id);
              if (questIndex !== -1) {
                  updatedQuests[questIndex] = {
                      ...updatedQuests[questIndex],
                      dueDate: item.suggestedDate,
                  };
              }
          });
          return updatedQuests;
      });
      setIsPlannerVisible(false);
    };

    const handlePurchaseItem = (item: ShopItem) => {
        if (user.gold >= item.cost && !user.unlockedItemIds.includes(item.id)) {
            setUser(prev => ({
                ...prev,
                gold: prev.gold - item.cost,
                unlockedItemIds: [...prev.unlockedItemIds, item.id]
            }));
            setNotification(`Purchased: ${item.name}`);
            setTimeout(() => setNotification(null), 3000);
        }
    };
    
    const handlePersonalityChange = (personalityId: string) => {
        setUser(prev => ({ ...prev, activePersonalityId: personalityId }));
        setChatHistory(prev => [...prev, { sender: 'bot', text: `[Personality Switched]` }]);
    };

    const handleAddWorkspaceItem = (item: WorkspaceItem) => {
        setWorkspaceItems(prev => [...prev, item]);
        setNotification(`Uploaded: ${item.name}`);
        setTimeout(() => setNotification(null), 3000);
    }

    const hasUnscheduledQuests = quests.some(q => q.status === QuestStatus.ACTIVE && q.type === QuestType.ONCE && !q.dueDate && !q.isDaily);
    const dailyQuestsToDisplay = quests.filter(q => dailyQuestIds.includes(q.id));

    return (
        <div className="bg-cover bg-center bg-fixed h-screen w-full overflow-hidden" style={{ backgroundImage: "var(--background-image)" }}>
            <div className="bg-[rgba(var(--color-background-primary-rgb),0.85)] h-full text-[rgb(var(--color-text-primary-rgb))] flex flex-col md:flex-row">
                
                {/* Desktop Sidebar */}
                <div className="hidden md:block h-full z-50">
                    <Sidebar 
                        currentView={activeView} 
                        setView={setActiveView} 
                        onOpenShop={() => setIsShopOpen(true)}
                        onOpenProjects={() => setIsProjectsOpen(true)}
                    />
                </div>

                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <Navbar 
                        user={user} 
                        streak={streak} 
                        onOpenProfile={() => setIsProfileOpen(true)} 
                        onOpenSettings={() => setIsSettingsOpen(true)} 
                        onOpenAchievements={() => setIsAchievementsOpen(true)} 
                        onOpenSkills={() => setIsSkillsOpen(true)} 
                        onToggleDailyQuests={() => setIsDailyQuestsVisible(v => !v)} 
                    />

                    <main className="flex-1 overflow-hidden relative p-4 md:p-6 lg:p-8">
                        {/* Desktop View Switcher Layout */}
                        <div className="h-full w-full max-w-7xl mx-auto">
                            {activeView === 'chat' && (
                                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-8 h-full">
                                        <ChatBot 
                                            history={chatHistory} 
                                            isLoading={isChatLoading}
                                            pendingQuest={pendingQuest}
                                            onSendMessage={handleSendMessage}
                                            onAcceptQuest={handleAcceptQuest}
                                            onDeclineQuest={handleDeclineQuest}
                                            onOpenProjects={() => setIsProjectsOpen(true)}
                                            onOpenShop={() => setIsShopOpen(true)}
                                            activePersonalityId={user.activePersonalityId}
                                            unlockedItemIds={user.unlockedItemIds}
                                            onPersonalityChange={handlePersonalityChange}
                                        />
                                    </div>
                                    <div className="hidden lg:block lg:col-span-4 h-full space-y-6">
                                        {/* Right Rail for Coach View */}
                                        <div className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.3)] p-6">
                                            <h3 className="font-display text-xl text-[rgb(var(--color-accent-primary-rgb))] mb-4">Quick Actions</h3>
                                            <button onClick={() => setIsPlannerVisible(true)} className="w-full py-3 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg text-left px-4 font-bold transition-colors mb-2">
                                                Plan My Day
                                            </button>
                                            <button onClick={() => setIsShopOpen(true)} className="w-full py-3 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg text-left px-4 font-bold transition-colors">
                                                Visit Shop
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeView === 'calendar' && (
                                <div className="h-full">
                                    <Calendar 
                                        quests={quests} 
                                        selectedDate={selectedDate}
                                        onDateSelect={setSelectedDate}
                                        onCompleteQuest={handleCompleteQuest}
                                        onAddQuest={handleAddQuest}
                                    />
                                </div>
                            )}

                            {activeView === 'quests' && (
                                <div className="h-full">
                                    <QuestBoard 
                                        quests={quests} 
                                        dailyQuests={dailyQuestsToDisplay}
                                        isDailyQuestsVisible={isDailyQuestsVisible}
                                        onSkipDailyQuest={handleSkipDailyQuest}
                                        weeklySkips={user.weeklySkips}
                                        onCompleteQuest={handleCompleteQuest}
                                        onAddQuest={handleAddQuest}
                                        onOpenPlanner={() => setIsPlannerVisible(true)}
                                        hasUnscheduledQuests={hasUnscheduledQuests}
                                        chatHistory={chatHistory}
                                        selectedDate={selectedDate}
                                        extraSuggestions={extraSuggestions}
                                        onOpenShop={() => setIsShopOpen(true)}
                                    />
                                </div>
                            )}

                            {activeView === 'workspace' && (
                                <div className="h-full">
                                    <Workspace 
                                        items={workspaceItems} 
                                        onAddItem={handleAddWorkspaceItem}
                                    />
                                </div>
                            )}
                        </div>
                    </main>

                    <MobileNav currentView={activeView} setView={setActiveView} />
                </div>
                
                {/* Modals */}
                {isSettingsOpen && <SettingsModal currentTheme={theme} onThemeChange={setTheme} onClose={() => setIsSettingsOpen(false)} unlockedItemIds={user.unlockedItemIds} />}
                {isAchievementsOpen && <AchievementsModal achievements={achievements} definitions={achievementDefinitions} onClose={() => setIsAchievementsOpen(false)} />}
                {isSkillsOpen && <SkillsModal user={user} onSpendSkillPoint={handleSpendSkillPoint} onClose={() => setIsSkillsOpen(false)} />}
                {isProfileOpen && <ProfileModal user={user} onUpdateProfile={handleUpdateProfile} onClose={() => setIsProfileOpen(false)} unlockedItemIds={user.unlockedItemIds} />}
                {isProjectsOpen && <ProjectsModal projects={projects} onClose={() => setIsProjectsOpen(false)} onCreateProject={handleCreateProject} />}
                {isShopOpen && <ShopModal user={user} items={shopItems} onClose={() => setIsShopOpen(false)} onPurchase={handlePurchaseItem} />}
                {isPlannerVisible && <QuestPlannerModal quests={quests} onClose={() => setIsPlannerVisible(false)} onApplySchedule={handleApplySchedule} />}
                
                {notification && <Notification message={notification} onDismiss={() => setNotification(null)} />}

            </div>
        </div>
    );
};

export default App;