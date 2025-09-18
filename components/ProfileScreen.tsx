import React, { useMemo, useState, useEffect } from 'react';
import type { UserProfile, WorkoutHistory, PR } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Icon } from './Icon';

interface ProfileScreenProps {
  profile: UserProfile;
  workoutHistory: WorkoutHistory;
  personalRecords: PR[];
  addPR: (pr: Omit<PR, 'id' | 'date'>) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, workoutHistory, personalRecords, addPR }) => {

  const { totalWorkouts, totalExercises, weeklyData } = useMemo(() => {
    const dates = Object.keys(workoutHistory);
    const totalWorkouts = dates.length;
    const totalExercises = dates.reduce((acc, date) => acc + Object.values(workoutHistory[date]).filter(Boolean).length, 0);

    const weeklyDataMap = new Map<string, number>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = dayNames[d.getDay()];
        weeklyDataMap.set(`${d.toISOString().split('T')[0]}_${dayName}`, 0);
    }
    
    Object.keys(workoutHistory).forEach(dateStr => {
        const d = new Date(dateStr);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);
        if (d >= sevenDaysAgo) {
            const dayName = dayNames[d.getDay()];
            const completedCount = Object.values(workoutHistory[dateStr]).filter(Boolean).length;
            weeklyDataMap.set(`${dateStr}_${dayName}`, (weeklyDataMap.get(`${dateStr}_${dayName}`) || 0) + completedCount);
        }
    });

    const weeklyData = Array.from(weeklyDataMap.entries())
        .map(([key, exercises]) => ({ name: key.split('_')[1], exercises }))
        .slice(-7);

    return { totalWorkouts, totalExercises, weeklyData };
  }, [workoutHistory]);

  
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Settings</h1>
      
      <div className="bg-surface rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
        <div className="text-text-secondary capitalize mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <p><span className="font-semibold">Level:</span> {profile.level}</p>
            <p><span className="font-semibold">Goal:</span> {profile.goal}</p>
            <p><span className="font-semibold">Days/Week:</span> {profile.days}</p>
        </div>
      </div>
      
      <AppSettingsSection />

      <h2 className="text-2xl font-bold text-text-primary mb-4 mt-8">Analytics</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard title="Workouts Completed" value={totalWorkouts} />
        <StatCard title="Exercises Done" value={totalExercises} />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-4">Activity This Week</h3>
      <div className="bg-surface rounded-lg p-4 h-64 w-full mb-8">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis dataKey="name" stroke="#B3B3B3" />
                <YAxis allowDecimals={false} stroke="#B3B3B3" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #4A4A4A' }}
                    labelStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="exercises" fill="#00F5D4" name="Completed Exercises" />
            </BarChart>
        </ResponsiveContainer>
      </div>
      
      <PRSection personalRecords={personalRecords} addPR={addPR} />

    </div>
  );
};

const AppSettingsSection: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

    useEffect(() => {
      setNotificationsEnabled(Notification.permission === 'granted');
    }, []);

    const handleNotificationToggle = async () => {
        if (Notification.permission === 'granted') {
           // In a real app, you might want to allow disabling, 
           // but browsers don't have a simple API to un-grant permission.
           // This toggle will primarily be for enabling.
           alert("Notification permissions can be managed in your browser settings.");
        } else if (Notification.permission === 'denied') {
            alert("Notifications are blocked. Please enable them in your browser settings.");
        } else {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">App Settings</h2>
            <div className="bg-surface rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-text-primary">Workout Reminders</p>
                        <p className="text-sm text-text-secondary">Receive notifications for your daily workouts.</p>
                    </div>
                    <button
                        onClick={handleNotificationToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                            notificationsEnabled ? 'bg-primary' : 'bg-gray-600'
                        }`}
                        aria-checked={notificationsEnabled}
                        role="switch"
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

const PRSection: React.FC<{ personalRecords: PR[], addPR: (pr: Omit<PR, 'id' | 'date'>) => void }> = ({ personalRecords, addPR }) => {
    const [exerciseName, setExerciseName] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps, 10);
        if (exerciseName.trim() && !isNaN(weightNum) && !isNaN(repsNum)) {
            addPR({ exerciseName: exerciseName.trim(), weight: weightNum, reps: repsNum });
            setExerciseName('');
            setWeight('');
            setReps('');
        }
    };
    
    const sortedPRs = useMemo(() => [...personalRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [personalRecords]);

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Personal Records</h2>
            <div className="bg-surface rounded-lg p-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="text" placeholder="Exercise Name" value={exerciseName} onChange={e => setExerciseName(e.target.value)} className="w-full bg-background border border-gray-600 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" required />
                    <div className="flex gap-4">
                        <input type="number" placeholder="Weight (kg/lbs)" value={weight} onChange={e => setWeight(e.target.value)} className="w-1/2 bg-background border border-gray-600 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" required />
                        <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} className="w-1/2 bg-background border border-gray-600 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-primary text-background font-bold py-3 px-4 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                        <Icon name="trophy" className="w-5 h-5" /> Log New PR
                    </button>
                </form>
            </div>
            
            <div className="mt-4 space-y-2">
                {sortedPRs.length === 0 ? (
                    <p className="text-text-secondary text-center py-4">No PRs logged yet. Let's get it!</p>
                ) : (
                    sortedPRs.map(pr => (
                        <div key={pr.id} className="bg-surface rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-primary">{pr.exerciseName}</p>
                                <p className="text-xs text-text-secondary">{new Date(pr.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-mono text-text-primary">{pr.weight} x {pr.reps}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="bg-surface p-4 rounded-lg text-center">
    <p className="text-3xl font-bold text-primary">{value}</p>
    <p className="text-sm text-text-secondary">{title}</p>
  </div>
);

export default ProfileScreen;