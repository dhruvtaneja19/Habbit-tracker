import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appwriteService } from "./appwrite";
import { User } from "../types/database.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log("Auth: Starting auth check...");
      setIsLoading(true);

      // Try to get user from AsyncStorage first (for offline support)
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        console.log("Auth: Found stored user");
        setUser(JSON.parse(storedUser));
      }

      // Then try to get current user from Appwrite
      try {
        console.log("Auth: Checking current user from Appwrite...");
        const currentUser = await appwriteService.getCurrentUser();
        if (currentUser) {
          console.log("Auth: Got current user from Appwrite");
          setUser(currentUser as unknown as User);
          await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        } else {
          console.log("Auth: No current user from Appwrite");
        }
      } catch (error) {
        // If there's a session error, try to clear it
        if (error instanceof Error && error.message.includes("session")) {
          try {
            await appwriteService.signOut();
            console.log("Auth: Cleared problematic session");
          } catch (clearError) {
            console.log("Auth: Failed to clear session:", clearError);
          }
        }

        // If Appwrite fails but we have stored user, keep using stored user
        console.log(
          "Failed to get current user from Appwrite, using stored user:",
          error
        );
        if (!storedUser) {
          setUser(null);
          await AsyncStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setUser(null);
      await AsyncStorage.removeItem("user");
    } finally {
      console.log("Auth: Auth check complete");
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Starting sign in process...");
      setIsLoading(true);

      console.log("🔐 Calling appwrite signIn...");
      await appwriteService.signIn(email, password);

      console.log("🔐 SignIn successful, getting current user...");
      const currentUser = await appwriteService.getCurrentUser();

      console.log("🔐 Current user received:", currentUser);
      setUser(currentUser as unknown as User);
      await AsyncStorage.setItem("user", JSON.stringify(currentUser));

      console.log("🔐 Sign in complete!");
    } catch (error) {
      console.error("🔐 Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const newUser = await appwriteService.createUser(email, password, name);
      setUser(newUser as unknown as User);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await appwriteService.signOut();
      setUser(null);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if Appwrite sign out fails, clear local data
      setUser(null);
      await AsyncStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, avatar?: string) => {
    try {
      if (!user) throw new Error("No user logged in");

      setIsLoading(true);
      // Implementation depends on your Appwrite setup
      // This is a placeholder for the update profile functionality
      const updatedUser = { ...user, name, avatar: avatar || user.avatar };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
