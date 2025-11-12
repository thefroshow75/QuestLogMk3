import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Quest } from '../types';
import { SendIcon } from './icons/SendIcon';

interface ChatBotProps {
  history: ChatMessage[];
  isLoading: boolean;
  pendingQuest: Omit<Quest, 'id' | 'status'> | null;
  onSendMessage: (message: string) => void;
  onAcceptQuest: () => void;
  onDeclineQuest: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({
  history,
  isLoading,
  pendingQuest,
  onSendMessage,
  onAcceptQuest,
  onDeclineQuest
}) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, pendingQuest]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    onSendMessage(userInput);
    setUserInput('');
  };

  return (
    <div className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.2)] h-full flex flex-col">
      <header className="p-4 border-b border-[rgba(var(--color-border-primary-rgb),0.3)] text-center flex-shrink-0">
        <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">Forge AI Coach</h2>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] flex-shrink-0"></div>}
            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-[rgb(var(--color-interactive-user-rgb))] text-white rounded-br-none' : 'bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-secondary-rgb))] rounded-bl-none'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-interactive-primary-rgb))] flex-shrink-0"></div>
             <div className="max-w-xs px-4 py-2 rounded-lg bg-[rgba(var(--color-text-muted-rgb),0.3)] text-[rgb(var(--color-text-secondary-rgb))] rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-[rgb(var(--color-accent-primary-rgb))] rounded-full animate-pulse delay-300"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {pendingQuest && (
        <div className="p-4 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] bg-[rgba(var(--color-background-primary-rgb),0.5)] flex-shrink-0">
            <p className="text-center text-sm mb-3 text-[rgb(var(--color-text-secondary-rgb))]">
                Ready to add <strong className="text-[rgb(var(--color-accent-primary-rgb))]">"{pendingQuest.title}"</strong> to your plan?
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onAcceptQuest} className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors">
                    Accept
                </button>
                <button onClick={onDeclineQuest} className="px-5 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                    Decline
                </button>
            </div>
        </div>
      )}

      <div className="p-4 border-t border-[rgba(var(--color-border-primary-rgb),0.3)] flex-shrink-0">
        <form onSubmit={handleFormSubmit}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={pendingQuest ? "Awaiting your decision..." : "Let's plan your next step..."}
              className="flex-1 bg-[rgb(var(--color-background-primary-rgb))] border border-[rgba(var(--color-text-muted-rgb),0.5)] rounded-full py-2 px-4 text-[rgb(var(--color-text-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary-rgb))] disabled:bg-[rgba(var(--color-text-muted-rgb),0.2)]"
              disabled={isLoading || !!pendingQuest}
            />
            <button
              type="submit"
              className="bg-[rgb(var(--color-interactive-primary-rgb))] text-white rounded-full p-2 hover:opacity-90 disabled:bg-[rgb(var(--color-text-muted-rgb))] disabled:cursor-not-allowed transition-all"
              disabled={isLoading || !!pendingQuest || userInput.trim() === ''}
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;