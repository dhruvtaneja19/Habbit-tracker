import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../constants/theme";

export default function HabitDetailScreen() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Surface
        style={[styles.surface, { backgroundColor: theme.colors.surface }]}
      >
        <MaterialCommunityIcons
          name="chart-line"
          size={80}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
        >
          Habit Details
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          This screen will show detailed habit statistics and history
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  surface: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  title: {
    marginTop: spacing.lg,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
