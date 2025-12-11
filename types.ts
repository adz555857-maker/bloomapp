export type HabitType = 'boolean' | 'numeric';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  target: number; // Minimum target for range, or target for single value
  maxTarget?: number; // Optional maximum cap (e.g. for calories)
  unit: string;   // e.g., 'kcal', 'cups', 'min'
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  streak: number;
  progress: Record<string, number>; // Map date "YYYY-MM-DD" to value
}

export interface FoodLog {
  id: string;
  name: string;
  calories: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export enum PlantStage {
  SEED = 'SEED',
  SPROUT = 'SPROUT',
  SAPLING = 'SAPLING',
  TREE = 'TREE',
  FLOWERING = 'FLOWERING',
  MYTHICAL = 'MYTHICAL'
}

export enum PlantHealth {
  THRIVING = 'THRIVING', // Logged in today/yesterday
  WILTING = 'WILTING',   // Missed 1 day
  WITHERED = 'WITHERED', // Missed 2 days
  DEAD = 'DEAD'          // Missed 3+ days
}

export interface PlantState {
  stage: PlantStage;
  health: PlantHealth;
  exp: number; // Experience points to next stage
  level: number;
  lastInteractionDate: string; // ISO date YYYY-MM-DD
}

export interface FriendProfile {
  name: string;
  friendCode: string;
  plant: PlantState;
  habits: Habit[]; // Snapshot of their habits for display
}

export interface Party {
  id: string;
  name: string;
  code: string;
  members: FriendProfile[];
  plant: PlantState; // The shared party plant
}

export interface UserState {
  name: string;
  friendCode: string;
  friends: FriendProfile[]; // List of added friends
  parties: Party[]; // List of parties user is in
  habits: Habit[];
  foodLogs: FoodLog[]; // Log of food items
  plant: PlantState;
  onboardingComplete: boolean;
  theme: 'light' | 'dark';
  lastActiveTab: 'home' | 'calendar' | 'social' | 'food' | 'donation';
}

export const XP_THRESHOLDS: Record<PlantStage, number> = {
  [PlantStage.SEED]: 50,
  [PlantStage.SPROUT]: 150,
  [PlantStage.SAPLING]: 350,
  [PlantStage.TREE]: 700,
  [PlantStage.FLOWERING]: 1200,
  [PlantStage.MYTHICAL]: Infinity,
};

export const MAX_HEALTH_DAYS = 3;