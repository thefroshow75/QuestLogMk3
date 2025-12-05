import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { VerticalLinesIcon } from './icons/VerticalLinesIcon';
import { FlameIcon } from './icons/FlameIcon';
import { StarMedalIcon } from './icons/StarMedalIcon'; // Assuming you might use this, otherwise standard icons
import { GearIcon } from './icons/GearIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { SkillsIcon } from './icons/SkillsIcon';

interface NavbarProps {
  user: User;
  streak: number;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenSkills: () => void;
  onToggleDailyQuests: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, streak, onOpenProfile, onOpenSettings, onOpenAchievements, onOpenSkills, onToggleDailyQuests }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const xpPercentage = (user.xp / user.xpToNextLevel) * 100;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm px-6 py-4 border-b border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-sm flex justify-between items-center z-40 h-[80px]">
      
      {/* Mobile Brand - Hidden on Desktop since Sidebar has it */}
      <div className="md:hidden flex items-center">
        <button onClick={onOpenProfile} className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">
          QuestLog
        </button>
      </div>
      
      {/* Desktop Spacer or Title (Optional) */}
      <div className="hidden md:block">
          {/* Breadcrumbs or Page Title could go here */}
      </div>

      {/* Stats Bar */}
      <div className="flex-1 max-w-2xl mx-auto hidden md:flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
                <FlameIcon className={`w-6 h-6 ${streak > 0 ? 'text-orange-500' : 'text-[rgb(var(--color-text-muted-rgb))]'}`} />
                <span className="font-bold text-xl">{streak} <span className="text-xs text-[rgb(var(--color-text-muted-rgb))] font-normal">DAY STREAK</span></span>
            </div>
            
            <div className="flex-1">
                 <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-sm text-[rgb(var(--color-accent-secondary-rgb))]">LVL {user.level}</span>
                    <span className="text-xs text-[rgb(var(--color-text-muted-rgb))]">{user.xp} / {user.xpToNextLevel} XP</span>
                </div>
                <div className="w-full bg-[rgba(var(--color-background-secondary-rgb),0.5)] rounded-full h-2 border border-[rgba(var(--color-border-primary-rgb),0.5)] overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-[rgb(var(--color-accent-tertiary-rgb))] to-[rgb(var(--color-accent-quaternary-rgb))] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgb(var(--color-accent-tertiary-rgb))]" 
                        style={{ width: `${xpPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-[rgba(var(--color-background-secondary-rgb),0.5)] px-4 py-1.5 rounded-full border border-[rgba(var(--color-accent-primary-rgb),0.3)] flex items-center gap-2">
                <span className="text-[rgb(var(--color-accent-primary-rgb))] font-bold">{user.gold}</span>
                <span className="text-xs text-[rgb(var(--color-text-muted-rgb))] font-bold uppercase">Gold</span>
            </div>
      </div>


      <div className="flex items-center gap-4">
        {/* Mobile Stats Summary */}
        <div className="md:hidden flex items-center gap-3">
             <div className="flex items-center gap-1">
                <FlameIcon className="w-5 h-5 text-orange-500" />
                <span className="font-bold">{streak}</span>
             </div>
             <div className="w-24">
                 <div className="h-1.5 bg-[rgba(var(--color-background-secondary-rgb),0.5)] rounded-full">
                    <div className="bg-[rgb(var(--color-accent-tertiary-rgb))] h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                 </div>
             </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="flex items-center gap-2 hover:bg-[rgba(var(--color-background-secondary-rgb),0.5)] p-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[rgba(var(--color-interactive-primary-rgb),0.5)] border border-[rgba(var(--color-border-primary-rgb),0.5)] flex items-center justify-center overflow-hidden">
                {/* Simplified Avatar Preview */}
                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="avatar" className="w-full h-full" />
            </div>
            {user.skillPoints > 0 && (
                 <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[rgb(var(--color-background-primary-rgb))]"></span>
            )}
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-background-primary-rgb))] border border-[rgba(var(--color-border-primary-rgb),0.5)] rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b border-[rgba(var(--color-border-primary-rgb),0.2)]">
                    <p className="font-bold text-[rgb(var(--color-text-primary-rgb))]">{user.username}</p>
                    <p className="text-xs text-[rgb(var(--color-text-muted-rgb))]">Level {user.level} Adventurer</p>
                </div>
              <div className="p-2 space-y-1">
                <button onClick={() => handleMenuClick(onOpenProfile)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] flex items-center gap-3 text-[rgb(var(--color-text-secondary-rgb))]">
                    <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">?</div> Profile
                </button>
                 <button onClick={() => handleMenuClick(onOpenSkills)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] flex items-center gap-3 text-[rgb(var(--color-text-secondary-rgb))]">
                    <SkillsIcon className="w-5 h-5" /> Skills
                    {user.skillPoints > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{user.skillPoints}</span>}
                </button>
                <button onClick={() => handleMenuClick(onOpenAchievements)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] flex items-center gap-3 text-[rgb(var(--color-text-secondary-rgb))]">
                    <TrophyIcon className="w-5 h-5" /> Achievements
                </button>
                 <div className="h-px bg-[rgba(var(--color-border-primary-rgb),0.2)] my-1" />
                <button onClick={() => handleMenuClick(onOpenSettings)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] flex items-center gap-3 text-[rgb(var(--color-text-secondary-rgb))]">
                    <GearIcon className="w-5 h-5" /> Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;