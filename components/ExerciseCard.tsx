import React from 'react';
import type { Exercise } from '../types';
import { Icon } from './Icon';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isCompleted, onToggleComplete }) => {
  return (
    <div className={`bg-surface rounded-lg p-4 transition-all duration-300 ${isCompleted ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className={`text-lg font-bold ${isCompleted ? 'line-through text-text-secondary' : 'text-primary'}`}>
            {exercise.name}
          </h3>
          <p className="text-text-secondary mt-1">{exercise.sets} sets x {exercise.reps} reps</p>
          <p className="text-sm text-text-secondary mt-2">{exercise.description}</p>
        </div>
        <button 
          onClick={onToggleComplete}
          aria-label={isCompleted ? `Mark ${exercise.name} as incomplete` : `Mark ${exercise.name} as complete`}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
            isCompleted 
            ? 'bg-primary text-background' 
            : 'bg-gray-700 hover:bg-gray-600 text-text-secondary'
          }`}
        >
          <Icon name={isCompleted ? 'check' : 'plus'} className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;