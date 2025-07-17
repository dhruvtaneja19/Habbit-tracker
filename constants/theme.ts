import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6366f1",
    primaryContainer: "#e0e7ff",
    secondary: "#10b981",
    secondaryContainer: "#d1fae5",
    tertiary: "#f59e0b",
    tertiaryContainer: "#fef3c7",
    surface: "#ffffff",
    surfaceVariant: "#f8fafc",
    background: "#f8fafc",
    error: "#ef4444",
    errorContainer: "#fee2e2",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#1e1b4b",
    onSecondary: "#ffffff",
    onSecondaryContainer: "#064e3b",
    onTertiary: "#ffffff",
    onTertiaryContainer: "#78350f",
    onSurface: "#1f2937",
    onSurfaceVariant: "#6b7280",
    onBackground: "#1f2937",
    onError: "#ffffff",
    onErrorContainer: "#7f1d1d",
    outline: "#d1d5db",
    outlineVariant: "#e5e7eb",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#1f2937",
    inverseOnSurface: "#f9fafb",
    inversePrimary: "#a5b4fc",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#a5b4fc",
    primaryContainer: "#3730a3",
    secondary: "#34d399",
    secondaryContainer: "#047857",
    tertiary: "#fbbf24",
    tertiaryContainer: "#92400e",
    surface: "#1f2937",
    surfaceVariant: "#111827",
    background: "#111827",
    error: "#f87171",
    errorContainer: "#991b1b",
    onPrimary: "#1e1b4b",
    onPrimaryContainer: "#e0e7ff",
    onSecondary: "#064e3b",
    onSecondaryContainer: "#d1fae5",
    onTertiary: "#78350f",
    onTertiaryContainer: "#fef3c7",
    onSurface: "#f9fafb",
    onSurfaceVariant: "#d1d5db",
    onBackground: "#f9fafb",
    onError: "#7f1d1d",
    onErrorContainer: "#fee2e2",
    outline: "#6b7280",
    outlineVariant: "#4b5563",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#f9fafb",
    inverseOnSurface: "#1f2937",
    inversePrimary: "#6366f1",
  },
};

export const colors = {
  // Habit colors
  habitColors: [
    "#6366f1", // Purple
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#ec4899", // Pink
    "#84cc16", // Lime
    "#6366f1", // Blue
  ],

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",

  // Streak colors
  streak: {
    fire: "#f59e0b",
    background: "#fef3c7",
    text: "#78350f",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};
