import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Alert, LogBox } from "react-native";

import { AuthProvider } from "./lib/auth-context";
import { ThemeProvider, useThemeContext } from "./lib/theme-context";
import { Navigation } from "./navigation/Navigation";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
  "Remote debugger",
]);

// Global error handler for production builds
const setupGlobalErrorHandler = () => {
  if (__DEV__) return; // Only for production

  const originalHandler = (global as any).ErrorUtils.getGlobalHandler();

  (global as any).ErrorUtils.setGlobalHandler(
    (error: Error, isFatal: boolean) => {
      console.error("🚨 Global Error:", error);
      console.error("🚨 Error Stack:", error.stack);

      if (isFatal) {
        Alert.alert(
          "Unexpected Error",
          `The app encountered an error: ${error.message}\n\nPlease restart the app.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Could add restart logic here
              },
            },
          ]
        );
      }

      // Call original handler
      originalHandler(error, isFatal);
    }
  );
};

const AppContent = () => {
  const { theme, isDark } = useThemeContext();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <Navigation />
          <StatusBar style={isDark ? "light" : "dark"} />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
