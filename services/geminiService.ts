import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Quest, ScheduleSuggestion, DailyBriefingItem, ChatMessage } from '../types';

let chat: Chat | null = null;

const getChat = () => {
    if (!chat) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are 'Forge', a personal AI life coach and motivational planner. Your primary role is to help users define, break down, and act upon their real-life goals. You are encouraging, insightful, and always focused on actionable steps.
        When a user discusses a goal, an ambition, or even a vague desire (e.g., "I want to be healthier," "I should learn to code"), your job is to help them brainstorm and then turn those ideas into concrete, manageable tasks, which we'll call 'Quests'.
        When you identify a clear, actionable task from the conversation, first respond with a short, motivational, and encouraging sentence. Then, on a new line, you MUST provide the quest in the specific JSON format. The JSON should be the last part of your response.
        The JSON format MUST be: {"type": "quest", "title": "...", "description": "...", "xp": ..., "dueDate": "...", "tags": ["..."]}.
        - 'title' should be a clear and concise task name (e.g., "Complete First Chapter of Python Course", "30-Minute Morning Jog", "Draft Project Outline").
        - 'description' should be a brief, clear explanation of the task.
        - 'xp' should be an integer between 10 and 100, representing the effort or importance of the task.
        - 'dueDate' is optional. If the user mentions a date or timeline, include it in 'YYYY-MM-DD' format.
        - 'tags' is an optional array of short, relevant, lowercase string tags (e.g., ["fitness", "learning", "work"]).
        If the user is just chatting, feeling unmotivated, or unsure where to start, respond as a supportive coach. Ask clarifying questions, offer encouragement, and help them explore their goals until a concrete step emerges. Only generate the quest JSON when a specific task is ready to be assigned.`,
            },
        });
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
            const quest: Omit<Quest, 'id' | 'status'> = {
                title: parsedJson.title,
                description: parsedJson.description,
                xp: parsedJson.xp,
            };
            if(parsedJson.dueDate) {
                quest.dueDate = parsedJson.dueDate;
            }
            if(Array.isArray(parsedJson.tags)) {
                quest.tags = parsedJson.tags.filter((t: any) => typeof t === 'string');
            }
            return quest;
        }
    } catch (e) {
        // Not a valid quest JSON
    }
    return null;
}

export const generateQuestFromChat = async (
    message: string
): Promise<{ textResponse: string; quest: Omit<Quest, 'id' | 'status'> | null }> => {
    try {
        const chatSession = getChat();
        const response = await chatSession.sendMessage({ message });
        const rawText = response.text;

        const quest = parseQuestFromText(rawText);
        
        // The text response is everything before the JSON object, or the full text if no quest is found.
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
                contextMessage = "Based on these currently active quests, suggest three new quests that are logical next steps or similar in theme.";
                break;
            case 'completed':
                contextMessage = "Based on these recently completed quests, suggest three new quests that the user might enjoy.";
                break;
            case 'today':
                 contextMessage = "Based on the quests scheduled for today, suggest three small, quick, and easy quests that could also be accomplished today without much effort.";
                break;
            case 'selected_day':
                const date = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'the selected day';
                contextMessage = `Based on the quests scheduled for ${date}, suggest three small, quick quests that could also be accomplished on that day.`;
                break;
        }

        const prompt = `You are a motivational AI assistant. Your task is to suggest three new quests.
        
        IMPORTANT: Prioritize topics and goals from the user's recent conversation. This is the most important context.
        Recent Conversation:
        ---
        ${recentChat}
        ---

        Also consider the user's existing quests for context.
        Filter context: ${contextMessage}
        Existing Quests:
        ${JSON.stringify(contextQuests.map(q => ({ title: q.title, description: q.description, tags: q.tags })))}

        Your response MUST be a JSON object containing a "quests" array, with exactly three quest objects.
        Each quest object MUST have "title", "description", "xp", and "tags" properties.
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
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["title", "description", "xp"]
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
