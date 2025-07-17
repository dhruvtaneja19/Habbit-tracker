import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import {
  Text,
  Surface,
  FAB,
  useTheme,
  Card,
  IconButton,
  Chip,
  Menu,
  Divider,
  Button,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../lib/auth-context";
import { useHabitStore } from "../lib/habit-store";
import { Habit, RootStackParamList } from "../types/database.types";
import {
  getStreakEmoji,
  getHabitIcon,
  calculateStreak,
  getCompletionRate,
} from "../utils/helpers";
import { spacing, borderRadius, colors } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function HabitsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { user } = useAuth();
  const {
    habits,
    completions,
    isLoading,
    fetchHabits,
    fetchTodayCompletions,
    deleteHabit,
  } = useHabitStore();
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHabits(user.$id);
        fetchTodayCompletions(user.$id);
      }
    }, [user, fetchHabits, fetchTodayCompletions])
  );

  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      await Promise.all([
        fetchHabits(user.$id),
        fetchTodayCompletions(user.$id),
      ]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteHabit = (habitId: string, habitTitle: string) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              setMenuVisible((prev) => ({ ...prev, [habitId]: false }));
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete habit");
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (habitId: string) => {
    setMenuVisible((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  const renderHabitCard = ({ item: habit }: { item: Habit }) => {
    const currentStreak = calculateStreak(habit, completions);
    const streakEmoji = getStreakEmoji(currentStreak);
    const habitIcon = getHabitIcon(habit.title.toLowerCase()) || "📋"; // Use habit icon or default
    const completionRate = getCompletionRate(habit, completions, 7);

    return (
      <Card
        style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.habitHeader}>
            <View style={styles.habitTitleRow}>
              <Text style={styles.habitIcon}>{habitIcon}</Text>
              <View style={styles.habitInfo}>
                <Text variant="titleMedium" style={styles.habitTitle}>
                  {habit.title}
                </Text>
                {habit.description && (
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.habitDescription,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {habit.description}
                  </Text>
                )}
                <View style={styles.habitMeta}>
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.frequencyChip}
                    textStyle={{ fontSize: 12 }}
                  >
                    {habit.frequency}
                  </Chip>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.completionRate,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {completionRate}% this week
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.habitActions}>
              {currentStreak > 0 && (
                <Chip
                  icon={() => (
                    <Text style={styles.streakEmoji}>{streakEmoji}</Text>
                  )}
                  style={[
                    styles.streakChip,
                    { backgroundColor: colors.streak.background },
                  ]}
                  textStyle={{ color: colors.streak.text, fontSize: 12 }}
                  compact
                >
                  {currentStreak.toString()}
                </Chip>
              )}

              <Menu
                visible={menuVisible[habit.$id] || false}
                onDismiss={() => toggleMenu(habit.$id)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => toggleMenu(habit.$id)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    toggleMenu(habit.$id);
                    navigation.navigate("HabitDetail", {
                      habitId: habit.$id,
                    });
                  }}
                  title="View Details"
                  leadingIcon="eye"
                />
                <Menu.Item
                  onPress={() => {
                    toggleMenu(habit.$id);
                    navigation.navigate("EditHabit", {
                      habitId: habit.$id,
                    });
                  }}
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Divider />
                <Menu.Item
                  onPress={() => handleDeleteHabit(habit.$id, habit.title)}
                  title="Delete"
                  leadingIcon="delete"
                  titleStyle={{ color: colors.error }}
                />
              </Menu>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Surface
        style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: theme.colors.primary }]}
            >
              {habits.length}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Habits
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: colors.success }]}
            >
              {habits.filter((h) => calculateStreak(h, completions) > 0).length}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Active Streaks
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: colors.warning }]}
            >
              {Math.max(
                ...habits.map((h) => calculateStreak(h, completions)),
                0
              )}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Best Streak
            </Text>
          </View>
        </View>
      </Surface>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="format-list-checks"
        size={80}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="headlineSmall"
        style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}
      >
        No habits created yet
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Start building better habits today
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={habits}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={habits.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CreateHabit")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "bold",
  },
  statLabel: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: spacing.sm,
  },
  habitCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  habitTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  habitIcon: {
    fontSize: 32,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontWeight: "600",
  },
  habitDescription: {
    marginTop: spacing.xs,
  },
  habitMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  frequencyChip: {
    marginRight: spacing.sm,
  },
  completionRate: {
    fontSize: 12,
  },
  habitActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakChip: {
    marginRight: spacing.xs,
  },
  streakEmoji: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    fontWeight: "bold",
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
