import { Habit, HabitCompletion } from "../types/database.types";

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: Date | string): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

export const getDaysBetween = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const calculateStreak = (
  habit: Habit,
  completions: HabitCompletion[]
): number => {
  if (!habit.last_completed) return 0;

  const lastCompleted = new Date(habit.last_completed);
  const today = new Date();

  // If last completed was today or yesterday, return the current streak
  if (isToday(lastCompleted) || isYesterday(lastCompleted)) {
    return habit.streak_count;
  }

  // If more than 1 day has passed, streak is broken
  const daysSinceLastCompleted = getDaysBetween(lastCompleted, today);
  if (daysSinceLastCompleted > 1) {
    return 0;
  }

  return habit.streak_count;
};

export const isHabitCompletedToday = (
  habitId: string,
  completions: HabitCompletion[]
): boolean => {
  const today = new Date().toDateString();
  return completions.some(
    (completion) =>
      completion.habit_id === habitId &&
      new Date(completion.completed_at).toDateString() === today
  );
};

export const getCompletionRate = (
  habit: Habit,
  completions: HabitCompletion[],
  days: number = 7
): number => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const relevantCompletions = completions.filter(
    (completion) =>
      completion.habit_id === habit.$id &&
      new Date(completion.completed_at) >= startDate &&
      new Date(completion.completed_at) <= endDate
  );

  return Math.round((relevantCompletions.length / days) * 100);
};

export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return "⭕";
  if (streak < 3) return "🔥";
  if (streak < 7) return "🚀";
  if (streak < 14) return "💪";
  if (streak < 30) return "👑";
  return "🏆";
};

export const getHabitIcon = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    exercise: "💪",
    water: "💧",
    read: "📚",
    meditate: "🧘",
    sleep: "😴",
    diet: "🥗",
    walk: "🚶",
    code: "💻",
    music: "🎵",
    art: "🎨",
    write: "✍️",
    clean: "🧹",
    study: "📖",
    work: "💼",
    family: "👨‍👩‍👧‍👦",
    friends: "👫",
    hobby: "🎯",
    health: "❤️",
    money: "💰",
    travel: "✈️",
  };

  return iconMap[iconName] || "⭐";
};

export const generateHabitId = (): string => {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
