import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { WorkoutPlan, WorkoutHistory, UserProfile, NutritionHistory, ChatMessage, DailyFoodLog, FoodItem, PR } from '../types';
import { generateWorkoutPlan as callGeminiApi, getNutritionInfo, getNutritionInfoFromImage } from '../services/geminiService';
import { GoogleGenAI, Chat } from "@google/genai";

const WORKOUT_PLAN_KEY = 'geminiWorkoutPlan';
const WORKOUT_HISTORY_KEY = 'geminiWorkoutHistory';
const USER_PROFILE_KEY = 'geminiUserProfile';
const NUTRITION_HISTORY_KEY = 'geminiNutritionHistory';
const CHAT_HISTORY_KEY = 'geminiChatHistory';
const PERSONAL_RECORDS_KEY = 'geminiPersonalRecords';

export const useAppLogic = () => {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory>({});
  const [nutritionHistory, setNutritionHistory] = useState<NutritionHistory>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PR[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatInstance = useRef<Chat | null>(null);

  // Effect for loading all data from localStorage on initial app load
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) setUserProfileState(JSON.parse(storedProfile));

      const storedPlan = localStorage.getItem(WORKOUT_PLAN_KEY);
      if (storedPlan) setWorkoutPlanState(JSON.parse(storedPlan));

      const storedWorkoutHistory = localStorage.getItem(WORKOUT_HISTORY_KEY);
      if (storedWorkoutHistory) setWorkoutHistory(JSON.parse(storedWorkoutHistory));
      
      const storedNutritionHistory = localStorage.getItem(NUTRITION_HISTORY_KEY);
      if (storedNutritionHistory) setNutritionHistory(JSON.parse(storedNutritionHistory));

      const storedChatHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedChatHistory) setChatHistory(JSON.parse(storedChatHistory));

      const storedPRs = localStorage.getItem(PERSONAL_RECORDS_KEY);
      if (storedPRs) setPersonalRecords(JSON.parse(storedPRs));

    } catch (e) {
      console.error("Failed to parse from localStorage", e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Effect for initializing the chat instance whenever the user profile is available
  useEffect(() => {
    if (userProfile) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatInstance.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a friendly and encouraging AI fitness and nutrition coach named Gemini Fit. The user's name is ${userProfile.name} and their fitness profile is: Level: ${userProfile.level}, Goal: ${userProfile.goal}. Keep your answers concise, helpful, and positive.`,
            },
        });
    } else {
        chatInstance.current = null;
    }
  }, [userProfile]);


  const login = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  }, []);

  const setWorkoutPlan = useCallback((plan: WorkoutPlan | null) => {
    setWorkoutPlanState(plan);
    if (plan) {
      localStorage.setItem(WORKOUT_PLAN_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(WORKOUT_PLAN_KEY);
    }
  }, []);
  
  const generatePlan = useCallback(async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await callGeminiApi(profile);
      setWorkoutPlan(plan);
      setWorkoutHistory({});
      localStorage.removeItem(WORKOUT_HISTORY_KEY);
      return plan;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate workout plan. ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setWorkoutPlan]);
  
  const resetApp = useCallback(() => {
    setUserProfileState(null);
    setWorkoutPlan(null);
    setWorkoutHistory({});
    setNutritionHistory({});
    setChatHistory([]);
    setPersonalRecords([]);
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem(WORKOUT_PLAN_KEY);
    localStorage.removeItem(WORKOUT_HISTORY_KEY);
    localStorage.removeItem(NUTRITION_HISTORY_KEY);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(PERSONAL_RECORDS_KEY);
  }, [setWorkoutPlan]);

  const toggleExerciseComplete = useCallback((exerciseId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setWorkoutHistory(prev => {
      const newHistory = { ...prev };
      if (!newHistory[today]) newHistory[today] = {};
      
      const isCompleting = !newHistory[today][exerciseId];
      newHistory[today][exerciseId] = isCompleting;

      if (isCompleting && window.navigator.vibrate) {
        window.navigator.vibrate(50); // Vibrate for 50ms on completion
      }
      
      localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const updateNutritionHistory = (foodItems: FoodItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    setNutritionHistory(prev => {
        const newHistory = {...prev};
        const todaysLog: DailyFoodLog = newHistory[today] || { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
        
        foodItems.forEach((item: FoodItem) => {
            todaysLog.items.push(item);
            todaysLog.totals.calories += item.calories;
            todaysLog.totals.protein += item.protein;
            todaysLog.totals.carbs += item.carbs;
            todaysLog.totals.fat += item.fat;
        });

        newHistory[today] = todaysLog;
        localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const logFood = useCallback(async (foodQuery: string) => {
    setLoading(true);
    setError(null);
    try {
        const foodItems = await getNutritionInfo(foodQuery);
        updateNutritionHistory(foodItems);
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Could not log food. ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  }, []);

  const logFoodFromImage = useCallback(async (base64Image: string) => {
    setLoading(true);
    setError(null);
    try {
      const foodItems = await getNutritionInfoFromImage(base64Image);
      updateNutritionHistory(foodItems);
    } catch(e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Could not log food from image. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessageToCoach = useCallback(async (message: string, onStream: (chunk: string) => void) => {
    if (!chatInstance.current) {
        setError("Chat not initialized. Please refresh the page.");
        console.error("Chat not initialized");
        return;
    }
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);

    try {
        const stream = await chatInstance.current.sendMessageStream({ message });
        let fullResponse = "";
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            onStream(fullResponse);
        }
        
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: fullResponse }] };
        const newHistory = [...chatHistory, userMessage, modelMessage];
        setChatHistory(newHistory);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
        
    } catch (e) {
        console.error("Error sending message:", e);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
        setChatHistory(prev => [...prev, errorMessage]);
    }
  }, [chatHistory]);

  const addPR = useCallback((pr: Omit<PR, 'id' | 'date'>) => {
    const newPR: PR = {
      ...pr,
      id: `pr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setPersonalRecords(prev => {
      const newPRs = [...prev, newPR];
      localStorage.setItem(PERSONAL_RECORDS_KEY, JSON.stringify(newPRs));
      return newPRs;
    });
  }, []);

  const workoutStreak = useMemo(() => {
    const dates = Object.keys(workoutHistory)
      .filter(date => Object.values(workoutHistory[date]).some(Boolean))
      .sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

    if (dates.length === 0) return 0;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the most recent workout was today or yesterday
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    if (dates.length > 0) {
        streak = 1;
        let lastDate = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const diff = (lastDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
                streak++;
                lastDate = currentDate;
            } else {
                break;
            }
        }
    }
    
    return streak;
  }, [workoutHistory]);

  return { 
    isInitializing,
    userProfile,
    workoutPlan,
    workoutHistory,
    nutritionHistory,
    chatHistory,
    personalRecords,
    loading,
    error,
    workoutStreak,
    login,
    setWorkoutPlan,
    generatePlan,
    resetApp,
    toggleExerciseComplete,
    logFood,
    logFoodFromImage,
    sendMessageToCoach,
    addPR,
  };
};