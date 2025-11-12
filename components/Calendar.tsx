import React, { useState, useMemo, useEffect } from 'react';
import { Quest, QuestStatus, DailyBriefingItem } from '../types';
import { generateDailyBriefing } from '../services/geminiService';
import { ScrollIcon } from './icons/ScrollIcon';
import QuestItem from './QuestItem';

interface CalendarProps {
    quests: Quest[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onCompleteQuest: (questId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ quests, selectedDate, onDateSelect, onCompleteQuest }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    
    const [briefing, setBriefing] = useState<Map<string, { timeframe: string; hint: string; }> | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);


    const questsByDate = useMemo(() => {
        const map = new Map<string, Quest[]>();
        quests.forEach(quest => {
            if (quest.dueDate) {
                const dateStr = quest.dueDate;
                if (!map.has(dateStr)) {
                    map.set(dateStr, []);
                }
                map.get(dateStr)!.push(quest);
            }
        });
        return map;
    }, [quests]);

    const selectedDayQuests = useMemo(() => {
        return quests.filter(q => q.dueDate === selectedDate && q.status === QuestStatus.ACTIVE);
    }, [quests, selectedDate]);

     useEffect(() => {
        if (viewMode === 'day' && selectedDayQuests.length > 0) {
            const fetchBriefing = async () => {
                setIsBriefingLoading(true);
                setBriefing(null);
                const briefingItems = await generateDailyBriefing(selectedDayQuests);
                if (briefingItems) {
                    const briefingMap = new Map<string, { timeframe: string; hint: string; }>();
                    briefingItems.forEach(item => {
                        briefingMap.set(item.id, { timeframe: item.timeframe, hint: item.hint });
                    });
                    setBriefing(briefingMap);
                }
                setIsBriefingLoading(false);
            };
            fetchBriefing();
        } else {
            setBriefing(null);
        }
    }, [viewMode, selectedDayQuests]);


    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = startOfMonth.getDay();
        const daysInMonth = endOfMonth.getDate();

        const calendarDays = [];
        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-start-${i}`} className="border-r border-b border-[rgba(var(--color-text-muted-rgb),0.3)]"></div>);
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
                    className={`p-2 border-r border-b border-[rgba(var(--color-text-muted-rgb),0.3)] flex flex-col cursor-pointer transition-colors duration-200 ${isToday ? 'bg-[rgba(var(--color-interactive-primary-rgb),0.2)]' : ''} ${isSelected ? 'ring-2 ring-[rgb(var(--color-accent-primary-rgb))] z-10' : 'hover:bg-[rgba(var(--color-interactive-primary-rgb),0.3)]'}`}
                    onClick={() => { onDateSelect(dateStr); setViewMode('day'); }}
                >
                    <span className={`font-bold ${isSelected ? 'text-[rgb(var(--color-accent-primary-rgb))]' : 'text-[rgb(var(--color-text-secondary-rgb))]'}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto flex-1">
                        {dayQuests.map(quest => (
                            <div key={quest.id} className="text-xs bg-[rgba(var(--color-interactive-primary-rgb),0.7)] p-1 rounded-md text-[rgb(var(--color-text-primary-rgb))] truncate" title={quest.title}>
                             {quest.title}
                            </div>
                        ))}
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
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="px-4 py-2 bg-[rgb(var(--color-interactive-primary-rgb))] rounded-lg hover:opacity-90 transition-opacity">‹ Prev</button>
                    <h2 className="font-display text-3xl text-[rgb(var(--color-accent-primary-rgb))]">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="px-4 py-2 bg-[rgb(var(--color-interactive-primary-rgb))] rounded-lg hover:opacity-90 transition-opacity">Next ›</button>
                </div>
                <div className="grid grid-cols-7 flex-1" style={{minHeight: '60vh'}}>
                    {weekDays.map(day => (
                        <div key={day} className="text-center font-bold text-[rgb(var(--color-accent-secondary-rgb))] border-b-2 border-r border-[rgba(var(--color-text-muted-rgb),0.3)] py-2">{day}</div>
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
                <div className="flex justify-between items-center mb-4">
                     <button onClick={() => setViewMode('month')} className="px-4 py-2 bg-[rgb(var(--color-interactive-primary-rgb))] rounded-lg hover:opacity-90 transition-opacity">‹ Month View</button>
                     <h2 className="font-display text-3xl text-[rgb(var(--color-accent-primary-rgb))] text-center">
                        {formattedDate}
                    </h2>
                    <div className="w-28"></div>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pt-1 pr-2 -mr-2">
                    {isBriefingLoading && (
                        <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))] animate-pulse">
                            <p>Consulting the stars for the day's briefing...</p>
                        </div>
                    )}
                    {selectedDayQuests.length > 0 ? (
                        selectedDayQuests.map(quest => (
                            <QuestItem
                                key={quest.id}
                                quest={quest}
                                isExpanded={expandedQuestId === quest.id}
                                onToggleExpand={() => setExpandedQuestId(prev => prev === quest.id ? null : quest.id)}
                                onComplete={onCompleteQuest}
                                briefing={briefing?.get(quest.id)}
                            />
                        ))
                    ) : (
                         <div className="text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                            <ScrollIcon className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">No Quests Scheduled</h3>
                            <p className="mt-2">This day is clear. A perfect time to plan or rest!</p>
                        </div>
                    )}
                </div>
            </>
        )
    };

    return (
        <div className="bg-[rgba(var(--color-background-secondary-rgb),0.3)] backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-[rgba(var(--color-border-primary-rgb),0.3)] shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.2)] h-full flex flex-col">
           {viewMode === 'month' ? renderMonthView() : renderDayView()}
        </div>
    );
};

export default Calendar;