// Database Types
export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  accountId: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Habit {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly";
  streak_count: number;
  last_completed?: string;
  created_at: string;
}

export interface HabitCompletion {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  habit_id: string;
  completed_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  total_completions: number;
  longest_streak: number;
  current_streaks: number;
  rank: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreateHabit: undefined;
  EditHabit: { habitId: string };
  HabitDetail: { habitId: string };
};

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type StackParamList = {
  HabitList: undefined;
  CreateHabit: undefined;
  EditHabit: { habitId: string };
  HabitDetail: { habitId: string };
};

// Store Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, avatar?: string) => Promise<void>;
}

export interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  createHabit: (
    habit: Omit<
      Habit,
      "$id" | "$createdAt" | "$updatedAt" | "user_id" | "streak_count"
    >
  ) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabit: (habitId: string) => Promise<void>;
  fetchTodayCompletions: () => Promise<void>;
}

export interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  fetchLeaderboard: () => Promise<void>;
}

// Component Props Types
export interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface StreakBadgeProps {
  streak: number;
  size?: "small" | "medium" | "large";
}

export interface CreateHabitFormData {
  title: string;
  description: string;
  frequency: "daily" | "weekly";
}
