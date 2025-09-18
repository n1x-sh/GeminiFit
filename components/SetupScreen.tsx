
import React, { useState } from 'react';
import type { UserProfile, WorkoutPlan } from '../types';
import { FITNESS_LEVELS, GOALS, DAYS_PER_WEEK } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';

interface SetupScreenProps {
  onPlanGenerated: (plan: WorkoutPlan) => void;
  generatePlan: (profile: UserProfile) => Promise<WorkoutPlan | null>;
  loading: boolean;
  error: string | null;
  userProfile: UserProfile;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ userProfile, generatePlan, loading, error }) => {
  // FIX: Initialize profile state with the user's name from props to satisfy the UserProfile type.
  const [profile, setProfile] = useState<UserProfile>({
    name: userProfile.name,
    level: 'beginner',
    goal: 'general',
    days: 3,
    equipment: 'Bodyweight only',
  });

  const handleChange = <T,>(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'days' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generatePlan(profile);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-primary mb-2">Welcome!</h1>
        <p className="text-center text-text-secondary mb-8">Let's create your personalized workout plan.</p>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SelectInput name="level" label="Your Fitness Level" value={profile.level} onChange={handleChange} options={FITNESS_LEVELS} />
          <SelectInput name="goal" label="Your Primary Goal" value={profile.goal} onChange={handleChange} options={GOALS} />
          <SelectInput name="days" label="Workouts Per Week" value={profile.days} onChange={handleChange} options={DAYS_PER_WEEK} />
          
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-text-secondary mb-2">Available Equipment</label>
            <input
              type="text"
              name="equipment"
              id="equipment"
              value={profile.equipment}
              onChange={handleChange}
              placeholder="e.g., Dumbbells, resistance bands"
              className="w-full bg-surface border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Generate My Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

interface SelectInputProps<T extends string | number> {
    label: string;
    name: string;
    value: T;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: T; label: string }[];
}

const SelectInput = <T extends string | number,>({ label, name, value, onChange, options }: SelectInputProps<T>) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-surface border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23B3B3B3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);


export default SetupScreen;