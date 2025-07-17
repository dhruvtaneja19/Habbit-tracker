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
  Button,
  Chip,
  ProgressBar,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../lib/auth-context";
import { useHabitStore } from "../lib/habit-store";
import { appwriteService } from "../lib/appwrite";
import { Habit, RootStackParamList } from "../types/database.types";
import {
  formatDate,
  isHabitCompletedToday,
  getStreakEmoji,
  getHabitIcon,
  calculateStreak,
} from "../utils/helpers";
import { spacing, borderRadius, colors } from "../constants/theme";

const { width } = Dimensions.get("window");
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = width - CARD_MARGIN * 2;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const { user } = useAuth();
  const {
    habits,
    completions,
    isLoading,
    fetchHabits,
    fetchTodayCompletions,
    completeHabit,
  } = useHabitStore();
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const todayHabits = habits.filter((habit) => habit.frequency === "daily");
  const completedToday = todayHabits.filter((habit) =>
    isHabitCompletedToday(habit.$id, completions)
  ).length;
  const totalHabits = todayHabits.length;
  const completionRate = totalHabits > 0 ? completedToday / totalHabits : 0;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        // Check database setup on first load
        if (__DEV__) {
          appwriteService.checkDatabaseSetup();
        }

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

  const handleCompleteHabit = async (habitId: string) => {
    if (!user) return;

    try {
      await completeHabit(user.$id, habitId);
      // Refresh data after completion
      await fetchTodayCompletions(user.$id);
      await fetchHabits(user.$id);

      // Success feedback animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error: any) {
      console.error("Error completing habit:", error);

      // Show a more helpful error message
      if (
        error.message &&
        error.message.includes("Database not properly configured")
      ) {
        Alert.alert(
          "Database Setup Required",
          "Your Appwrite database needs to be configured. This is a one-time setup.\n\nThe habit was saved locally and will sync once the database is set up.",
          [
            {
              text: "Setup Instructions",
              onPress: () => showDatabaseSetupInstructions(),
            },
            {
              text: "OK",
            },
          ]
        );
      } else if (error.message && error.message.includes("Unknown attribute")) {
        Alert.alert(
          "Database Collections Missing",
          "Your Appwrite database collections need to be created. The habit was saved locally.",
          [
            {
              text: "Setup Instructions",
              onPress: () => showDatabaseSetupInstructions(),
            },
            {
              text: "OK",
            },
          ]
        );
      } else if (error.message && error.message.includes("already completed")) {
        Alert.alert(
          "Already Completed",
          "You've already completed this habit today!"
        );
      } else {
        Alert.alert(
          "Error",
          error.message || "Failed to complete habit. Please try again."
        );
      }
    }
  };

  const renderHabitCard = ({
    item: habit,
    index,
  }: {
    item: Habit;
    index: number;
  }) => {
    const isCompleted = isHabitCompletedToday(habit.$id, completions);
    const currentStreak = calculateStreak(habit, completions);
    const streakEmoji = getStreakEmoji(currentStreak);
    const habitIcon = getHabitIcon(habit.title.toLowerCase()) || "✅"; // Use habit icon or default

    return (
      <Animated.View
        style={[
          styles.habitCardContainer,
          {
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            navigation.navigate("HabitDetail", { habitId: habit.$id })
          }
          style={({ pressed }) => [
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Card
            style={[
              styles.habitCard,
              { backgroundColor: theme.colors.surface },
              isCompleted && styles.completedCard,
            ]}
            elevation={3}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.habitHeader}>
                <View style={styles.habitTitleRow}>
                  <View
                    style={[
                      styles.habitIconContainer,
                      {
                        backgroundColor: isCompleted
                          ? colors.success
                          : theme.colors.primaryContainer,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.habitIcon,
                        {
                          color: isCompleted
                            ? "#fff"
                            : theme.colors.onPrimaryContainer,
                        },
                      ]}
                    >
                      {isCompleted ? "✓" : habitIcon}
                    </Text>
                  </View>
                  <View style={styles.habitInfo}>
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.habitTitle,
                        isCompleted && styles.completedText,
                      ]}
                    >
                      {habit.title}
                    </Text>
                    {habit.description && (
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.habitDescription,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                        numberOfLines={2}
                      >
                        {habit.description}
                      </Text>
                    )}
                  </View>
                </View>

                {currentStreak > 0 && (
                  <Chip
                    icon={() => (
                      <Text style={styles.streakEmoji}>{streakEmoji}</Text>
                    )}
                    style={[
                      styles.streakChip,
                      {
                        backgroundColor:
                          colors.streak?.background ||
                          theme.colors.primaryContainer,
                      },
                    ]}
                    textStyle={{
                      color:
                        colors.streak?.text || theme.colors.onPrimaryContainer,
                      fontSize: 12,
                    }}
                    compact
                  >
                    {currentStreak.toString()}
                  </Chip>
                )}
              </View>

              <View style={styles.habitActions}>
                <Button
                  mode={isCompleted ? "contained" : "contained-tonal"}
                  onPress={() => !isCompleted && handleCompleteHabit(habit.$id)}
                  disabled={isCompleted || isLoading}
                  icon={isCompleted ? "check-circle" : "check"}
                  contentStyle={styles.completeButtonContent}
                  style={[
                    styles.completeButton,
                    isCompleted && { backgroundColor: colors.success },
                  ]}
                  compact
                >
                  {isCompleted ? "Done" : "Complete"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Surface
        style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.statsHeader}>
          <Text variant="headlineSmall" style={styles.statsTitle}>
            {formatDate(new Date())}
          </Text>
          <Text
            variant="bodyLarge"
            style={[
              styles.statsSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {completedToday} of {totalHabits} habits completed
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={completionRate}
            color={completionRate === 1 ? colors.success : theme.colors.primary}
            style={styles.progressBar}
          />
          <Text
            variant="bodySmall"
            style={[
              styles.progressText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {Math.round(completionRate * 100)}% Complete
          </Text>
        </View>

        {completionRate === 1 && totalHabits > 0 && (
          <View style={styles.celebrationContainer}>
            <MaterialCommunityIcons
              name="party-popper"
              size={24}
              color={colors.success}
            />
            <Text
              variant="bodyMedium"
              style={[styles.celebrationText, { color: colors.success }]}
            >
              All habits completed! 🎉
            </Text>
          </View>
        )}
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
        No habits yet
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Create your first habit to get started
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("CreateHabit")}
        style={styles.createFirstHabitButton}
        icon="plus"
      >
        Create Your First Habit
      </Button>
    </View>
  );

  const showDatabaseSetupInstructions = () => {
    Alert.alert(
      "🔧 Appwrite Database Setup",
      "To fix the sync issue, please set up your Appwrite database:\n\n" +
        "1. Go to cloud.appwrite.io/console\n" +
        "2. Select your project\n" +
        "3. Go to Databases → Your Database\n" +
        "4. Create 3 collections:\n\n" +
        "• 'habits' - for storing habits\n" +
        "• 'completions' - for habit completions\n" +
        "• 'users' - for user profiles\n\n" +
        "Check the console for detailed attribute requirements.",
      [
        {
          text: "Show Console Instructions",
          onPress: () => {
            if (__DEV__) {
              appwriteService.checkDatabaseSetup();
            }
          },
        },
        { text: "OK" },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={todayHabits}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={totalHabits > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {totalHabits > 0 && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate("CreateHabit")}
        />
      )}
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
  statsHeader: {
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontWeight: "bold",
  },
  statsSubtitle: {
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.xs,
  },
  progressText: {
    textAlign: "right",
  },
  celebrationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.success + "20",
    borderRadius: borderRadius.sm,
  },
  celebrationText: {
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  habitCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    backgroundColor: "transparent",
  },
  habitCardContainer: {
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  completedCard: {
    opacity: 0.8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  habitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitIcon: {
    fontSize: 20,
    fontWeight: "bold",
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
  streakChip: {
    marginLeft: spacing.sm,
  },
  streakEmoji: {
    fontSize: 14,
  },
  habitActions: {
    alignItems: "flex-end",
  },
  completeButton: {
    minWidth: 140,
  },
  completeButtonContent: {
    paddingVertical: spacing.xs,
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
  createFirstHabitButton: {
    marginTop: spacing.xl,
  },
  fab: {
    position: "absolute",
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
