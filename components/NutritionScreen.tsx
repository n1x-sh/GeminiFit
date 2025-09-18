import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { NutritionHistory, DailyFoodLog } from '../types';
import { Icon } from './Icon';

interface NutritionScreenProps {
  history: NutritionHistory;
  logFood: (query: string) => Promise<void>;
  logFoodFromImage: (base64Image: string) => Promise<void>;
  loading: boolean;
}

const NutritionScreen: React.FC<NutritionScreenProps> = ({ history, logFood, logFoodFromImage, loading }) => {
  const [foodQuery, setFoodQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLog: DailyFoodLog = useMemo(() => history[todayStr] || { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }, [history, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim() || loading) return;
    await logFood(foodQuery);
    setFoodQuery('');
  };

  const handleCapture = async (imageDataUrl: string) => {
    setIsCameraOpen(false);
    // The data URL is "data:image/jpeg;base64,....", we need to strip the prefix
    const base64Image = imageDataUrl.split(',')[1];
    if (base64Image) {
        await logFoodFromImage(base64Image);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Nutrition Tracker</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-center">
        <StatCard title="Calories" value={Math.round(todaysLog.totals.calories)} unit="kcal" />
        <StatCard title="Protein" value={Math.round(todaysLog.totals.protein)} unit="g" />
        <StatCard title="Carbs" value={Math.round(todaysLog.totals.carbs)} unit="g" />
        <StatCard title="Fat" value={Math.round(todaysLog.totals.fat)} unit="g" />
      </div>

      <div className="bg-surface rounded-lg p-4">
        <h2 className="text-xl font-bold text-text-primary mb-4">Log Your Meal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
           <input
            type="text"
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            placeholder="e.g., 2 eggs and an apple"
            className="flex-grow w-full bg-background border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              disabled={!foodQuery.trim() || loading}
              className="w-full sm:w-1/2 bg-primary text-background font-bold py-3 px-5 rounded-lg hover:bg-secondary transition-colors duration-300 disabled:bg-gray-500 flex items-center justify-center gap-2"
            >
              <Icon name="plus" className="w-5 h-5" />
              <span>Log Food</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              disabled={loading}
              className="w-full sm:w-1/2 bg-secondary text-background font-bold py-3 px-5 rounded-lg hover:bg-primary transition-colors duration-300 disabled:bg-gray-500 flex items-center justify-center gap-2"
            >
              <Icon name="camera" className="w-5 h-5" />
              <span>Scan Meal</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Today's Log</h2>
        {todaysLog.items.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No food logged for today yet.</p>
        ) : (
          <ul className="space-y-3">
            {todaysLog.items.map((item, index) => (
              <li key={index} className="bg-surface p-3 rounded-lg flex justify-between items-center text-sm">
                <span className="text-text-primary flex-1">{item.name}</span>
                <span className="text-primary font-mono w-20 text-right">{Math.round(item.calories)} kcal</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string, unit: string }> = ({ title, value, unit }) => (
    <div className="bg-surface p-3 rounded-lg">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-xl font-bold text-primary">{value} <span className="text-base font-normal">{unit}</span></p>
    </div>
);

const CameraModal: React.FC<{onClose: () => void, onCapture: (imageData: string) => void}> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please ensure permissions are granted.");
                onClose();
            }
        };
        startCamera();
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [onClose]);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageData = canvas.toDataURL('image/jpeg');
                onCapture(imageData);
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2" aria-label="Close camera">
                <Icon name="close" className="w-8 h-8"/>
            </button>
            <div className="absolute bottom-8 flex flex-col items-center">
                <p className="text-white bg-black/50 rounded-md px-2 py-1 mb-4">Position your meal in the frame</p>
                <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-primary ring-4 ring-white/30" aria-label="Capture photo"></button>
            </div>
        </div>
    );
};

export default NutritionScreen;