import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Quest, ScheduleSuggestion, DailyBriefingItem, ChatMessage, QuestType, RepeatFrequency, Personality } from '../types';
import { personalities } from '../data/personalities';

let chat: Chat | null = null;
let currentPersonalityId: string | null = null;

const getChat = (personality: Personality) => {
    // If personality changed, reset chat to apply new system instruction
    if (chat && currentPersonalityId !== personality.id) {
        chat = null;
    }

    if (!chat) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Base prompt + JSON rules
        const formattingRules = `
When a user discusses a goal, ambition, or a routine, you must identify if it's a one-time task or a recurring one.

1.  **For One-Time Quests**: If a user mentions a specific, singular task (e.g., "I need to finish my project presentation"), create a standard quest.
    The JSON format MUST be: \`{"type": "quest", "questType": "ONCE", "title": "...", "description": "...", "xp": ..., "dueDate": "...", "tags": ["..."]}\`.
    - 'dueDate' is optional. Use 'YYYY-MM-DD' format if a date is mentioned.

2.  **For Recurring Quests**: If a user mentions a task that repeats (e.g., "I want to go to the gym on Mondays and Fridays", "I have to do laundry every week", "I need to study every day"), create a recurring quest.
    The JSON format MUST be: \`{"type": "quest", "questType": "RECURRING", "title": "...", "description": "...", "xp": ..., "startDate": "...", "endDate": "...", "repeatFrequency": "...", "repeatDays": [...]}\`.
    - 'questType' MUST be "RECURRING".
    - 'startDate' is the start date in 'YYYY-MM-DD' format. Default to today if not specified.
    - 'endDate' is optional.
    - 'repeatFrequency' can be "DAILY" or "WEEKLY".
    - 'repeatDays' is an array of numbers (0=Sunday, 1=Monday... 6=Saturday). For "DAILY", this array can be omitted or empty. For "WEEKLY", it should contain the specific days.

**General Rules**:
-   First, respond with a short, motivational sentence matching your persona.
-   Then, on a new line, you MUST provide the quest in the specific JSON format. The JSON should be the last part of your response.
-   'title' should be a clear task name.
-   'description' should be a brief explanation.
-   'xp' should be an integer between 10 and 100.
-   'tags' is an optional array of lowercase strings.
-   If the user is just chatting or unsure, respond as a supportive coach without generating JSON.`;

        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `${personality.systemInstruction}\n\n${formattingRules}`,
            },
        });
        currentPersonalityId = personality.id;
    }
    return chat;
}

const parseQuestFromText = (text: string): Omit<Quest, 'id' | 'status'> | null => {
    try {
        const jsonStartIndex = text.indexOf('{');
        if (jsonStartIndex === -1) return null;
        
        const potentialJson = text.substring(jsonStartIndex, text.lastIndexOf('}') + 1);
        const parsedJson = JSON.parse(potentialJson);

        if (parsedJson.type === 'quest' && parsedJson.title && parsedJson.description && typeof parsedJson.xp === 'number') {
            const questType = parsedJson.questType === 'RECURRING' ? QuestType.RECURRING : QuestType.ONCE;

            const baseQuest = {
                title: parsedJson.title,
                description: parsedJson.description,
                xp: parsedJson.xp,
                type: questType,
                tags: Array.isArray(parsedJson.tags) ? parsedJson.tags.filter((t: any) => typeof t === 'string') : [],
            };

            if (questType === QuestType.RECURRING) {
                return {
                    ...baseQuest,
                    startDate: parsedJson.startDate || new Date().toISOString().split('T')[0],
                    endDate: parsedJson.endDate,
                    repeatFrequency: parsedJson.repeatFrequency === 'DAILY' ? RepeatFrequency.DAILY : RepeatFrequency.WEEKLY,
                    repeatDays: Array.isArray(parsedJson.repeatDays) ? parsedJson.repeatDays.filter((d: any) => typeof d === 'number' && d >= 0 && d <= 6) : [],
                };
            } else {
                return {
                    ...baseQuest,
                    dueDate: parsedJson.dueDate,
                };
            }
        }
    } catch (e) {
        console.error("Error parsing quest from text:", e);
    }
    return null;
}

export const generateQuestFromChat = async (
    message: string,
    personalityId: string = 'forge_default'
): Promise<{ textResponse: string; quest: Omit<Quest, 'id' | 'status'> | null }> => {
    try {
        const personality = personalities.find(p => p.id === personalityId) || personalities[0];
        const chatSession = getChat(personality);
        
        const response = await chatSession.sendMessage({ message });
        const rawText = response.text;

        const quest = parseQuestFromText(rawText);
        
        const jsonStartIndex = rawText.indexOf('{');
        const textResponse = (quest && jsonStartIndex > 0) ? rawText.substring(0, jsonStartIndex).trim() : rawText;
        
        return { textResponse, quest };
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return { textResponse: "I'm having trouble connecting right now... My apologies. Let's try again in a moment.", quest: null };
    }
};

export const generateBatchSuggestions = async (
    contextQuests: Quest[],
    filter: 'active' | 'completed' | 'today' | 'selected_day',
    chatHistory: ChatMessage[],
    selectedDate?: string,
    numberOfSuggestions = 3,
): Promise<Omit<Quest, 'id' | 'status'>[] | null> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const recentChat = chatHistory.slice(1).slice(-6).map(m => `${m.sender === 'user' ? 'User' : 'Coach'}: ${m.text}`).join('\n');
        
        let contextMessage: string;
        switch (filter) {
            case 'active':
                contextMessage = `Based on these currently active quests, suggest ${numberOfSuggestions} new quests that are logical next steps or similar in theme.`;
                break;
            case 'completed':
                contextMessage = `Based on these recently completed quests, suggest ${numberOfSuggestions} new quests that the user might enjoy.`;
                break;
            case 'today':
                 contextMessage = `Based on the quests scheduled for today, suggest ${numberOfSuggestions} small, quick, and easy quests that could also be accomplished today without much effort.`;
                break;
            case 'selected_day':
                const date = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'the selected day';
                contextMessage = `Based on the quests scheduled for ${date}, suggest ${numberOfSuggestions} small, quick quests that could also be accomplished on that day.`;
                break;
        }

        const prompt = `You are a motivational AI assistant. Your task is to suggest ${numberOfSuggestions} new one-time quests.
        
        IMPORTANT: Prioritize topics and goals from the user's recent conversation. This is the most important context.
        Recent Conversation:
        ---
        ${recentChat}
        ---

        Also consider the user's existing quests for context.
        Filter context: ${contextMessage}
        Existing Quests:
        ${JSON.stringify(contextQuests.map(q => ({ title: q.title, description: q.description, tags: q.tags })))}

        Your response MUST be a JSON object containing a "quests" array, with exactly ${numberOfSuggestions} quest objects.
        Each quest object MUST have "title", "description", "xp", "tags", and "type" properties.
        - 'type' MUST always be 'ONCE'.
        - 'title' should be an actionable task.
        - 'xp' should be an integer between 10 and 100.
        - 'tags' should be an array of strings.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quests: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    xp: { type: Type.INTEGER },
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    type: { type: Type.STRING, enum: ['ONCE'] }
                                },
                                required: ["title", "description", "xp", "type"]
                            }
                        }
                    },
                    required: ["quests"],
                },
            },
        });

        const result = JSON.parse(response.text);
        if (result.quests && Array.isArray(result.quests)) {
            return result.quests as Omit<Quest, 'id' | 'status'>[];
        }
        return null;

    } catch (error) {
        console.error("Error generating batch suggestions from Gemini API:", error);
        return null;
    }
};

export const generateDailyQuests = async (): Promise<Omit<Quest, 'id' | 'status'>[] | null> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate exactly 3 diverse, simple daily quests.
        - One quest should be for health/wellness (e.g., stretching, short walk, hydration).
        - One quest for productivity/learning (e.g., read an article, plan the day, tidy workspace).
        - One quest for mindfulness/creativity (e.g., listen to a song without distractions, 5-minute meditation, sketch something).
        
        They must be achievable in 30 minutes or less.
        
        Your response MUST be a JSON object containing a "quests" array with exactly 3 quest objects.
        Each quest object MUST have "title", "description", "xp", "tags", and "type" properties.
        - 'xp' should be a small integer between 10 and 30.
        - 'type' must be 'ONCE'.
        - 'tags' must include 'daily' and another relevant tag (e.g., 'health').`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quests: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    xp: { type: Type.INTEGER },
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    type: { type: Type.STRING, enum: ['ONCE'] }
                                },
                                required: ["title", "description", "xp", "type", "tags"]
                            }
                        }
                    },
                    required: ["quests"],
                },
            },
        });
        const result = JSON.parse(response.text);
        if (result.quests && Array.isArray(result.quests) && result.quests.length === 3) {
            return result.quests as Omit<Quest, 'id' | 'status'>[];
        }
        return null;
    } catch (error) {
        console.error("Error generating daily quests from Gemini API:", error);
        return null;
    }
}


export const generateDailyIdeas = async (
    date: string,
    unscheduledQuests: Quest[],
    scheduledQuests: Quest[],
): Promise<Omit<Quest, 'id' | 'status'>[] | null> => {
     try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

        const prompt = `You are an intelligent daily planner. Your task is to suggest three actionable ideas for today, ${formattedDate}.
        
        Consider the user's unscheduled quests and suggest one that fits well for today.
        Also, suggest one or two other fun, healthy, or productive activities.
        Avoid suggesting quests that are already scheduled for today.

        Unscheduled Quests:
        ${unscheduledQuests.length > 0 ? JSON.stringify(unscheduledQuests.map(q => ({ title: q.title, description: q.description }))) : "None"}

        Already Scheduled Quests for Today:
        ${scheduledQuests.length > 0 ? JSON.stringify(scheduledQuests.map(q => ({ title: q.title }))) : "None"}

        Your response MUST be a JSON object containing a "quests" array, with exactly three quest objects.
        Each quest object MUST have "title", "description", "xp", "tags", and "type" properties.
        - 'type' MUST always be 'ONCE'.
        - 'dueDate' MUST be set to '${date}'.
        - 'title' should be a creative and engaging task name.
        - 'description' should be a brief, motivational explanation.
        - 'xp' should be an integer between 10 and 50.
        - 'tags' should be an array of relevant strings (e.g., ["idea", "fun", "health"]).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quests: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    xp: { type: Type.INTEGER },
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    type: { type: Type.STRING, enum: ['ONCE'] },
                                    dueDate: { type: Type.STRING }
                                },
                                required: ["title", "description", "xp", "type", "dueDate"]
                            }
                        }
                    },
                    required: ["quests"],
                },
            },
        });
        const result = JSON.parse(response.text);
        if (result.quests && Array.isArray(result.quests)) {
            return result.quests as Omit<Quest, 'id' | 'status'>[];
        }
        return null;

    } catch (error) {
        console.error("Error generating daily ideas from Gemini API:", error);
        return null;
    }
};


export const generateDailyBriefing = async (
    todayQuests: Quest[]
): Promise<DailyBriefingItem[] | null> => {
     try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `For the following quests scheduled for today, provide a suggested timeframe (e.g., 'Morning', 'Afternoon', '1-2 hours') and a short, helpful hint for each one to help the user get started.
        
        Quests for today:
        ${JSON.stringify(todayQuests.map(q => ({ id: q.id, title: q.title, description: q.description })))}

        Your response MUST be a JSON object containing a "briefings" array. Each item in the array must be an object with "id", "timeframe", and "hint" properties.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        briefings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    timeframe: { type: Type.STRING },
                                    hint: { type: Type.STRING },
                                },
                                required: ["id", "timeframe", "hint"],
                            }
                        }
                    },
                    required: ["briefings"],
                },
            },
        });

        const result = JSON.parse(response.text);
        if (result.briefings && Array.isArray(result.briefings)) {
            return result.briefings as DailyBriefingItem[];
        }
        return null;
    } catch (error) {
        console.error("Error generating daily briefing from Gemini API:", error);
        return null;
    }
};

export const generateSchedule = async (
    unscheduledQuests: Quest[], 
    scheduledQuests: Quest[]
): Promise<ScheduleSuggestion[] | null> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const today = new Date().toISOString().split('T')[0];

        const prompt = `As a quest scheduling assistant, your task is to assign due dates to a list of unscheduled quests.
        Today's date is ${today}.
        
        Here are the quests that need scheduling:
        ${JSON.stringify(unscheduledQuests.map(q => ({ id: q.id, title: q.title, description: q.description })))}

        For context, here are the quests that are already on the calendar:
        ${JSON.stringify(scheduledQuests.map(q => ({ title: q.title, dueDate: q.dueDate })))}

        Please distribute the unscheduled quests logically over the next few weeks. Consider the quest titles and descriptions to space out similar or difficult tasks. Avoid scheduling too many quests on the same day if possible.
        
        Your response MUST be a JSON object containing a "schedule" array. Each item in the array should be an object with the quest "id" and a "suggestedDate" in "YYYY-MM-DD" format.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    suggestedDate: { type: Type.STRING },
                                },
                                required: ["id", "suggestedDate"],
                            }
                        }
                    },
                    required: ["schedule"],
                },
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        if (result.schedule && Array.isArray(result.schedule)) {
            return result.schedule as ScheduleSuggestion[];
        }

        return null;

    } catch (error) {
        console.error("Error generating schedule from Gemini API:", error);
        return null;
    }
};