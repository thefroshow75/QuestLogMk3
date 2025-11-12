import React from 'react';
import { GearIcon } from './icons/GearIcon';

interface NavbarProps {
  level: number;
  xp: number;
  xpForNextLevel: number;
  onOpenSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ level, xp, xpForNextLevel, onOpenSettings }) => {
  const progressPercentage = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;

  return (
    <nav className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm sticky top-0 z-30 border-b border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.2)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <h1 className="font-display text-4xl text-[rgb(var(--color-accent-primary-rgb))] tracking-wider">
            Questlog
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-full max-w-sm hidden sm:block">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-[rgb(var(--color-accent-tertiary-rgb))]">Level {level}</span>
                <span className="text-[rgb(var(--color-text-secondary-rgb))]">
                  {xp} / {xpForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-[rgba(var(--color-background-primary-rgb),0.8)] rounded-full h-4 border-2 border-[rgba(var(--color-border-primary-rgb),0.5)]">
                <div
                  className="bg-gradient-to-r from-[rgb(var(--color-accent-tertiary-rgb))] to-[rgb(var(--color-accent-quaternary-rgb))] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-full text-[rgb(var(--color-text-secondary-rgb))] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:text-[rgb(var(--color-text-primary-rgb))] transition-colors"
              aria-label="Open settings"
            >
              <GearIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;