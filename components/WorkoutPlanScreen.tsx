
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

  const weekDayMap = useMemo(() => new Map(plan.weeklyPlan.map((d, i) => [d.day, (i + 1) % 7])), [plan]);
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
      days.push(<div key={`blank-${i}`} className="p-1"></div>);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeekJs = date.getDay(); // 0 for Sunday
      
      const planDayIndex = dayOfWeekJs === 0 ? 6 : dayOfWeekJs - 1; // App plan is Mon-Sun
      const isWorkoutDay = plan.weeklyPlan[planDayIndex] && !plan.weeklyPlan[planDayIndex].isRestDay;
      
      const completedExercises = history[dateStr] ? Object.values(history[dateStr]).filter(Boolean).length : 0;
      const totalExercises = plan.weeklyPlan[planDayIndex]?.exercises.length || 0;
      const isCompleted = completedExercises > 0 && completedExercises >= totalExercises;
      
      const hasPR = prDays.has(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      let dayClass = "w-10 h-10 flex items-center justify-center rounded-full relative";
      if (isToday) dayClass += " bg-primary text-background font-bold";
      else if (isCompleted) dayClass += " bg-secondary text-background";
      else dayClass += " text-text-primary";
      
      let borderClass = "p-1 flex items-center justify-center";
      if(hasPR) borderClass += " border-2 border-yellow-400 rounded-xl";


      days.push(
        <div key={day} className={borderClass}>
          <div className={dayClass}>
            {day}
            {isWorkoutDay && !isCompleted && <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full"></span>}
          </div>
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
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700">
            <Icon name="chevronDown" className="w-6 h-6 transform -rotate-90" />
          </button>
          <h2 className="text-xl font-bold text-text-primary">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700">
            <Icon name="chevronDown" className="w-6 h-6 transform rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;
