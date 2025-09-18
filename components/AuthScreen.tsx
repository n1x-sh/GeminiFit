
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { Icon } from './Icon';

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // For this mock-up, we'll use default values for the rest of the profile.
      // The user will set these properly in the SetupScreen.
      onLogin({
        name: name.trim(),
        level: 'beginner',
        goal: 'general',
        days: 3,
        equipment: 'Bodyweight',
      });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
      <div className="w-full max-w-md text-center">
        <Icon name="sparkles" className="w-20 h-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-center text-primary mb-2">Welcome to Gemini Fitness</h1>
        <p className="text-center text-text-secondary mb-8">Let's start your fitness journey. What should we call you?</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">Your Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-surface border border-gray-600 rounded-lg px-4 py-3 text-center text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-background font-bold py-3 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 disabled:bg-gray-500"
            disabled={!name.trim()}
          >
            Start My Journey
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;