import React from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { QuestBoardIcon } from './icons/QuestBoardIcon';

type MobileView = 'quests' | 'calendar' | 'chat';

interface MobileNavProps {
    currentView: MobileView;
    setView: (view: MobileView) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-1/3 pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))] hover:text-[rgb(var(--color-text-primary-rgb))]'}`}
        aria-current={isActive ? 'page' : undefined}
    >
        {children}
        <span className={`text-xs font-bold mt-1 ${isActive ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))]'}`}>{label}</span>
    </button>
);

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView }) => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[rgba(var(--color-background-primary-rgb),0.8)] backdrop-blur-sm border-t border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-lg z-40">
            <div className="flex justify-around items-stretch h-full">
                <NavButton label="Coach" isActive={currentView === 'chat'} onClick={() => setView('chat')}>
                    <ChatIcon className="w-7 h-7" />
                </NavButton>
                <NavButton label="Calendar" isActive={currentView === 'calendar'} onClick={() => setView('calendar')}>
                    <CalendarIcon className="w-7 h-7" />
                </NavButton>
                <NavButton label="Quests" isActive={currentView === 'quests'} onClick={() => setView('quests')}>
                    <QuestBoardIcon className="w-7 h-7" />
                </NavButton>
            </div>
        </nav>
    );
};