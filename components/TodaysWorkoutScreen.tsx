
import React from 'react';
import type { WorkoutPlan, WorkoutHistory, UserProfile } from '../types';
import ExerciseCard from './ExerciseCard';
import { Icon } from './Icon';

interface TodaysWorkoutScreenProps {
  plan: WorkoutPlan;
  history: WorkoutHistory;
  onToggleComplete: (exerciseId: string) => void;
  userProfile: UserProfile;
}

const TodaysWorkoutScreen: React.FC<TodaysWorkoutScreenProps> = ({ plan, history, onToggleComplete, userProfile }) => {
  const todayIndex = new Date().getDay(); // Sunday = 0, Monday = 1...
  const adjustedTodayIndex = (todayIndex === 0) ? 6 : todayIndex - 1;
  
  const dailyWorkout = plan.weeklyPlan[adjustedTodayIndex];
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysHistory = history[todayStr] || {};

  if (!dailyWorkout) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-text-primary">Error</h2>
        <p className="text-text-secondary">Could not load today's workout.</p>
      </div>
    );
  }

  const completedCount = Object.values(todaysHistory).filter(Boolean).length;
  const totalCount = dailyWorkout.exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-1">Hello, {userProfile.name}!</h1>
      <p className="text-lg text-text-secondary mb-6">Here's your workout for {dailyWorkout.day}.</p>
      
      {dailyWorkout.isRestDay ? (
        <div className="bg-surface rounded-lg p-8 text-center flex flex-col items-center justify-center h-64">
          <Icon name="moon" className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">Rest Day</h2>
          <p className="text-text-secondary mt-2">Relax, recover, and get ready for tomorrow.</p>
        </div>
      ) : (
        <>
        {totalCount > 0 &&
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1 text-sm text-text-secondary">
              <span>Progress</span>
              <span>{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        }
        <div className="space-y-4">
          {dailyWorkout.exercises.length > 0 ? (
            dailyWorkout.exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={!!todaysHistory[exercise.id]}
                onToggleComplete={() => onToggleComplete(exercise.id)}
              />
            ))
          ) : (
             <div className="bg-surface rounded-lg p-8 text-center flex flex-col items-center justify-center h-64">
              <Icon name="checkCircle" className="w-16 h-16 text-secondary mb-4" />
              <h2 className="text-2xl font-bold text-text-primary">Workout Complete!</h2>
              <p className="text-text-secondary mt-2">Or maybe it's an active recovery day. Great job!</p>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default TodaysWorkoutScreen;
