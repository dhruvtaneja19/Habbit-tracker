import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appwriteService } from "./appwrite";
import { Habit, HabitCompletion } from "../types/database.types";

interface HabitStore {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;

  // Actions
  setHabits: (habits: Habit[]) => void;
  setCompletions: (completions: HabitCompletion[]) => void;
  setLoading: (loading: boolean) => void;

  // Async actions
  fetchHabits: (userId: string) => Promise<void>;
  createHabit: (
    userId: string,
    habit: Omit<
      Habit,
      "$id" | "$createdAt" | "$updatedAt" | "user_id" | "streak_count"
    >
  ) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabit: (userId: string, habitId: string) => Promise<void>;
  fetchTodayCompletions: (userId: string) => Promise<void>;

  // Local storage
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEYS = {
  HABITS: "@habittracker_habits",
  COMPLETIONS: "@habittracker_completions",
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  completions: [],
  isLoading: false,

  setHabits: (habits) => set({ habits }),
  setCompletions: (completions) => set({ completions }),
  setLoading: (isLoading) => set({ isLoading }),

  loadFromStorage: async () => {
    try {
      const [habitsData, completionsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HABITS),
        AsyncStorage.getItem(STORAGE_KEYS.COMPLETIONS),
      ]);

      if (habitsData) {
        const habits = JSON.parse(habitsData);
        set({ habits });
      }

      if (completionsData) {
        const completions = JSON.parse(completionsData);
        set({ completions });
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
    }
  },

  saveToStorage: async () => {
    try {
      const { habits, completions } = get();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)),
        AsyncStorage.setItem(
          STORAGE_KEYS.COMPLETIONS,
          JSON.stringify(completions)
        ),
      ]);
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  },

  fetchHabits: async (userId: string) => {
    try {
      set({ isLoading: true });

      // First load from storage for offline support
      await get().loadFromStorage();

      // Then fetch from Appwrite
      try {
        const habits = await appwriteService.getHabits(userId);
        const typedHabits = habits as unknown as Habit[];
        set({ habits: typedHabits });
        await get().saveToStorage();
      } catch (error) {
        console.log("Failed to fetch from Appwrite, using cached data");
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createHabit: async (userId: string, habitData) => {
    try {
      set({ isLoading: true });

      const newHabit = {
        ...habitData,
        user_id: userId,
        streak_count: 0,
      };

      // Optimistically update local state
      const tempId = `temp_${Date.now()}`;
      const tempHabit: Habit = {
        $id: tempId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...newHabit,
      };

      const currentHabits = get().habits;
      set({ habits: [...currentHabits, tempHabit] });
      await get().saveToStorage();

      try {
        // Create in Appwrite
        const createdHabit = await appwriteService.createHabit(
          userId,
          newHabit
        );
        const typedHabit = createdHabit as unknown as Habit;

        // Replace temp habit with real habit
        const updatedHabits = currentHabits.filter((h) => h.$id !== tempId);
        set({ habits: [...updatedHabits, typedHabit] });
        await get().saveToStorage();
      } catch (error) {
        console.error("Failed to create habit in Appwrite:", error);
        // Keep the temp habit for now, it will sync later
      }
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateHabit: async (habitId: string, updates) => {
    try {
      set({ isLoading: true });

      // Optimistically update local state
      const currentHabits = get().habits;
      const updatedHabits = currentHabits.map((habit) =>
        habit.$id === habitId ? { ...habit, ...updates } : habit
      );
      set({ habits: updatedHabits });
      await get().saveToStorage();

      try {
        // Update in Appwrite
        await appwriteService.updateHabit(habitId, updates);
      } catch (error) {
        console.error("Failed to update habit in Appwrite:", error);
        // Revert changes if Appwrite update fails
        set({ habits: currentHabits });
        await get().saveToStorage();
        throw error;
      }
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteHabit: async (habitId: string) => {
    try {
      set({ isLoading: true });

      // Optimistically update local state
      const currentHabits = get().habits;
      const updatedHabits = currentHabits.filter(
        (habit) => habit.$id !== habitId
      );
      set({ habits: updatedHabits });
      await get().saveToStorage();

      try {
        // Delete from Appwrite
        await appwriteService.deleteHabit(habitId);
      } catch (error) {
        console.error("Failed to delete habit from Appwrite:", error);
        // Revert changes if Appwrite delete fails
        set({ habits: currentHabits });
        await get().saveToStorage();
        throw error;
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  completeHabit: async (userId: string, habitId: string) => {
    try {
      const currentHabits = get().habits;
      const habit = currentHabits.find((h) => h.$id === habitId);

      if (!habit) throw new Error("Habit not found");

      // Check if already completed today
      const today = new Date().toDateString();
      const currentCompletions = get().completions;
      const todayCompletion = currentCompletions.find(
        (c) =>
          c.habit_id === habitId &&
          new Date(c.completed_at).toDateString() === today
      );

      if (todayCompletion) {
        throw new Error("Habit already completed today");
      }

      // Create completion locally first
      const newCompletion: HabitCompletion = {
        $id: `temp_${Date.now()}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        user_id: userId,
        habit_id: habitId,
        completed_at: new Date().toISOString(),
      };

      // Update habit streak locally
      const updatedHabit = {
        ...habit,
        streak_count: habit.streak_count + 1,
        last_completed: new Date().toISOString(),
      };

      // Optimistically update local state
      const updatedHabits = currentHabits.map((h) =>
        h.$id === habitId ? updatedHabit : h
      );
      const updatedCompletions = [...currentCompletions, newCompletion];

      set({
        habits: updatedHabits,
        completions: updatedCompletions,
      });
      await get().saveToStorage();

      // Try to sync with Appwrite
      try {
        console.log("Attempting to sync completion with Appwrite...");
        const createdCompletion = await appwriteService.completeHabit(
          userId,
          habitId
        );

        // Replace temp completion with real one
        const finalCompletions = updatedCompletions.map((c) =>
          c.$id === newCompletion.$id
            ? (createdCompletion as unknown as HabitCompletion)
            : c
        );

        set({ completions: finalCompletions });
        await get().saveToStorage();

        console.log("✅ Successfully synced completion with Appwrite");
      } catch (syncError: any) {
        console.error(
          "⚠️ Failed to sync with Appwrite, keeping local completion:",
          syncError
        );

        // Check if it's a database setup issue
        if (
          syncError.message &&
          syncError.message.includes("Unknown attribute")
        ) {
          console.error(
            "🚨 Database not properly configured. Completion saved locally only."
          );
          throw new Error(
            "Database not configured. Completion saved locally - please set up your Appwrite database."
          );
        }

        // For other sync errors, keep the local completion but don't throw
        console.log(
          "📱 Completion saved locally, will sync when connection is restored"
        );
      }
    } catch (error) {
      console.error("Error completing habit:", error);
      throw error;
    }
  },

  fetchTodayCompletions: async (userId: string) => {
    try {
      // Load from storage first
      await get().loadFromStorage();

      try {
        // Then fetch from Appwrite
        const completions = await appwriteService.getCompletions(userId);
        // Filter to today's completions
        const today = new Date().toISOString().split("T")[0];
        const todayCompletions = completions.filter(
          (completion: any) => completion.completed_at.split("T")[0] === today
        );
        const typedCompletions =
          todayCompletions as unknown as HabitCompletion[];
        set({ completions: typedCompletions });
        await get().saveToStorage();
      } catch (error) {
        console.log(
          "Failed to fetch completions from Appwrite, using cached data"
        );
      }
    } catch (error) {
      console.error("Error fetching today completions:", error);
    }
  },
}));
