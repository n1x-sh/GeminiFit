import React, { useState, useMemo } from 'react';
import type { WorkoutPlan, WorkoutHistory, PR } from '../types';
import { Icon } from './Icon';

interface CalendarScreenProps {
  plan: WorkoutPlan;
  history: WorkoutHistory;
  personalRecords: PR[];
  workoutStreak: number;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ plan, history, personalRecords, workoutStreak }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 for Sunday

  const prDays = useMemo(() => new Set(personalRecords.map(pr => pr.date)), [personalRecords]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderDays = () => {
    const days = [];
    // Add blank days for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`blank-${i}`} />);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeekJs = date.getDay(); // 0 for Sunday
      
      const planDayIndex = dayOfWeekJs === 0 ? 6 : dayOfWeekJs - 1; // App plan is Mon-Sun
      const dailyPlan = plan.weeklyPlan[planDayIndex];
      const isWorkoutDay = dailyPlan && !dailyPlan.isRestDay;
      
      const totalExercises = dailyPlan?.exercises.length || 0;
      const completedExercises = history[dateStr] ? Object.values(history[dateStr]).filter(Boolean).length : 0;
      const isCompleted = isWorkoutDay && totalExercises > 0 && completedExercises >= totalExercises;
      
      const hasPR = prDays.has(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      let dayClass = "aspect-square flex items-center justify-center rounded-lg relative transition-colors text-sm";

      if (isToday) {
        dayClass += " bg-primary text-background font-bold";
      } else if (isCompleted) {
        dayClass += " bg-secondary text-background";
      } else if (isWorkoutDay) {
        dayClass += " bg-secondary/30 text-text-primary";
      } else {
        dayClass += " bg-background text-text-secondary";
      }
      
      if (hasPR) {
        dayClass += " border-2 border-yellow-400 shadow-lg shadow-yellow-400/20";
      }

      days.push(
        <div key={day} className={dayClass}>
          {day}
          {isCompleted && !isToday && (
            <Icon name="check" className="absolute top-1 right-1 w-4 h-4 text-white/80" />
          )}
          {hasPR && (
             <Icon name="trophy" className="absolute bottom-1 left-1 w-4 h-4 text-yellow-400" />
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-2">Workout Calendar</h1>
       <div className="bg-surface rounded-lg p-4 mb-6 flex items-center justify-center gap-4">
            <Icon name="chart" className="w-8 h-8 text-secondary" />
            <div>
                <p className="text-2xl font-bold text-primary">{workoutStreak} Day Streak</p>
                <p className="text-text-secondary text-sm">Keep up the great work!</p>
            </div>
        </div>

      <div className="bg-surface rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700" aria-label="Previous month">
            <Icon name="chevronDown" className="w-6 h-6 transform -rotate-90" />
          </button>
          <h2 className="text-xl font-bold text-text-primary">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700" aria-label="Next month">
            <Icon name="chevronDown" className="w-6 h-6 transform rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day,i) => <div key={i}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;