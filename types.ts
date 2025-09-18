
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  description: string;
}

export interface DailyWorkout {
  day: string;
  isRestDay: boolean;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  weeklyPlan: DailyWorkout[];
}

export interface UserProfile {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general';
  days: number;
  equipment: string;
}

export type WorkoutHistory = {
  [date: string]: {
    [exerciseId: string]: boolean;
  };
};

export type View = 'today' | 'calendar' | 'chat' | 'nutrition' | 'settings';

// Chat Types
export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

// Nutrition Types
export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface DailyFoodLog {
    items: FoodItem[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }
}

export type NutritionHistory = {
  [date: string]: DailyFoodLog;
};

// Personal Record Types
export interface PR {
    id: string;
    date: string; // YYYY-MM-DD
    exerciseName: string;
    weight: number;
    reps: number;
}