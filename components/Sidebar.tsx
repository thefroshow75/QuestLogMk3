import React from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { QuestBoardIcon } from './icons/QuestBoardIcon';
import { ShopIcon } from './icons/ShopIcon';
import { FolderIcon } from './icons/FolderIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

type View = 'quests' | 'calendar' | 'chat' | 'workspace';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    onOpenShop: () => void;
    onOpenProjects: () => void;
}

const SidebarItem: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    isActive?: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-[rgba(var(--color-accent-primary-rgb),0.1)]' : 'hover:bg-[rgba(var(--color-background-secondary-rgb),0.5)]'}`}
    >
        <div className={`p-2 rounded-lg ${isActive ? 'bg-[rgb(var(--color-accent-primary-rgb))] text-[rgb(var(--color-background-primary-rgb))]' : 'bg-[rgba(var(--color-background-secondary-rgb),0.5)] text-[rgb(var(--color-text-muted-rgb))] group-hover:text-[rgb(var(--color-text-primary-rgb))]'}`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className={`font-bold text-lg ${isActive ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))] group-hover:text-[rgb(var(--color-text-primary-rgb))]'}`}>
            {label}
        </span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onOpenShop, onOpenProjects }) => {
    return (
        <div className="h-full w-64 flex flex-col p-4 border-r border-[rgba(var(--color-border-primary-rgb),0.3)] bg-[rgba(var(--color-background-primary-rgb),0.5)] backdrop-blur-md">
            <div className="mb-8 px-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-accent-primary-rgb))] rotate-45"></div>
                <h1 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">QuestLog</h1>
            </div>

            <nav className="space-y-2 flex-1">
                <SidebarItem 
                    icon={QuestBoardIcon} 
                    label="Quests" 
                    isActive={currentView === 'quests'} 
                    onClick={() => setView('quests')} 
                />
                <SidebarItem 
                    icon={CalendarIcon} 
                    label="Calendar" 
                    isActive={currentView === 'calendar'} 
                    onClick={() => setView('calendar')} 
                />
                <SidebarItem 
                    icon={ChatIcon} 
                    label="Coach" 
                    isActive={currentView === 'chat'} 
                    onClick={() => setView('chat')} 
                />
                <SidebarItem 
                    icon={ArchiveBoxIcon} 
                    label="Workspace" 
                    isActive={currentView === 'workspace'} 
                    onClick={() => setView('workspace')} 
                />
                
                <div className="my-4 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] mx-4"></div>

                <SidebarItem 
                    icon={FolderIcon} 
                    label="Projects" 
                    onClick={onOpenProjects} 
                />
                 <SidebarItem 
                    icon={ShopIcon} 
                    label="Shop" 
                    onClick={onOpenShop} 
                />
            </nav>

            <div className="mt-auto px-4 py-4 text-xs text-[rgb(var(--color-text-muted-rgb))] text-center">
                v1.3.0 • Desktop Mode
            </div>
        </div>
    );
};

export default Sidebar;