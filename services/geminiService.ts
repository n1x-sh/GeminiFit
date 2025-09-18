

import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, WorkoutPlan, Exercise, DailyWorkout, FoodItem } from '../types';

const workoutResponseSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.ARRAY,
      description: "A 7-day workout plan. Each day is an object.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "e.g., Monday, Tuesday" },
          isRestDay: { type: Type.BOOLEAN },
          exercises: {
            type: Type.ARRAY,
            description: "List of exercises for the day. Empty if it's a rest day.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING, description: "e.g., '8-12' or '30 seconds'" },
                description: { type: Type.STRING, description: "A brief description or tip for the exercise." }
              },
              required: ["name", "sets", "reps", "description"],
            }
          }
        },
        required: ["day", "isRestDay", "exercises"],
      }
    }
  },
  required: ["weeklyPlan"],
};

const nutritionResponseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the food item, e.g., '1 large apple' or '2 slices of whole wheat bread'." },
            calories: { type: Type.INTEGER },
            protein: { type: Type.NUMBER, description: "in grams" },
            carbs: { type: Type.NUMBER, description: "in grams" },
            fat: { type: Type.NUMBER, description: "in grams" },
        },
        required: ["name", "calories", "protein", "carbs", "fat"]
    }
};

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const prompt = `
    You are an expert fitness coach. Create a personalized 7-day workout plan based on the following user profile.
    The plan should be well-structured and tailored to the user's goals and constraints.
    - IMPORTANT: Ensure all workout days are scheduled on weekdays (Monday to Friday), and weekends (Saturday, Sunday) are designated as Rest Days.
    - If the user specifies fewer than 5 workout days, fill the remaining weekdays with 'Rest Day' where appropriate (e.g., spread out workout days).
    - For each exercise, provide a concise name, the number of sets, a repetition range (e.g., '8-12 reps'), and a brief, helpful description or tip.
    - Ensure the exercise selection matches the available equipment.

    User Profile:
    - Fitness Level: ${profile.level}
    - Primary Goal: ${profile.goal}
    - Workout Days Per Week: ${profile.days}
    - Available Equipment: ${profile.equipment}

    Generate the plan now.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutResponseSchema,
        temperature: 0.7,
      },
    });

    const parsedPlan = JSON.parse(response.text);

    parsedPlan.weeklyPlan.forEach((day: DailyWorkout) => {
        if (day.exercises) {
            day.exercises.forEach((exercise: Exercise, index: number) => {
                exercise.id = `${day.day.toLowerCase().replace(/\s/g, '-')}-${index}-${Date.now()}`;
            });
        }
    });

    return parsedPlan as WorkoutPlan;

  } catch (error) {
    console.error("Error generating workout plan from Gemini:", error);
    throw new Error("Failed to get a valid workout plan from the AI. Please try adjusting your inputs.");
  }
};

export const getNutritionInfo = async (query: string): Promise<FoodItem[]> => {
    const prompt = `
        You are a nutritional database expert. Analyze the following text and break it down into individual food items. 
        For each item, provide a best-effort estimate of its nutritional content (calories, protein, carbs, fat).
        If a quantity is not specified, assume a standard serving size.

        Query: "${query}"
    `;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: nutritionResponseSchema,
            },
        });
        
        return JSON.parse(response.text) as FoodItem[];

    } catch (error) {
        console.error("Error getting nutrition info from Gemini:", error);
        throw new Error("Failed to analyze food. Please try again with a clearer description.");
    }
};

export const getNutritionInfoFromImage = async (base64Image: string): Promise<FoodItem[]> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: "Analyze this image of a meal and provide a best-effort estimate of its nutritional content for each food item. If you cannot identify an item, omit it. Respond in the required JSON format.",
    };

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: nutritionResponseSchema,
            },
        });
        return JSON.parse(response.text) as FoodItem[];
    } catch (error) {
        console.error("Error getting nutrition info from image:", error);
        throw new Error("Failed to analyze the image. Please try again with a clearer picture.");
    }
};