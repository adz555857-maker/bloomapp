import React, { useState } from 'react';
import { Check, Trash2, Plus, Flame, Trophy, X, ChevronRight, Activity, Droplets, BookOpen, AlertTriangle } from 'lucide-react';
import { Habit, HabitType } from '../types';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onProgress: (id: string, value: number) => void;
  onAdd: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'progress'>) => void;
  onDelete: (id: string) => void;
}

const PREMADE_HABITS = [
  { title: "Calorie Goal", type: 'numeric' as const, target: 1800, maxTarget: 2200, unit: 'kcal', icon: <Activity size={18} /> },
  { title: "Drink Water", type: 'numeric' as const, target: 8, unit: 'cups', icon: <Droplets size={18} /> },
  { title: "Read", type: 'numeric' as const, target: 15, unit: 'mins', icon: <BookOpen size={18} /> },
  { title: "Meditate", type: 'boolean' as const, target: 1, unit: '', icon: null },
  { title: "Exercise", type: 'boolean' as const, target: 1, unit: '', icon: null },
];

const HabitList: React.FC<HabitListProps> = ({ habits, onToggle, onProgress, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  
  // Custom Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<HabitType>('boolean');
  const [customTarget, setCustomTarget] = useState(1);
  const [customMaxTarget, setCustomMaxTarget] = useState<string>(''); // string to allow empty
  const [customUnit, setCustomUnit] = useState('');
  const [isRangeGoal, setIsRangeGoal] = useState(false);

  // Interaction State
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Use local time for "today"
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim()) {
      onAdd({
        title: customTitle,
        type: customType,
        target: customType === 'numeric' ? customTarget : 1,
        maxTarget: (customType === 'numeric' && isRangeGoal && customMaxTarget) ? Number(customMaxTarget) : undefined,
        unit: customType === 'numeric' ? customUnit : ''
      });
      resetForm();
    }
  };

  const handleAddPremade = (item: typeof PREMADE_HABITS[0]) => {
    onAdd({
      title: item.title,
      type: item.type,
      target: item.target,
      maxTarget: item.maxTarget,
      unit: item.unit
    });
    resetForm();
  };

  const resetForm = () => {
    setCustomTitle('');
    setCustomType('boolean');
    setCustomTarget(1);
    setCustomMaxTarget('');
    setCustomUnit('');
    setIsRangeGoal(false);
    setIsModalOpen(false);
    setActiveTab('premade');
  };

  const handleNumericSubmit = (habit: Habit) => {
    const val = parseFloat(inputValues[habit.id] || '0');
    if (!isNaN(val) && val > 0) {
      onProgress(habit.id, val);
      setInputValues({ ...inputValues, [habit.id]: '' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-earth-200 dark:border-stone-800 transition-colors duration-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-nature-900 dark:text-stone-100">Daily Rituals</h3>
          <div className="bg-nature-100 dark:bg-nature-900/40 text-nature-700 dark:text-nature-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {habits.filter(h => h.completedDates.includes(today)).length}/{habits.length} Done
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {habits.map((habit) => {
            const isCompleted = habit.completedDates.includes(today);
            const currentProgress = habit.progress[today] || 0;
            
            // Calculate progress percentage
            let progressPercent = 0;
            let isOverLimit = false;

            if (habit.type === 'numeric') {
               progressPercent = Math.min(100, (currentProgress / habit.target) * 100);
               if (habit.maxTarget && currentProgress > habit.maxTarget) {
                 isOverLimit = true;
               }
            }

            // Determine colors based on state
            let progressBarColor = 'bg-nature-200 dark:bg-nature-800';
            if (isOverLimit) progressBarColor = 'bg-red-400 dark:bg-red-800';
            else if (isCompleted) progressBarColor = 'bg-nature-400 dark:bg-nature-600';

            return (
              <div 
                key={habit.id} 
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border ${
                  isCompleted 
                    ? 'bg-nature-50 dark:bg-nature-900/20 border-nature-200 dark:border-nature-800 shadow-sm' 
                    : isOverLimit
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                      : 'bg-white dark:bg-stone-800 border-earth-100 dark:border-stone-700 hover:border-nature-300 dark:hover:border-nature-700 hover:shadow-md'
                }`}
              >
                {/* Numeric Progress Bar Background */}
                {habit.type === 'numeric' && !isCompleted && !isOverLimit && (
                  <div 
                    className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${progressBarColor}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                )}

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Checkbox / Status Indicator */}
                    <button
                      onClick={() => habit.type === 'boolean' ? onToggle(habit.id) : null}
                      disabled={habit.type === 'numeric'}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-nature-500 border-nature-500 text-white scale-110'
                          : isOverLimit
                            ? 'bg-red-100 border-red-300 text-red-500'
                            : habit.type === 'numeric' 
                              ? 'border-nature-200 dark:border-stone-600 bg-nature-50 dark:bg-stone-700 text-nature-300' 
                              : 'border-gray-300 dark:border-stone-600 text-transparent hover:border-nature-400'
                      }`}
                    >
                      {habit.type === 'numeric' && !isCompleted ? (
                         isOverLimit ? <X size={16} strokeWidth={4} /> :
                        <span className="text-[10px] font-bold">{Math.round(progressPercent)}%</span>
                      ) : (
                         isOverLimit ? <X size={16} strokeWidth={4} /> :
                        <Check size={16} strokeWidth={4} />
                      )}
                    </button>

                    <div className="flex flex-col w-full">
                      <div className="flex justify-between items-center pr-2">
                        <span className={`font-semibold text-lg transition-colors ${
                          isCompleted 
                            ? 'text-nature-900 dark:text-nature-300 line-through opacity-60' 
                            : isOverLimit
                              ? 'text-red-800 dark:text-red-300'
                              : 'text-gray-800 dark:text-stone-200'
                        }`}>
                          {habit.title}
                        </span>
                        {/* Streak */}
                        {habit.streak > 0 && !isOverLimit && (
                           <span className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                             <Flame size={12} fill="currentColor" /> {habit.streak}
                           </span>
                        )}
                        {isOverLimit && (
                           <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                             Over Limit
                           </span>
                        )}
                      </div>

                      {/* Numeric Input Area */}
                      {habit.type === 'numeric' && !isCompleted && !isOverLimit && (
                        <div className="mt-2 flex items-center gap-2">
                           <div className="text-xs text-gray-500 dark:text-stone-400 font-mono">
                             {currentProgress} / {habit.maxTarget ? `${habit.target}-${habit.maxTarget}` : habit.target} {habit.unit}
                           </div>
                           
                           <div className="flex-1" />
                           
                           {/* Input Group */}
                           <div className="flex items-center gap-1 bg-earth-50 dark:bg-stone-900 border border-earth-200 dark:border-stone-600 rounded-lg p-0.5 pl-2 transition-all focus-within:border-nature-400 focus-within:ring-1 focus-within:ring-nature-200">
                             {/* Numeric Input */}
                             <input 
                               type="number" 
                               placeholder="Add..."
                               className="w-16 text-sm bg-transparent border-none focus:outline-none text-stone-900 dark:text-stone-100"
                               value={inputValues[habit.id] || ''}
                               onChange={(e) => setInputValues({...inputValues, [habit.id]: e.target.value})}
                               onKeyDown={(e) => e.key === 'Enter' && handleNumericSubmit(habit)}
                             />
                             
                             {/* Submit Button */}
                             <button 
                                onClick={() => handleNumericSubmit(habit)}
                                className="p-1 bg-white dark:bg-stone-700 text-nature-700 dark:text-stone-200 rounded-md hover:bg-nature-100 dark:hover:bg-stone-600 shadow-sm"
                             >
                                <Plus size={14} />
                             </button>
                           </div>
                        </div>
                      )}
                      
                      {habit.type === 'numeric' && isCompleted && (
                          <div className="text-xs text-nature-600 dark:text-nature-400 mt-1 font-medium">
                            Goal Reached! ({currentProgress} {habit.unit})
                          </div>
                      )}
                      {habit.type === 'numeric' && isOverLimit && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> Limit exceeded ({currentProgress} / {habit.maxTarget})
                          </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => onDelete(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {habits.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-stone-600">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No habits yet. Plant a seed by adding one!</p>
            </div>
          )}
        </div>

        {/* Add Habit Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 bg-earth-50 dark:bg-stone-800 border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-400 dark:text-stone-500 rounded-2xl flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-stone-700 hover:border-nature-300 hover:text-nature-600 dark:hover:text-nature-400 transition-all font-bold"
        >
          <Plus size={20} /> Add New Habit
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-grow items-center">
            <div className="p-6 border-b border-earth-100 dark:border-stone-800 flex justify-between items-center bg-earth-50 dark:bg-stone-800">
              <h3 className="text-xl font-bold text-earth-900 dark:text-stone-100">Plant a New Habit</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-stone-300">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-earth-50 dark:bg-stone-800">
              <button 
                onClick={() => setActiveTab('premade')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === 'premade' 
                    ? 'bg-white dark:bg-stone-700 text-nature-700 dark:text-stone-100 shadow-sm' 
                    : 'text-gray-500 dark:text-stone-500 hover:bg-earth-100 dark:hover:bg-stone-700'
                }`}
              >
                Ideas
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === 'custom' 
                    ? 'bg-white dark:bg-stone-700 text-nature-700 dark:text-stone-100 shadow-sm' 
                    : 'text-gray-500 dark:text-stone-500 hover:bg-earth-100 dark:hover:bg-stone-700'
                }`}
              >
                Custom
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'premade' ? (
                <div className="grid grid-cols-1 gap-3">
                  {PREMADE_HABITS.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleAddPremade(item)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-earth-100 dark:border-stone-700 hover:border-nature-300 dark:hover:border-nature-600 hover:bg-nature-50 dark:hover:bg-stone-800 text-left transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-earth-100 dark:bg-stone-800 text-earth-600 dark:text-stone-400 flex items-center justify-center group-hover:bg-nature-200 dark:group-hover:bg-nature-900 group-hover:text-nature-700 dark:group-hover:text-nature-300 transition-colors">
                        {item.icon || <Check size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-stone-200">{item.title}</div>
                        {item.type === 'numeric' && (
                          <div className="text-xs text-gray-500 dark:text-stone-500">
                             Target: {item.target} {item.maxTarget && `- ${item.maxTarget}`} {item.unit}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-300 dark:text-stone-600 group-hover:text-nature-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleAddCustom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-1">Habit Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Morning Jog"
                      className="w-full p-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-nature-400 focus:outline-none"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-1">Type</label>
                      <select 
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as HabitType)}
                        className="w-full p-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-nature-400 focus:outline-none"
                      >
                        <option value="boolean">Simple (Done/Not Done)</option>
                        <option value="numeric">Numeric Goal</option>
                      </select>
                    </div>
                  </div>

                  {customType === 'numeric' && (
                    <div className="animate-grow origin-top space-y-3">
                      <div className="flex items-center gap-2">
                        <input 
                           type="checkbox" 
                           id="rangeCheck" 
                           checked={isRangeGoal}
                           onChange={(e) => setIsRangeGoal(e.target.checked)}
                           className="w-4 h-4 text-nature-600 rounded focus:ring-nature-500"
                        />
                        <label htmlFor="rangeCheck" className="text-sm font-medium text-gray-700 dark:text-stone-300">Set as a range (Min/Max)</label>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                             {isRangeGoal ? 'Minimum' : 'Target'}
                          </label>
                          <input 
                            type="number" 
                            className="w-full p-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-nature-400 focus:outline-none"
                            value={customTarget}
                            onChange={(e) => setCustomTarget(Number(e.target.value))}
                          />
                        </div>
                        
                        {isRangeGoal && (
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                                Maximum
                              </label>
                              <input 
                                type="number" 
                                className="w-full p-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-nature-400 focus:outline-none"
                                value={customMaxTarget}
                                onChange={(e) => setCustomMaxTarget(e.target.value)}
                              />
                            </div>
                        )}

                        <div className="w-1/3">
                          <label className="block text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-1">Unit</label>
                          <input 
                            type="text" 
                            placeholder="min"
                            className="w-full p-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-nature-400 focus:outline-none"
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={!customTitle.trim()}
                    className="w-full py-3 mt-4 bg-nature-600 text-white rounded-xl font-bold hover:bg-nature-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Habit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitList;