

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  User, 
  Settings, 
  RefreshCcw, 
  AlertCircle,
  X,
  Moon,
  Home,
  Calendar as CalendarIcon,
  Users,
  Utensils,
  Heart
} from 'lucide-react';
import Plant from './components/Plant';
import HabitList from './components/HabitList';
import CalendarView from './components/CalendarView';
import SocialView from './components/SocialView';
import FoodView from './components/FoodView';
import DonationView from './components/DonationView';
import { 
  UserState, 
  Habit, 
  PlantStage, 
  PlantHealth, 
  XP_THRESHOLDS,
  FriendProfile,
  FoodLog
} from './types';
import { loadState, saveState, mockCreateParty, mockJoinParty } from './services/storageService';
import { getPlantMessage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [onboardingName, setOnboardingName] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'social' | 'food' | 'donation'>('home');

  // Helper for consistent local date strings YYYY-MM-DD
  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Centralized State Updater
   * Ensures that when the User's core data (Name, Plant, Habits) updates,
   * it is also synchronized to their profile within any Parties they belong to.
   * This ensures data consistency across the app.
   */
  const syncAndSetState = (newState: UserState) => {
    let updatedParties = newState.parties;
    
    // Only perform sync if we have parties and something relevant might have changed
    if (updatedParties.length > 0) {
       updatedParties = updatedParties.map(p => ({
         ...p,
         members: p.members.map(m => {
           // If this member is ME, update with my latest stats
           if (m.friendCode === newState.friendCode) {
             return {
               ...m,
               name: newState.name,
               plant: newState.plant,
               habits: newState.habits
             };
           }
           return m;
         })
       }));
    }

    const finalState = { ...newState, parties: updatedParties };
    setState(finalState);
  };

  // Initial Load & Daily Logic
  useEffect(() => {
    const loaded = loadState();
    const today = getToday();
    
    // Check for missed days
    const lastLogin = new Date(loaded.plant.lastInteractionDate);
    const now = new Date();
    // Reset hours to compare dates properly without time interference
    const lastLoginDateOnly = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = Math.abs(nowDateOnly.getTime() - lastLoginDateOnly.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newHealth = loaded.plant.health;
    
    if (diffDays === 1) {
      // 1 day passed means yesterday was last login. That is fine if they log in today.
    } 
    
    // Logic for missed streak
    if (diffDays > 1) {
       if (diffDays === 2) newHealth = PlantHealth.WILTING;
       else if (diffDays === 3) newHealth = PlantHealth.WITHERED;
       else if (diffDays >= 4) newHealth = PlantHealth.DEAD;
    }

    const newState = {
      ...loaded,
      plant: {
        ...loaded.plant,
        health: newHealth,
        lastInteractionDate: today // Update to today's local date
      }
    };
    
    setState(newState); // Initial load doesn't need sync, just set
    if (newState.lastActiveTab) {
      setActiveTab(newState.lastActiveTab);
    }

    setLoading(false);
    
    // Apply Theme
    if (newState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    fetchMotivation(newState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on change
  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const handleTabChange = (tab: 'home' | 'calendar' | 'social' | 'food' | 'donation') => {
    setActiveTab(tab);
    if (state) {
      syncAndSetState({ ...state, lastActiveTab: tab });
    }
  };

  const toggleTheme = () => {
    if (!state) return;
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    syncAndSetState({ ...state, theme: newTheme });
  };

  const fetchMotivation = async (currentState: UserState) => {
    const msg = await getPlantMessage(currentState.plant, currentState.habits, currentState.name);
    setMotivation(msg);
  };

  const calculatePlantProgress = (plantExp: number, stage: PlantStage) => {
    const threshold = XP_THRESHOLDS[stage];
    if (threshold === Infinity) return 100;
    
    const stages = Object.values(PlantStage);
    const currentIndex = stages.indexOf(stage);
    const prevThreshold = currentIndex > 0 ? XP_THRESHOLDS[stages[currentIndex - 1]] : 0;
    
    const range = threshold - prevThreshold;
    const currentInStage = plantExp - prevThreshold;
    
    return Math.min(100, Math.max(0, (currentInStage / range) * 100));
  };

  const getNextStage = (current: PlantStage): PlantStage => {
    const stages = Object.values(PlantStage);
    const idx = stages.indexOf(current);
    return stages[idx + 1] || PlantStage.MYTHICAL;
  };

  // Generalized function to handle habit completion logic
  const checkCompletionAndReward = (newState: UserState, habitId: string, justCompleted: boolean) => {
    let { exp, stage, health } = newState.plant;

    if (justCompleted) {
        // Gaining XP
        exp += 10;
        // Healing effect
        if (health === PlantHealth.WILTING) health = PlantHealth.THRIVING;
        if (health === PlantHealth.WITHERED) health = PlantHealth.WILTING;
    } else {
        // Removing XP (Undo)
        exp = Math.max(0, exp - 10);
    }
    
    // Check growth
    if (exp >= XP_THRESHOLDS[stage]) {
        stage = getNextStage(stage);
    }

    const finalState = {
      ...newState,
      plant: { ...newState.plant, exp, stage, health }
    };

    syncAndSetState(finalState);
    
    // Check if all are done for motivation
    const today = getToday();
    const allDone = finalState.habits.length > 0 && finalState.habits.every(h => h.completedDates.includes(today));
    if (allDone && justCompleted) {
       fetchMotivation(finalState);
    }
  };

  const handleHabitToggle = (id: string) => {
    if (!state) return;
    const today = getToday();
    
    let wasJustCompleted = false;

    const updatedHabits = state.habits.map(h => {
      if (h.id === id && h.type === 'boolean') {
        const isCompletedNow = !h.completedDates.includes(today);
        wasJustCompleted = isCompletedNow;
        
        let newDates = h.completedDates;
        let newStreak = h.streak;

        if (isCompletedNow) {
            newDates = [...h.completedDates, today];
            newStreak += 1;
        } else {
            newDates = h.completedDates.filter(d => d !== today);
            newStreak = Math.max(0, newStreak - 1);
        }

        return { ...h, completedDates: newDates, streak: newStreak };
      }
      return h;
    });

    const tempState = { ...state, habits: updatedHabits };
    checkCompletionAndReward(tempState, id, wasJustCompleted);
  };

  const handleHabitProgress = (id: string, value: number) => {
    if (!state) return;
    const today = getToday();
    
    let wasJustCompleted = false;
    let wasPreviouslyCompleted = false;

    const updatedHabits = state.habits.map(h => {
      if (h.id === id && h.type === 'numeric') {
        const currentProgress = h.progress[today] || 0;
        const newProgress = currentProgress + value;
        const newProgressMap = { ...h.progress, [today]: newProgress };

        // Logic for completion:
        // 1. Must be >= target (min)
        // 2. If maxTarget exists, must be <= maxTarget
        const aboveMin = newProgress >= h.target;
        const belowMax = h.maxTarget ? newProgress <= h.maxTarget : true;
        const targetMet = aboveMin && belowMax;

        wasPreviouslyCompleted = h.completedDates.includes(today);
        wasJustCompleted = targetMet && !wasPreviouslyCompleted;
        const wasJustUncompleted = !targetMet && wasPreviouslyCompleted;

        // If newly met or unmet, update completion dates
        let newDates = h.completedDates;
        let newStreak = h.streak;

        if (wasJustCompleted) {
            newDates = [...h.completedDates, today];
            newStreak += 1;
        } else if (wasJustUncompleted) {
             newDates = h.completedDates.filter(d => d !== today);
             newStreak = Math.max(0, newStreak - 1);
        }

        return { 
            ...h, 
            progress: newProgressMap, 
            completedDates: newDates, 
            streak: newStreak 
        };
      }
      return h;
    });

    const tempState = { ...state, habits: updatedHabits };
    
    if (wasJustCompleted) {
        checkCompletionAndReward(tempState, id, true);
    } else if (!wasPreviouslyCompleted && !wasJustCompleted) {
        // Just updating progress
        syncAndSetState(tempState);
    } else if (wasPreviouslyCompleted && !wasJustCompleted) {
        // It became uncompleted (e.g. went over limit)
        checkCompletionAndReward(tempState, id, false);
    } else {
      syncAndSetState(tempState);
    }
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'progress'>) => {
    if (!state) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: habitData.title,
      type: habitData.type,
      target: habitData.target,
      maxTarget: habitData.maxTarget,
      unit: habitData.unit,
      completedDates: [],
      streak: 0,
      progress: {}
    };
    syncAndSetState({ ...state, habits: [...state.habits, newHabit] });
  };

  const deleteHabit = (id: string) => {
    if (!state) return;
    syncAndSetState({ ...state, habits: state.habits.filter(h => h.id !== id) });
  };

  // Handle adding a food log and potentially updating a habit
  const handleAddFoodLog = (logData: Omit<FoodLog, 'id' | 'timestamp'>) => {
    if (!state) return;

    const newLog: FoodLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...logData
    };

    // Update state with new log
    const newStateWithLog = {
      ...state,
      foodLogs: [newLog, ...state.foodLogs]
    };
    
    // Automatically find a calorie habit to update
    const calorieHabit = state.habits.find(h => 
        h.type === 'numeric' && (h.unit.toLowerCase() === 'kcal' || h.title.toLowerCase().includes('calorie'))
    );

    if (calorieHabit) {
        const today = getToday();
        const h = calorieHabit;
        const currentProgress = h.progress[today] || 0;
        const newProgress = currentProgress + logData.calories;
        const newProgressMap = { ...h.progress, [today]: newProgress };

        const aboveMin = newProgress >= h.target;
        const belowMax = h.maxTarget ? newProgress <= h.maxTarget : true;
        const targetMet = aboveMin && belowMax;

        const wasPreviouslyCompleted = h.completedDates.includes(today);
        const wasJustCompleted = targetMet && !wasPreviouslyCompleted;
        const wasJustUncompleted = !targetMet && wasPreviouslyCompleted;

        let newDates = h.completedDates;
        let newStreak = h.streak;

        if (wasJustCompleted) {
            newDates = [...h.completedDates, today];
            newStreak += 1;
        } else if (wasJustUncompleted) {
             newDates = h.completedDates.filter(d => d !== today);
             newStreak = Math.max(0, newStreak - 1);
        }

        const updatedHabit = {
            ...h,
            progress: newProgressMap,
            completedDates: newDates,
            streak: newStreak
        };

        const updatedHabits = newStateWithLog.habits.map(hab => hab.id === h.id ? updatedHabit : hab);
        
        // Final state structure
        const finalState = { ...newStateWithLog, habits: updatedHabits };
        
        // Check rewards
        if (wasJustCompleted) {
            checkCompletionAndReward(finalState, h.id, true);
        } else if (wasJustUncompleted) {
            checkCompletionAndReward(finalState, h.id, false);
        } else {
            syncAndSetState(finalState);
        }
    } else {
        syncAndSetState(newStateWithLog);
    }
  };

  const handleRevive = () => {
    if (!state) return;
    const today = getToday();
    syncAndSetState({
        ...state,
        plant: {
            stage: PlantStage.SEED,
            health: PlantHealth.THRIVING,
            exp: 0,
            level: 1,
            lastInteractionDate: today,
        }
    });
  };

  const handleAddFriend = (friend: FriendProfile) => {
    if(!state) return;
    syncAndSetState({
      ...state,
      friends: [...state.friends, friend]
    });
  };

  const handleCreateParty = (name: string) => {
    if(!state) return;
    const me: FriendProfile = {
        name: state.name,
        friendCode: state.friendCode,
        plant: state.plant,
        habits: state.habits
    };
    mockCreateParty(name, me).then(party => {
        syncAndSetState({
            ...state,
            parties: [...state.parties, party]
        });
    });
  };

  const handleJoinParty = async (code: string): Promise<boolean> => {
    if(!state) return false;
    const me: FriendProfile = {
        name: state.name,
        friendCode: state.friendCode,
        plant: state.plant,
        habits: state.habits
    };
    
    const party = await mockJoinParty(code, me);
    if(party) {
        // Check if already in
        if (state.parties.find(p => p.id === party.id)) return true;

        syncAndSetState({
            ...state,
            parties: [...state.parties, party]
        });
        return true;
    }
    return false;
  };

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingName.trim()) return;
    
    const today = getToday();
    // generate random friend code for new user
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newState: UserState = {
        name: onboardingName,
        friendCode: code,
        friends: [],
        parties: [],
        foodLogs: [],
        onboardingComplete: true,
        habits: [],
        theme: 'light',
        lastActiveTab: 'home',
        plant: {
            stage: PlantStage.SEED,
            health: PlantHealth.THRIVING,
            exp: 0,
            level: 1,
            lastInteractionDate: today,
        }
    };
    syncAndSetState(newState);
    saveState(newState);
    fetchMotivation(newState);
  };

  // --- Rendering ---

  if (loading) {
      return <div className="min-h-screen bg-earth-50 dark:bg-stone-950 flex items-center justify-center text-nature-800 dark:text-nature-400">Sprouting...</div>;
  }

  if (!state || !state.onboardingComplete) {
      return (
          <div className="min-h-screen bg-earth-50 dark:bg-stone-950 flex items-center justify-center p-6 transition-colors duration-500">
              <div className="max-w-md w-full text-center space-y-8">
                  <div className="mx-auto w-32 h-32 bg-nature-100 dark:bg-nature-900/30 rounded-full flex items-center justify-center animate-bounce-slow">
                      <Leaf size={64} className="text-nature-600 dark:text-nature-400" />
                  </div>
                  <div>
                      <h1 className="text-4xl font-extrabold text-nature-900 dark:text-nature-200 mb-2">Welcome to Bloom</h1>
                      <p className="text-earth-800 dark:text-stone-400 text-lg">Let's grow your habits together. First, what should we call you?</p>
                  </div>
                  <form onSubmit={handleOnboarding} className="space-y-4">
                      <input 
                        type="text" 
                        value={onboardingName}
                        onChange={(e) => setOnboardingName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full text-center text-xl p-4 rounded-2xl border-2 border-nature-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white focus:border-nature-500 focus:outline-none"
                        autoFocus
                      />
                      <button type="submit" className="w-full py-4 bg-nature-600 text-white rounded-2xl font-bold text-lg hover:bg-nature-700 transition-colors shadow-lg shadow-nature-200 dark:shadow-none">
                          Start Planting
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  const renderWeeklyStats = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Use consistent local date string for lookup
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const total = state.habits.length;
        const completed = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
        let opacity = 0.1;
        if (total > 0) opacity = 0.2 + (completed / total) * 0.8;
        if (total === 0) opacity = 0.1;

        days.push(
            <div key={dateStr} className="flex flex-col items-center gap-1">
                <div 
                    className="w-8 h-8 rounded-lg transition-all"
                    style={{ backgroundColor: `rgba(22, 163, 74, ${opacity})` }}
                    title={`${dateStr}: ${completed}/${total}`}
                />
                <span className="text-[10px] text-gray-400 font-mono">{d.getDate()}</span>
            </div>
        );
    }
    return <div className="flex justify-between items-end gap-2 px-4 py-4 bg-white/50 dark:bg-stone-900/50 rounded-2xl mb-6 backdrop-blur-sm">{days}</div>;
  };

  const isDead = state.plant.health === PlantHealth.DEAD;
  
  // Find calorie data for Food Tab
  const calorieHabit = state.habits.find(h => 
    h.type === 'numeric' && (h.unit.toLowerCase() === 'kcal' || h.title.toLowerCase().includes('calorie'))
  );
  const today = getToday();
  const todayCalories = calorieHabit ? (calorieHabit.progress[today] || 0) : 0;
  const todayLogs = state.foodLogs.filter(f => f.date === today);

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-stone-950 text-earth-900 dark:text-stone-100 font-sans selection:bg-nature-200 transition-colors duration-500 pb-24">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-10 bg-earth-50/90 dark:bg-stone-950/90 backdrop-blur-md transition-colors duration-500">
        <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-nature-100 dark:bg-nature-900/30 p-2 rounded-xl">
                <Leaf size={24} className="text-nature-700 dark:text-nature-400" />
            </div>
            <span className="font-bold text-xl tracking-tight text-nature-900 dark:text-stone-100 hidden sm:block">Bloom</span>
        </div>
        
        {/* Spacer */}
        <div className="flex-1" />

        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-earth-200 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-700 dark:text-stone-300 flex-shrink-0">
            <Settings size={24} />
        </button>
      </header>

      <main className="max-w-lg mx-auto px-6">
        
        {activeTab === 'home' && (
          <>
            {/* Plant Section */}
            <section className="relative mb-8">
                <div className="absolute top-0 right-0 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono text-nature-800 dark:text-nature-300 border border-nature-100 dark:border-stone-700">
                    Lvl {state.plant.level}
                </div>
                
                {/* Motivation Bubble */}
                <div className="mb-4 relative">
                    <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-earth-100 dark:border-stone-700 text-sm text-earth-800 dark:text-stone-300 leading-relaxed italic transition-colors duration-300">
                        "{motivation || "Let's grow together!"}"
                    </div>
                </div>

                <Plant stage={state.plant.stage} health={state.plant.health} />
                
                {/* Progress Bar */}
                {!isDead && (
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-nature-800 dark:text-nature-300 uppercase tracking-wider">
                            <span>Experience</span>
                            <span>{Math.round(calculatePlantProgress(state.plant.exp, state.plant.stage))}% to next stage</span>
                        </div>
                        <div className="h-3 bg-earth-200 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-nature-400 to-nature-600 transition-all duration-1000 ease-out"
                                style={{ width: `${calculatePlantProgress(state.plant.exp, state.plant.stage)}%` }}
                            />
                        </div>
                    </div>
                )}

                {isDead && (
                    <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <h3 className="font-bold text-red-900 dark:text-red-200 mb-1">Oh no! The plant withered away.</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">Consistency is key. Plant a new seed and try again?</p>
                        <button 
                            onClick={handleRevive}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-xl font-bold transition-colors"
                        >
                            <RefreshCcw size={18} /> Replant Garden
                        </button>
                    </div>
                )}
            </section>

            {renderWeeklyStats()}

            {/* Habits Section */}
            <HabitList 
                habits={state.habits} 
                onToggle={handleHabitToggle}
                onProgress={handleHabitProgress}
                onAdd={addHabit}
                onDelete={deleteHabit}
            />
          </>
        )}

        {activeTab === 'calendar' && (
          <CalendarView habits={state.habits} />
        )}

        {activeTab === 'food' && (
          <FoodView 
            foodLogs={todayLogs} 
            dailyCalories={todayCalories}
            calorieGoal={calorieHabit ? { min: calorieHabit.target, max: calorieHabit.maxTarget } : undefined}
            onAddLog={handleAddFoodLog}
          />
        )}

        {activeTab === 'social' && (
          <SocialView 
            userName={state.name} 
            myFriendCode={state.friendCode} 
            friends={state.friends}
            parties={state.parties}
            onAddFriend={handleAddFriend}
            onCreateParty={handleCreateParty}
            onJoinParty={handleJoinParty}
          />
        )}

        {activeTab === 'donation' && (
            <DonationView />
        )}

      </main>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-earth-100 dark:border-stone-800 p-4 safe-area-bottom z-30 shadow-lg">
         <div className="flex justify-between items-center max-w-lg mx-auto">
            <button 
              onClick={() => handleTabChange('home')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-nature-600 dark:text-nature-400 scale-105' : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'}`}
            >
                <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Garden</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('calendar')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-nature-600 dark:text-nature-400 scale-105' : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'}`}
            >
                <CalendarIcon size={24} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
            </button>

            <button 
              onClick={() => handleTabChange('food')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'food' ? 'text-nature-600 dark:text-nature-400 scale-105' : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'}`}
            >
                <Utensils size={24} strokeWidth={activeTab === 'food' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Food</span>
            </button>

            <button 
              onClick={() => handleTabChange('social')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'social' ? 'text-nature-600 dark:text-nature-400 scale-105' : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'}`}
            >
                <Users size={24} strokeWidth={activeTab === 'social' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Social</span>
            </button>

            <button 
              onClick={() => handleTabChange('donation')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'donation' ? 'text-nature-600 dark:text-nature-400 scale-105' : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'}`}
            >
                <Heart size={24} strokeWidth={activeTab === 'donation' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Donate</span>
            </button>
         </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl overflow-hidden animate-grow">
                <div className="p-6 border-b border-earth-100 dark:border-stone-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-earth-900 dark:text-stone-100">Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-earth-50 dark:bg-stone-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-stone-800 rounded-lg text-earth-800 dark:text-stone-200 shadow-sm">
                                {state.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                            </div>
                            <span className="font-bold text-earth-900 dark:text-stone-200">
                                {state.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex ${state.theme === 'dark' ? 'bg-nature-500 justify-end' : 'bg-gray-300 justify-start'}`}
                        >
                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-earth-100 dark:border-stone-700 text-center">
                        <p className="text-xs text-gray-400 mb-2">Bloom v1.0.0</p>
                        <p className="text-xs text-gray-300 dark:text-stone-600">Cultivating habits, one day at a time.</p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;