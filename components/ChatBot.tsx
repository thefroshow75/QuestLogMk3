import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Quest } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { BrainIcon } from './icons/BrainIcon';
import { ShopIcon } from './icons/ShopIcon';
import { personalities } from '../data/personalities';

interface ChatBotProps {
  history: ChatMessage[];
  isLoading: boolean;
  pendingQuest: Omit<Quest, 'id' | 'status'> | null;
  onSendMessage: (message: string) => void;
  onAcceptQuest: () => void;
  onDeclineQuest: () => void;
  onOpenProjects: () => void;
  onOpenShop: () => void; // Added prop
  activePersonalityId: string;
  unlockedItemIds: string[];
  onPersonalityChange: (id: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({
  history,
  isLoading,
  pendingQuest,
  onSendMessage,
  onAcceptQuest,
  onDeclineQuest,
  onOpenProjects,
  onOpenShop,
  activePersonalityId,
  unlockedItemIds,
  onPersonalityChange
}) => {
  const [userInput, setUserInput] = useState('');
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, pendingQuest]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    onSendMessage(userInput);
    setUserInput('');
  };

  const unlockedPersonalities = personalities.filter(p => unlockedItemIds.includes(p.id));
  const activePersonality = personalities.find(p => p.id === activePersonalityId) || personalities[0];
  const merchantAvatar = "https://api.dicebear.com/9.x/avataaars/svg?seed=Thaddeus";

  return (
    <div className="h-full relative flex flex-col overflow-hidden">
      <header className="px-6 py-4 border-b border-[rgba(var(--color-border-primary-rgb),0.3)] flex justify-between items-center flex-shrink-0 bg-[rgba(var(--color-background-primary-rgb),0.3)] rounded-t-xl">
        <div className="flex items-center gap-3">
             {/* Alive Avatar */}
             <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] flex items-center justify-center relative">
                <span className="absolute inset-0 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] animate-ping opacity-20"></span>
                <span className="text-white font-bold text-xs relative z-10">AI</span>
             </div>
            <div>
                <h2 className="font-display text-xl text-[rgb(var(--color-accent-primary-rgb))]">{activePersonality.name}</h2>
                <p className="text-xs text-[rgb(var(--color-text-muted-rgb))] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                </p>
            </div>
        </div>
        <div className="flex gap-2 items-center">
            
            {/* NPC Shopkeeper Shortcut */}
            <div className="group relative">
                <button 
                    onClick={onOpenShop}
                    className="w-9 h-9 rounded-full border border-[rgba(var(--color-accent-tertiary-rgb),0.5)] bg-[rgba(var(--color-background-secondary-rgb),0.5)] overflow-hidden hover:scale-105 transition-transform"
                >
                    <img src={merchantAvatar} alt="Shopkeeper" className="w-full h-full object-cover" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    Visit Shop
                </div>
            </div>

            <div className="w-px h-6 bg-[rgba(var(--color-border-primary-rgb),0.3)] mx-1"></div>

            <div className="relative" ref={personaMenuRef}>
                 <button 
                    onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                    className="p-2 bg-[rgba(var(--color-accent-secondary-rgb),0.2)] rounded-lg hover:bg-[rgba(var(--color-accent-secondary-rgb),0.4)] text-[rgb(var(--color-accent-secondary-rgb))] transition-colors"
                    title="Change Personality"
                >
                    <BrainIcon className="w-5 h-5" />
                </button>
                {isPersonaMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-background-primary-rgb))] border border-[rgba(var(--color-border-primary-rgb),0.5)] rounded-lg shadow-xl z-20 overflow-hidden">
                         <div className="p-2 bg-[rgba(var(--color-background-secondary-rgb),0.5)] border-b border-[rgba(var(--color-border-primary-rgb),0.3)]">
                             <span className="text-xs font-bold text-[rgb(var(--color-text-muted-rgb))] uppercase">Select Persona</span>
                         </div>
                         <div className="max-h-60 overflow-y-auto">
                             {unlockedPersonalities.map(p => (
                                 <button
                                    key={p.id}
                                    onClick={() => { onPersonalityChange(p.id); setIsPersonaMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] border-b border-[rgba(var(--color-border-primary-rgb),0.1)] last:border-0 ${activePersonalityId === p.id ? 'bg-[rgba(var(--color-interactive-primary-rgb),0.1)] font-bold text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}
                                 >
                                     <div className="font-bold">{p.name}</div>
                                     <div className="text-xs text-[rgb(var(--color-text-muted-rgb))] truncate">{p.description}</div>
                                 </button>
                             ))}
                         </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/10">AI</div>
            )}
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[rgb(var(--color-interactive-user-rgb))] text-white rounded-br-none' : 'bg-[rgba(var(--color-background-secondary-rgb),0.7)] border border-[rgba(var(--color-border-primary-rgb),0.2)] text-[rgb(var(--color-text-secondary-rgb))] rounded-bl-none'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-end gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">AI</div>
             <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-[rgba(var(--color-background-secondary-rgb),0.7)] text-[rgb(var(--color-text-secondary-rgb))] rounded-bl-none border border-[rgba(var(--color-border-primary-rgb),0.2)]">
                <div className="flex items-center space-x-1.5 h-5">
                    <span className="w-1.5 h-1.5 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-bounce delay-0"></span>
                    <span className="w-1.5 h-1.5 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-bounce delay-300"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {pendingQuest && (
        <div className="p-6 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] bg-[rgba(var(--color-background-primary-rgb),0.5)] flex-shrink-0 backdrop-blur-md">
            <p className="text-center text-sm mb-4 text-[rgb(var(--color-text-secondary-rgb))]">
                <span className="font-bold text-[rgb(var(--color-accent-primary-rgb))]">QUEST DETECTED:</span> Shall we add "{pendingQuest.title}" to your log?
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onAcceptQuest} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20">
                    Accept
                </button>
                <button onClick={onDeclineQuest} className="px-6 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20">
                    Decline
                </button>
            </div>
        </div>
      )}

      <div className="p-6 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] flex-shrink-0 bg-[rgba(var(--color-background-primary-rgb),0.2)] rounded-b-xl">
        <form onSubmit={handleFormSubmit}>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={pendingQuest ? "Awaiting your decision..." : "Type your goal here..."}
              className="flex-1 bg-[rgba(var(--color-background-primary-rgb),0.6)] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-xl py-3 px-5 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))] disabled:bg-[rgba(var(--color-text-muted-rgb),0.2)] transition-all shadow-inner"
              disabled={isLoading || !!pendingQuest}
            />
            <button
              type="submit"
              className="bg-[rgb(var(--color-interactive-primary-rgb))] text-white font-bold rounded-xl py-3 px-6 hover:opacity-90 disabled:bg-[rgb(var(--color-text-muted-rgb))] disabled:cursor-not-allowed transition-all shadow-md"
              disabled={isLoading || !!pendingQuest || userInput.trim() === ''}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;