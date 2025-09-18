
import React from 'react';
import type { View } from '../types';
import { Icon, type IconName } from './Icon';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems: { view: View; label: string; icon: IconName }[] = [
    { view: 'today', label: "Today", icon: 'sparkles' },
    { view: 'calendar', label: 'Calendar', icon: 'calendar' },
    { view: 'chat', label: 'AI Coach', icon: 'chatBubble' },
    { view: 'nutrition', label: 'Nutrition', icon: 'food' },
    { view: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-700 max-w-lg mx-auto">
      <div className="flex justify-around">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 ${
              activeView === item.view ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={item.icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;