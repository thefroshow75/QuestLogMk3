import React, { useState, useEffect, useCallback } from 'react';
import { Quest, QuestStatus, ChatMessage } from './types';
import Navbar from './components/Navbar';
import QuestBoard from './components/QuestBoard';
import ChatBot from './components/ChatBot';
import Calendar from './components/Calendar';
import QuestPlannerModal from './components/QuestPlannerModal';
import { generateQuestFromChat } from './services/geminiService';
import { MobileNav } from './components/MobileNav';
import SettingsModal from './components/SettingsModal';


const App: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark-fantasy');
  
  // Chat state is now managed in the main App component
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pendingQuest, setPendingQuest] = useState<Omit<Quest, 'id' | 'status'> | null>(null);

  // State for calendar/quest board interaction
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State for mobile responsiveness
  const [mobileView, setMobileView] = useState<'quests' | 'calendar' | 'chat'>('quests');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const XP_PER_LEVEL = 100;

  // Effect to load all data from localStorage on initial render
  useEffect(() => {
    try {
      const savedQuests = localStorage.getItem('quests');
      const savedXp = localStorage.getItem('xp');
      const savedLevel = localStorage.getItem('level');
      const savedChatHistory = localStorage.getItem('chatHistory');
      const savedTheme = localStorage.getItem('theme');

      if (savedQuests) setQuests(JSON.parse(savedQuests));
      if (savedXp) setXp(Number(savedXp));
      if (savedLevel) setLevel(Number(savedLevel));
      if (savedTheme) setTheme(savedTheme);
      
      if (savedChatHistory && JSON.parse(savedChatHistory).length > 0) {
        setChatHistory(JSON.parse(savedChatHistory));
      } else {
        // Provide the initial greeting if no history exists
        setChatHistory([{ sender: 'bot', text: "Hello! I'm your personal AI coach. What goal is on your mind today? Let's break it down and make a plan!" }]);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Effect to save all data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('quests', JSON.stringify(quests));
      localStorage.setItem('xp', String(xp));
      localStorage.setItem('level', String(level));
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [quests, xp, level, chatHistory, theme]);
  
  // Effect to handle window resizing for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to apply the current theme to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLevelUp = useCallback((newXp: number) => {
    let currentXp = newXp;
    let currentLevel = level;
    let requiredXp = currentLevel * XP_PER_LEVEL;

    while (currentXp >= requiredXp) {
      currentXp -= requiredXp;
      currentLevel++;
      requiredXp = currentLevel * XP_PER_LEVEL;
    }
    setXp(currentXp);
    setLevel(currentLevel);
  }, [level]);

  const addQuest = useCallback((newQuest: Omit<Quest, 'id' | 'status'>) => {
    setQuests(prevQuests => [
      ...prevQuests,
      {
        ...newQuest,
        id: Date.now().toString(),
        status: QuestStatus.ACTIVE,
      }
    ]);
  }, []);
  
  const updateQuests = useCallback((updates: { id: string; changes: Partial<Quest> }[]) => {
    const updateMap = new Map(updates.map(u => [u.id, u.changes]));
    setQuests(prevQuests =>
      prevQuests.map(quest =>
        updateMap.has(quest.id)
          ? { ...quest, ...updateMap.get(quest.id) }
          : quest
      )
    );
  }, []);

  const completeQuest = useCallback((questId: string) => {
    let questXp = 0;
    setQuests(prevQuests =>
      prevQuests.map(quest => {
        if (quest.id === questId) {
          questXp = quest.xp;
          return { ...quest, status: QuestStatus.COMPLETED };
        }
        return quest;
      })
    );
    if (questXp > 0) {
      handleLevelUp(xp + questXp);
    }
  }, [xp, handleLevelUp]);
  
  // Chat handling logic, moved from ChatBot component
  const handleSendMessage = useCallback(async (userInput: string) => {
    if (userInput.trim() === '' || isChatLoading || pendingQuest) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
        const { textResponse, quest } = await generateQuestFromChat(userInput);

        const newBotMessage: ChatMessage = { sender: 'bot', text: textResponse };
        setChatHistory(prev => [...prev, newBotMessage]);

        if (quest) {
            setPendingQuest(quest);
        }

    } catch (error) {
        const errorMessage: ChatMessage = { sender: 'bot', text: "Apologies, a cosmic interference prevents me from responding. Please try again." };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  }, [isChatLoading, pendingQuest]);

  const handleAcceptQuest = useCallback(() => {
    if (!pendingQuest) return;
    addQuest(pendingQuest);
    const acceptanceMessage: ChatMessage = {
      sender: 'bot',
      text: `Awesome! The quest "${pendingQuest.title}" has been added to your log.`
    };
    setChatHistory(prev => [...prev, acceptanceMessage]);
    setPendingQuest(null);
  }, [pendingQuest, addQuest]);

  const handleDeclineQuest = useCallback(() => {
    if (!pendingQuest) return;
    const declineMessage: ChatMessage = {
      sender: 'bot',
      text: 'No problem. We can always come back to it later or try a different approach!'
    };
    setChatHistory(prev => [...prev, declineMessage]);
    setPendingQuest(null);
  }, [pendingQuest]);

  const unscheduledQuests = quests.filter(q => q.status === QuestStatus.ACTIVE && !q.dueDate);

  const chatBotProps = {
    history: chatHistory,
    isLoading: isChatLoading,
    pendingQuest: pendingQuest,
    onSendMessage: handleSendMessage,
    onAcceptQuest: handleAcceptQuest,
    onDeclineQuest: handleDeclineQuest,
  };

  const questBoardProps = {
    quests: quests,
    onCompleteQuest: completeQuest,
    onAddQuest: addQuest,
    onOpenPlanner: () => setIsPlannerOpen(true),
    hasUnscheduledQuests: unscheduledQuests.length > 0,
    chatHistory: chatHistory,
    selectedDate: selectedDate,
  };
  
  const calendarProps = {
    quests: quests,
    selectedDate: selectedDate,
    onDateSelect: setSelectedDate,
    onCompleteQuest: completeQuest,
  }

  return (
    <div className="bg-[var(--background-image)] min-h-screen flex flex-col h-screen">
      <Navbar level={level} xp={xp} xpForNextLevel={level * XP_PER_LEVEL} onOpenSettings={() => setIsSettingsOpen(true)} />
      <div className="flex-1 container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 overflow-hidden md:pb-0 pb-20">
        {isMobile ? (
           <div className="h-full w-full">
            {mobileView === 'chat' && <ChatBot {...chatBotProps} />}
            {mobileView === 'calendar' && <Calendar {...calendarProps} />}
            {mobileView === 'quests' && <QuestBoard {...questBoardProps} />}
          </div>
        ) : (
          <>
            <aside className="w-1/3 max-w-md flex-shrink-0 h-full">
               <ChatBot {...chatBotProps} />
            </aside>
            <main className="flex-1 h-full">
              <Calendar {...calendarProps} />
            </main>
            <aside className="w-1/3 max-w-md flex-shrink-0 h-full">
              <QuestBoard {...questBoardProps} />
            </aside>
          </>
        )}
      </div>

      {isMobile && <MobileNav currentView={mobileView} setView={setMobileView} />}
      
      {isPlannerOpen && (
        <QuestPlannerModal
          quests={quests}
          onClose={() => setIsPlannerOpen(false)}
          onApplySchedule={(schedule) => {
            const updates = schedule.map(s => ({
              id: s.id,
              changes: { dueDate: s.suggestedDate }
            }));
            updateQuests(updates);
            setIsPlannerOpen(false);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          currentTheme={theme}
          onThemeChange={(newTheme) => {
            setTheme(newTheme);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;