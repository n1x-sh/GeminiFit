
import React from 'react';
import { Icon } from './Icon';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <Icon name="sparkles" className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-text-primary">Gemini Fitness</h1>
        <p className="text-text-secondary mt-2">Your AI workout companion</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mt-8"></div>
      </div>
    </div>
  );
};

export default SplashScreen;