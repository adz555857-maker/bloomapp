import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Check, Utensils, X, Image as ImageIcon } from 'lucide-react';
import { estimateMetric, analyzeImage } from '../services/geminiService';
import { FoodLog } from '../types';

interface FoodViewProps {
  foodLogs: FoodLog[];
  onAddLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
  dailyCalories: number;
  calorieGoal?: { min: number, max?: number };
}

const FoodView: React.FC<FoodViewProps> = ({ foodLogs, onAddLog, dailyCalories, calorieGoal }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{name: string, calories: number} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    const calories = await estimateMetric(inputText, 'kcal');
    setLoading(false);

    if (calories !== null) {
      setAnalysisResult({ name: inputText, calories });
      setInputText('');
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // remove data:image/jpeg;base64, prefix for Gemini
        const base64Data = base64String.split(',')[1];
        
        setShowPreview(base64String);
        setLoading(true);
        
        const result = await analyzeImage(base64Data);
        setLoading(false);
        
        if (result) {
            setAnalysisResult(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmLog = () => {
    if (analysisResult) {
      onAddLog({
        name: analysisResult.name,
        calories: analysisResult.calories,
        date: getToday(),
      });
      setAnalysisResult(null);
      setShowPreview(null);
    }
  };

  const cancelLog = () => {
      setAnalysisResult(null);
      setShowPreview(null);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-grow space-y-6 pb-20">
      
      {/* HEADER DASHBOARD */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-earth-200 dark:border-stone-800 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 to-red-400" />
         
         <div className="flex justify-between items-end mb-4">
             <div className="text-left">
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Nutrition</h2>
                <p className="text-sm text-stone-500">Fuel your growth</p>
             </div>
             <div className="text-right">
                <div className="text-3xl font-black text-nature-600 dark:text-nature-400">{dailyCalories}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">kcal today</div>
             </div>
         </div>

         {calorieGoal && (
            <div className="relative pt-2">
                <div className="flex justify-between text-xs font-bold text-stone-400 mb-1">
                    <span>0</span>
                    <span>{calorieGoal.min} {calorieGoal.max ? `- ${calorieGoal.max}` : ''}</span>
                </div>
                <div className="h-4 bg-earth-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${dailyCalories > (calorieGoal.max || 9999) ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-nature-500'}`}
                        style={{ width: `${Math.min(100, (dailyCalories / calorieGoal.min) * 100)}%` }}
                    />
                </div>
            </div>
         )}
      </div>

      {/* INPUT AREA */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 shadow-sm border border-earth-100 dark:border-stone-800">
         
         {loading ? (
             <div className="flex flex-col items-center justify-center py-8 text-stone-400 animate-pulse">
                 <Sparkles className="w-8 h-8 mb-2 text-nature-500" />
                 <p>Analyzing with AI...</p>
             </div>
         ) : analysisResult ? (
             <div className="p-2 animate-grow">
                 {showPreview && (
                     <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-black">
                         <img src={showPreview} alt="Food" className="w-full h-full object-contain" />
                     </div>
                 )}
                 <div className="flex justify-between items-center mb-4">
                     <div>
                         <h3 className="font-bold text-lg text-stone-800 dark:text-white capitalize">{analysisResult.name}</h3>
                         <p className="text-nature-600 dark:text-nature-400 font-mono font-bold">{analysisResult.calories} kcal</p>
                     </div>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={cancelLog} className="flex-1 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold hover:bg-stone-200 dark:hover:bg-stone-700">Cancel</button>
                     <button onClick={confirmLog} className="flex-1 py-3 rounded-xl bg-nature-600 text-white font-bold hover:bg-nature-700 flex items-center justify-center gap-2">
                         <Check size={18} /> Log It
                     </button>
                 </div>
             </div>
         ) : (
             <div className="space-y-4">
                 <form onSubmit={handleTextSubmit} className="relative">
                     <input 
                       type="text" 
                       placeholder="Describe your meal (e.g. 2 eggs & toast)"
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       className="w-full p-4 pr-12 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:border-nature-500 focus:outline-none"
                     />
                     <button type="submit" disabled={!inputText} className="absolute right-3 top-3 p-1.5 bg-nature-500 text-white rounded-lg hover:bg-nature-600 disabled:opacity-50">
                         <Sparkles size={18} />
                     </button>
                 </form>

                 <div className="flex items-center gap-4">
                    <div className="h-px bg-earth-200 dark:bg-stone-700 flex-1" />
                    <span className="text-xs text-stone-400 font-bold uppercase">OR</span>
                    <div className="h-px bg-earth-200 dark:bg-stone-700 flex-1" />
                 </div>

                 <button 
                   onClick={handleCameraClick}
                   className="w-full py-4 border-2 border-dashed border-earth-300 dark:border-stone-600 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-earth-50 dark:hover:bg-stone-800 hover:border-nature-400 transition-colors flex items-center justify-center gap-2 font-bold"
                 >
                     <Camera size={20} /> Snap a Photo
                 </button>
                 <input 
                   type="file" 
                   accept="image/*" 
                   capture="environment"
                   ref={fileInputRef} 
                   className="hidden" 
                   onChange={handleFileChange}
                 />
             </div>
         )}
      </div>

      {/* RECENT LOGS */}
      <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider px-2">Today's Meals</h3>
          {foodLogs.length === 0 ? (
              <div className="text-center py-8 text-stone-400 bg-white/50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                  <Utensils className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nothing logged yet.</p>
              </div>
          ) : (
              foodLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-earth-100 dark:border-stone-800">
                      <span className="font-bold text-stone-800 dark:text-stone-200 capitalize">{log.name}</span>
                      <span className="font-mono text-stone-600 dark:text-stone-400 text-sm">{log.calories} kcal</span>
                  </div>
              ))
          )}
      </div>

    </div>
  );
};

export default FoodView;