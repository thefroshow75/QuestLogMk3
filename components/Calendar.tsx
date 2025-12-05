import React, { useState, useMemo, useEffect } from 'react';
import { Quest, QuestStatus, QuestType, RepeatFrequency } from '../types';
import { generateDailyBriefing, generateDailyIdeas } from '../services/geminiService';
import { ScrollIcon } from './icons/ScrollIcon';
import QuestItem from './QuestItem';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface CalendarProps {
    quests: Quest[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onCompleteQuest: (questId: string, date: string) => void;
    onAddQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
}

const isQuestForDate = (quest: Quest, dateStr: string): boolean => {
    if (quest.status !== QuestStatus.ACTIVE) return false;

    const targetDate = new Date(dateStr + 'T00:00:00');

    if (quest.type === QuestType.RECURRING) {
        if (!quest.startDate) return false;
        const startDate = new Date(quest.startDate + 'T00:00:00');
        if (targetDate < startDate) return false;

        if (quest.endDate) {
            const endDate = new Date(quest.endDate + 'T00:00:00');
            if (targetDate > endDate) return false;
        }

        if (quest.repeatFrequency === RepeatFrequency.DAILY) {
            return true;
        }

        if (quest.repeatFrequency === RepeatFrequency.WEEKLY) {
            const targetDay = targetDate.getDay();
            return quest.repeatDays?.includes(targetDay) ?? false;
        }
    } else { // QuestType.ONCE
        return quest.dueDate === dateStr;
    }
    return false;
};

const Calendar: React.FC<CalendarProps> = ({ quests, selectedDate, onDateSelect, onCompleteQuest, onAddQuest }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    
    const [briefing, setBriefing] = useState<Map<string, { timeframe: string; hint: string; }> | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
    
    const [dailyIdeas, setDailyIdeas] = useState<Omit<Quest, 'id' | 'status'>[]>([]);
    const [isIdeasLoading, setIsIdeasLoading] = useState(false);


    const questsByDate = useMemo(() => {
        const map = new Map<string, Quest[]>();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dailyQuests = quests.filter(q => isQuestForDate(q, dateStr));
            if (dailyQuests.length > 0) {
                 map.set(dateStr, dailyQuests);
            }
        }
        return map;
    }, [quests, currentDate]);

    const selectedDayQuests = useMemo(() => {
        return quests.filter(q => isQuestForDate(q, selectedDate));
    }, [quests, selectedDate]);
    
    const isQuestCompletedForDate = (quest: Quest, date: string) => {
        return quest.completedDates?.includes(date);
    }

    useEffect(() => {
        if (viewMode === 'day') {
            const fetchBriefingAndIdeas = async () => {
                const questsForBriefing = selectedDayQuests.filter(q => !q.isDaily);
                if (questsForBriefing.length > 0) {
                    setIsBriefingLoading(true);
                    setBriefing(null);
                    const briefingItems = await generateDailyBriefing(questsForBriefing);
                    if (briefingItems) {
                        const briefingMap = new Map<string, { timeframe: string; hint: string; }>();
                        briefingItems.forEach(item => {
                            briefingMap.set(item.id, { timeframe: item.timeframe, hint: item.hint });
                        });
                        setBriefing(briefingMap);
                    }
                    setIsBriefingLoading(false);
                } else {
                    setBriefing(null);
                }
                
                setIsIdeasLoading(true);
                const unscheduled = quests.filter(q => q.type === QuestType.ONCE && !q.dueDate && q.status === QuestStatus.ACTIVE && !q.isDaily);
                const ideas = await generateDailyIdeas(selectedDate, unscheduled, selectedDayQuests);
                setDailyIdeas(ideas || []);
                setIsIdeasLoading(false);
            };
            fetchBriefingAndIdeas();
        } else {
            setBriefing(null);
            setDailyIdeas([]);
        }
    }, [viewMode, selectedDate, quests]); 


    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = startOfMonth.getDay();
        const daysInMonth = endOfMonth.getDate();

        const calendarDays = [];
        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-start-${i}`} className="border-r border-b border-[rgba(var(--color-text-muted-rgb),0.1)]"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const dayQuests = questsByDate.get(dateStr) || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate === dateStr;

            calendarDays.push(
                <div 
                    key={day} 
                    className={`p-1.5 border-r border-b border-[rgba(var(--color-text-muted-rgb),0.1)] flex flex-col cursor-pointer transition-colors duration-200 min-h-[100px] ${isToday ? 'bg-[rgba(var(--color-interactive-primary-rgb),0.1)]' : ''} ${isSelected ? 'ring-2 ring-inset ring-[rgb(var(--color-accent-primary-rgb))] z-10' : 'hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)]'}`}
                    onClick={() => { onDateSelect(dateStr); setViewMode('day'); }}
                >
                    <span className={`text-sm font-bold ml-1 ${isSelected ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto flex-1 no-scrollbar">
                        {dayQuests.slice(0, 3).map(quest => (
                            <div key={quest.id} className="flex items-center gap-1.5 bg-[rgba(var(--color-background-secondary-rgb),0.6)] px-1.5 py-0.5 rounded text-[10px] border border-[rgba(var(--color-border-primary-rgb),0.2)]">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${quest.type === QuestType.RECURRING ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                                <span className="truncate text-[rgb(var(--color-text-primary-rgb))]">{quest.title}</span>
                            </div>
                        ))}
                        {dayQuests.length > 3 && (
                            <div className="text-[10px] text-[rgb(var(--color-text-muted-rgb))] pl-1">
                                +{dayQuests.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const nextMonth = () => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        };

        const prevMonth = () => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        };

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <button onClick={prevMonth} className="px-4 py-2 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg transition-colors font-bold text-sm">‹ Prev</button>
                    <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="px-4 py-2 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg transition-colors font-bold text-sm">Next ›</button>
                </div>
                <div className="grid grid-cols-7 flex-1 border-t border-l border-[rgba(var(--color-text-muted-rgb),0.1)]">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-[rgb(var(--color-accent-secondary-rgb))] border-b border-r border-[rgba(var(--color-text-muted-rgb),0.1)] py-2 bg-[rgba(var(--color-background-secondary-rgb),0.3)]">{day}</div>
                    ))}
                    {calendarDays}
                </div>
            </>
        );
    };

    const renderDayView = () => {
        const date = new Date(selectedDate + 'T00:00:00');
        const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        return (
             <>
                <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                     <button onClick={() => setViewMode('month')} className="px-3 py-1.5 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg transition-colors text-xs font-bold uppercase tracking-wider">Back to Month</button>
                     <div className="h-6 w-px bg-[rgba(var(--color-border-primary-rgb),0.3)]"></div>
                     <h2 className="font-display text-2xl text-[rgb(var(--color-accent-primary-rgb))]">
                        {formattedDate}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    {isBriefingLoading && (
                        <div className="text-center py-8 text-[rgb(var(--color-text-muted-rgb))] animate-pulse">
                            <p>Consulting the stars for the day's briefing...</p>
                        </div>
                    )}
                    {selectedDayQuests.length > 0 ? (
                        <div className="space-y-3">
                        {selectedDayQuests.map(quest => (
                            <QuestItem
                                key={quest.id}
                                quest={quest}
                                isExpanded={expandedQuestId === quest.id}
                                onToggleExpand={() => setExpandedQuestId(prev => prev === quest.id ? null : quest.id)}
                                onComplete={(questId) => onCompleteQuest(questId, selectedDate)}
                                briefing={briefing?.get(quest.id)}
                                isCompletedForDate={isQuestCompletedForDate(quest, selectedDate)}
                            />
                        ))}
                        </div>
                    ) : (
                         <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                            <ScrollIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">No Quests Scheduled</h3>
                            <p className="mt-2 text-sm">This day is clear. A perfect time to plan or rest!</p>
                        </div>
                    )}

                    {/* Today's Ideas Section */}
                    <div className="mt-8 pt-6 border-t border-dashed border-[rgba(var(--color-accent-secondary-rgb),0.3)]">
                        <h3 className="font-display text-[rgb(var(--color-accent-primary-rgb))] text-xl mb-4 flex items-center gap-2">
                            <MagicWandIcon className="w-5 h-5" />
                            Suggested For You
                        </h3>
                         {isIdeasLoading ? (
                             <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-[rgba(var(--color-text-muted-rgb),0.1)] p-4 rounded-xl animate-pulse h-16"></div>
                                ))}
                             </div>
                        ) : dailyIdeas.length > 0 ? (
                            <div className="space-y-3">
                                {dailyIdeas.map((idea, index) => (
                                    <div key={index} className="bg-[rgba(var(--color-interactive-primary-rgb),0.1)] p-4 rounded-xl border border-[rgba(var(--color-interactive-primary-rgb),0.2)] flex justify-between items-center group hover:bg-[rgba(var(--color-interactive-primary-rgb),0.2)] transition-colors">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-bold text-[rgb(var(--color-accent-primary-rgb))] truncate">{idea.title}</p>
                                            <p className="text-xs text-[rgb(var(--color-text-secondary-rgb))] truncate mt-0.5">{idea.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-[rgb(var(--color-accent-tertiary-rgb))] text-xs">+{idea.xp} XP</span>
                                            <button
                                                onClick={() => onAddQuest(idea)}
                                                className="text-xs bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))] font-bold py-1.5 px-3 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-[rgb(var(--color-text-muted-rgb))] text-sm text-center py-4">The Oracle rests... check back tomorrow for new ideas.</p>
                        )}
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="h-full relative flex flex-col overflow-hidden px-6 pt-4">
            {viewMode === 'month' ? renderMonthView() : renderDayView()}
        </div>
    );
};

export default Calendar;