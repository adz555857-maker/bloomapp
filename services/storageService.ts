
import { UserState, PlantStage, PlantHealth, FriendProfile, Party } from '../types';

const STORAGE_KEY = 'bloom_app_data';

const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateFriendCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const INITIAL_STATE: UserState = {
  name: '',
  friendCode: '',
  friends: [],
  parties: [],
  foodLogs: [],
  onboardingComplete: false,
  habits: [],
  theme: 'light',
  lastActiveTab: 'home',
  plant: {
    stage: PlantStage.SEED,
    health: PlantHealth.THRIVING,
    exp: 0,
    level: 1,
    lastInteractionDate: getLocalToday(),
  },
};

export const loadState = (): UserState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Migration: Ensure all habits have new fields
      if (parsed.habits) {
        parsed.habits = parsed.habits.map((h: any) => ({
          ...h,
          type: h.type || 'boolean',
          target: h.target || 1,
          maxTarget: h.maxTarget || undefined,
          unit: h.unit || '',
          progress: h.progress || {},
        }));
      }

      // Migration: Ensure theme exists
      if (!parsed.theme) {
        parsed.theme = 'light';
      }

      // Migration: Ensure lastActiveTab exists
      if (!parsed.lastActiveTab) {
        parsed.lastActiveTab = 'home';
      }

      // Migration: Ensure friendCode and friends list exist
      if (!parsed.friendCode) {
        parsed.friendCode = generateFriendCode();
      }
      if (!parsed.friends) {
        parsed.friends = [];
      }

      // Migration: Ensure parties exist
      if (!parsed.parties) {
        parsed.parties = [];
      }

      // Migration: Ensure foodLogs exist
      if (!parsed.foodLogs) {
        parsed.foodLogs = [];
      }
      
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  // If no saved state, ensure we generate a code for the initial state
  return { ...INITIAL_STATE, friendCode: generateFriendCode() };
};

export const saveState = (state: UserState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

// --- MOCK NETWORK FOR SOCIAL FEATURES ---

const MOCK_FRIENDS: FriendProfile[] = [
  {
    name: "Rose",
    friendCode: "ROSE-8821",
    plant: { stage: PlantStage.FLOWERING, health: PlantHealth.THRIVING, exp: 900, level: 12, lastInteractionDate: getLocalToday() },
    habits: [
      { id: 'm1', title: 'Morning Yoga', type: 'boolean', target: 1, unit: '', completedDates: [getLocalToday()], streak: 5, progress: {} },
      { id: 'm2', title: 'Water', type: 'numeric', target: 8, unit: 'cups', completedDates: [], streak: 2, progress: {[getLocalToday()]: 4} }
    ]
  },
  {
    name: "Sage",
    friendCode: "SAGE-9912",
    plant: { stage: PlantStage.TREE, health: PlantHealth.WILTING, exp: 600, level: 8, lastInteractionDate: '2023-01-01' },
    habits: [
      { id: 'm3', title: 'Read Book', type: 'numeric', target: 30, unit: 'mins', completedDates: [], streak: 0, progress: {} },
    ]
  },
  {
    name: "Basil",
    friendCode: "HERB-4040",
    plant: { stage: PlantStage.SPROUT, health: PlantHealth.THRIVING, exp: 120, level: 2, lastInteractionDate: getLocalToday() },
    habits: [
      { id: 'm4', title: 'Code', type: 'boolean', target: 1, unit: '', completedDates: [getLocalToday()], streak: 1, progress: {} },
    ]
  }
];

// Mock Parties
const MOCK_PARTIES: Party[] = [
  {
    id: 'p1',
    name: 'Wellness Warriors',
    code: 'WELL-2024',
    members: [MOCK_FRIENDS[0], MOCK_FRIENDS[1]],
    plant: { stage: PlantStage.TREE, health: PlantHealth.THRIVING, exp: 800, level: 5, lastInteractionDate: getLocalToday() }
  }
];

export const mockFetchFriend = async (code: string): Promise<FriendProfile | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Normalize code
  const normalized = code.toUpperCase().trim();
  
  // Check mock database
  const friend = MOCK_FRIENDS.find(f => f.friendCode === normalized || f.friendCode.split('-')[1] === normalized);
  
  if (friend) return friend;
  return null;
};

export const mockCreateParty = async (name: string, owner: FriendProfile): Promise<Party> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        id: Date.now().toString(),
        name: name,
        code: `GRP-${Math.floor(Math.random() * 1000)}`,
        members: [owner],
        plant: { stage: PlantStage.SEED, health: PlantHealth.THRIVING, exp: 0, level: 1, lastInteractionDate: getLocalToday() }
    };
};

export const mockJoinParty = async (code: string, user: FriendProfile): Promise<Party | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalized = code.toUpperCase().trim();
    const party = MOCK_PARTIES.find(p => p.code === normalized);
    
    if (party) {
        // Return party with user added
        return {
            ...party,
            members: [...party.members, user]
        };
    }
    return null;
};