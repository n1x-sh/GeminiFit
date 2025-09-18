import React, { useState, useEffect } from 'react';
import { useAppLogic } from './hooks/useWorkout';

import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import TodaysWorkoutScreen from './components/TodaysWorkoutScreen';
import CalendarScreen from './components/CalendarScreen';
import ChatScreen from './components/ChatScreen';
import NutritionScreen from './components/NutritionScreen';
import ProfileScreen from './components/ProfileScreen';
import BottomNav from './components/BottomNav';
import { LoadingSpinner } from './components/LoadingSpinner';

import type { View } from './types';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const appLogic = useAppLogic();
  const {
    isInitializing,
    userProfile,
    workoutPlan,
    loading,
    error,
  } = appLogic;

  const [activeView, setActiveView] = useState<View>('today');

  useEffect(() => {
    // Show splash screen on every load
    setShowSplash(true);
    const splashTimer = setTimeout(() => setShowSplash(false), 1500);

    // Fix viewport height for mobile keyboard
    const initialHeight = window.innerHeight;
    setViewportHeight(initialHeight);

    return () => clearTimeout(splashTimer);
  }, []);


  const renderContent = () => {
    if (showSplash || isInitializing) {
      return <SplashScreen />;
    }

    if (!userProfile) {
      return <AuthScreen onLogin={appLogic.login} />;
    }

    if (!workoutPlan) {
      return <SetupScreen userProfile={userProfile} onPlanGenerated={appLogic.setWorkoutPlan} generatePlan={appLogic.generatePlan} loading={loading} error={error} />;
    }

    switch (activeView) {
      case 'today':
        return <TodaysWorkoutScreen plan={workoutPlan} history={appLogic.workoutHistory} onToggleComplete={appLogic.toggleExerciseComplete} userProfile={userProfile} />;
      case 'calendar':
        return <CalendarScreen plan={workoutPlan} history={appLogic.workoutHistory} personalRecords={appLogic.personalRecords} workoutStreak={appLogic.workoutStreak} />;
      case 'chat':
        return <ChatScreen chatHistory={appLogic.chatHistory} sendMessage={appLogic.sendMessageToCoach} />;
      case 'nutrition':
        return <NutritionScreen history={appLogic.nutritionHistory} logFood={appLogic.logFood} logFoodFromImage={appLogic.logFoodFromImage} loading={loading} />;
      case 'settings':
        return <ProfileScreen profile={userProfile} workoutHistory={appLogic.workoutHistory} personalRecords={appLogic.personalRecords} addPR={appLogic.addPR} />;
      default:
        return <TodaysWorkoutScreen plan={workoutPlan} history={appLogic.workoutHistory} onToggleComplete={appLogic.toggleExerciseComplete} userProfile={userProfile} />;
    }
  };

  const showNav = !showSplash && !isInitializing && userProfile && workoutPlan;

  return (
    <div className="bg-background text-text-primary font-sans flex flex-col" style={{ height: viewportHeight ? `${viewportHeight}px` : '100vh' }}>
       {loading && (
        <div className="fixed top-4 right-4 z-50">
          <LoadingSpinner />
        </div>
      )}
      <main className={`flex-grow ${activeView === 'chat' ? 'overflow-y-hidden' : 'overflow-y-auto no-scrollbar'} ${showNav ? 'pb-20' : ''}`}>
        <div className={`container mx-auto max-w-lg p-4 fade-in ${activeView === 'chat' ? 'h-full' : ''}`}>
          {renderContent()}
        </div>
      </main>
      {showNav && <BottomNav activeView={activeView} setActiveView={setActiveView} />}
    </div>
  );
};

export default App;