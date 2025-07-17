import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";
import Constants from "expo-constants";
import { User } from "../types/database.types";
import { logSetupInstructions } from "./database-setup";

// Get configuration from environment variables or app.json extra
const getAppwriteConfig = () => {
  // Development: Use environment variables from .env
  if (__DEV__ && process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID) {
    console.log("📱 Using development environment variables");
    return {
      endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
      platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
      projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
      databaseId: process.env.EXPO_PUBLIC_DB_ID!,
      usersCollectionId: process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!,
      habitsCollectionId: process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID!,
      completionsCollectionId:
        process.env.EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID!,
    };
  }

  // Production: Use app.json extra configuration
  const extra = Constants.expoConfig?.extra;
  console.log("🏭 Using production configuration from app.json");

  return {
    endpoint: extra?.appwriteEndpoint || "https://cloud.appwrite.io/v1",
    platform: extra?.appwritePlatform || "com.dhruvcodes.habittracker",
    projectId: extra?.appwriteProjectId || "6862bd32000e11109ac9",
    databaseId: extra?.databaseId || "6862c1b6003103935ee4",
    usersCollectionId: extra?.usersCollectionId || "6863c6de001fe39e0413",
    habitsCollectionId: extra?.habitsCollectionId || "6863c6de001fe39e0414",
    completionsCollectionId:
      extra?.completionsCollectionId || "6863c6de001fe39e0415",
  };
};

export const appwriteConfig = getAppwriteConfig();

// Debug: Log the configuration
console.log("🔧 Appwrite Config:", {
  endpoint: appwriteConfig.endpoint,
  projectId: appwriteConfig.projectId,
  databaseId: appwriteConfig.databaseId,
  usersCollectionId: appwriteConfig.usersCollectionId,
  habitsCollectionId: appwriteConfig.habitsCollectionId,
  completionsCollectionId: appwriteConfig.completionsCollectionId,
});

console.log("Appwrite Config:", appwriteConfig);

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);

// Export constants for easy access
export const {
  databaseId: DATABASE_ID,
  usersCollectionId: USERS_COLLECTION_ID,
  habitsCollectionId: HABITS_COLLECTION_ID,
  completionsCollectionId: COMPLETIONS_COLLECTION_ID,
} = appwriteConfig;

// Export client for real-time subscriptions
export { client, ID, Query };

// Utility functions for Appwrite operations
export const appwriteService = {
  // User operations
  async createUser(email: string, password: string, name: string) {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (!newAccount) throw new Error("Failed to create account");

      let avatarUrl = "";
      try {
        avatarUrl = avatars.getInitials(name).toString();
        // Ensure avatar URL is not longer than 500 characters
        if (avatarUrl.length > 500) {
          avatarUrl = avatarUrl.substring(0, 500);
        }
      } catch (error) {
        console.warn(
          "Failed to generate avatar URL, using empty string:",
          error
        );
        avatarUrl = "";
      }

      console.log("Creating user with data:", {
        accountId: newAccount.$id,
        email: newAccount.email,
        name: newAccount.name,
        avatar: avatarUrl,
        avatarType: typeof avatarUrl,
        avatarLength: avatarUrl.length,
      });

      await this.signIn(email, password);

      const newUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email: newAccount.email,
          name: newAccount.name,
          avatar: avatarUrl,
        }
      );

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      // First, check if there's already an active session
      try {
        const currentSession = await account.getSession("current");
        if (currentSession) {
          // Session already exists, just return it
          console.log("Session already exists, using existing session");
          return currentSession;
        }
      } catch (error) {
        // No active session, proceed with login
        console.log("No active session, creating new session");
      }

      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  async signOut() {
    try {
      const session = await account.deleteSession("current");
      return session;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const currentAccount = await account.get();

      if (!currentAccount) throw new Error("No current account");

      // For now, return account data as user object since users collection doesn't exist
      // TODO: Create users collection and proper user documents
      let avatarUrl = "";
      try {
        avatarUrl = avatars.getInitials(currentAccount.name).toString();
        if (avatarUrl.length > 500) {
          avatarUrl = avatarUrl.substring(0, 500);
        }
      } catch (error) {
        console.warn("Failed to generate avatar URL in getCurrentUser:", error);
        avatarUrl = "";
      }

      return {
        $id: currentAccount.$id,
        $createdAt: currentAccount.$createdAt,
        $updatedAt: currentAccount.$updatedAt,
        accountId: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name,
        avatar: avatarUrl,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        data
      );
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Habit operations
  async createHabit(userId: string, habitData: any) {
    try {
      const habit = await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          title: habitData.title,
          description: habitData.description || "",
          frequency: habitData.frequency || "daily",
          streak_count: 0,
          created_at: new Date().toISOString(),
        }
      );
      return habit;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

  async getHabits(userId: string) {
    try {
      const habits = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", userId)]
      );
      return habits.documents;
    } catch (error) {
      console.error("Error getting habits:", error);
      throw error;
    }
  },

  async getHabit(habitId: string) {
    try {
      const habit = await databases.getDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
      return habit;
    } catch (error) {
      console.error("Error getting habit:", error);
      throw error;
    }
  },

  async updateHabit(habitId: string, data: any) {
    try {
      const updatedHabit = await databases.updateDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId,
        data
      );
      return updatedHabit;
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  },

  async deleteHabit(habitId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
      return true;
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    }
  },

  // Completion operations
  async completeHabit(userId: string, habitId: string) {
    try {
      console.log("Creating completion with data:", {
        user_id: userId,
        habit_id: habitId,
        completed_at: new Date().toISOString(),
      });

      const completion = await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          habit_id: habitId,
          completed_at: new Date().toISOString(),
        }
      );

      // Get habit to update streak
      const habit = await this.getHabit(habitId);

      // Update streak
      const currentDate = new Date().toISOString().split("T")[0];
      const lastCompleted = habit.last_completed
        ? habit.last_completed.split("T")[0]
        : null;

      // Calculate if streak should be incremented
      let newStreakCount = habit.streak_count;

      if (!lastCompleted || lastCompleted !== currentDate) {
        newStreakCount += 1;
      }

      // Update habit with new streak and last completed
      await this.updateHabit(habitId, {
        streak_count: newStreakCount,
        last_completed: new Date().toISOString(),
      });

      return completion;
    } catch (error: any) {
      console.error("Error completing habit:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));

      // If it's a database structure error, provide more helpful information
      if (error?.message && error.message.includes("Unknown attribute")) {
        console.error("🚨 Database Schema Issue:", {
          message:
            "The Appwrite collections don't have the correct attributes.",
          solution:
            "Please check your Appwrite console and ensure the collections exist with the correct attributes.",
          required_collections: {
            habits: [
              "user_id",
              "title",
              "description",
              "frequency",
              "streak_count",
              "last_completed",
              "created_at",
            ],
            completions: ["user_id", "habit_id", "completed_at"],
            users: ["accountId", "name", "email", "avatar"],
          },
        });
        throw new Error(
          "Database not properly configured. Please check your Appwrite collections and attributes."
        );
      }

      throw error;
    }
  },

  async getCompletions(userId: string, habitId?: string) {
    try {
      const queries = [Query.equal("user_id", userId)];

      if (habitId) {
        queries.push(Query.equal("habit_id", habitId));
      }

      const completions = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        queries
      );

      return completions.documents;
    } catch (error) {
      console.error("Error getting completions:", error);
      throw error;
    }
  },

  // Leaderboard operations
  async getLeaderboard() {
    try {
      // Get all users
      const users = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );

      // For each user, get their habits and completions
      const leaderboardData = await Promise.all(
        users.documents.map(async (user: any) => {
          const habits = await this.getHabits(user.$id);
          const completions = await this.getCompletions(user.$id);

          // Calculate statistics
          const totalCompletions = completions.length;

          // Find the longest streak among all habits
          let longestStreak = 0;
          let currentStreaks = 0;

          habits.forEach((habit: any) => {
            longestStreak = Math.max(longestStreak, habit.streak_count);
            currentStreaks += habit.streak_count;
          });

          return {
            user_id: user.$id,
            user_name: user.name,
            user_avatar: user.avatar,
            total_completions: totalCompletions,
            longest_streak: longestStreak,
            current_streaks: currentStreaks,
          };
        })
      );

      // Sort by total completions (could be modified to use other criteria)
      leaderboardData.sort((a, b) => b.total_completions - a.total_completions);

      // Add rank
      return leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  },

  // Utility function to check database setup
  async checkDatabaseSetup() {
    try {
      console.log("🔍 Checking database setup...");

      // Try to list collections to see if they exist
      const testUserId = "test_user_id";

      let setupIssues = [];

      try {
        // Test habits collection
        await databases.listDocuments(DATABASE_ID, HABITS_COLLECTION_ID, [
          Query.equal("user_id", testUserId),
          Query.limit(1),
        ]);
        console.log("✅ Habits collection exists and accessible");
      } catch (error: any) {
        console.error("❌ Habits collection issue:", error.message);
        setupIssues.push("habits collection");
      }

      try {
        // Test completions collection
        await databases.listDocuments(DATABASE_ID, COMPLETIONS_COLLECTION_ID, [
          Query.equal("user_id", testUserId),
          Query.limit(1),
        ]);
        console.log("✅ Completions collection exists and accessible");
      } catch (error: any) {
        console.error("❌ Completions collection issue:", error.message);
        setupIssues.push("completions collection");
      }

      try {
        // Test users collection
        await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.limit(1),
        ]);
        console.log("✅ Users collection exists and accessible");
      } catch (error: any) {
        console.error("❌ Users collection issue:", error.message);
        setupIssues.push("users collection");
      }

      if (setupIssues.length > 0) {
        console.error(
          "🚨 Database setup issues found with:",
          setupIssues.join(", ")
        );
        logSetupInstructions();
        return false;
      }

      console.log("✅ Database setup looks good!");
      return true;
    } catch (error: any) {
      console.error("Database setup check failed:", error);
      logSetupInstructions();
      return false;
    }
  },
};
