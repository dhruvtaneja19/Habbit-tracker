import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  Card,
  Avatar,
  Chip,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LeaderboardEntry } from "../types/database.types";
import { spacing, borderRadius, colors } from "../constants/theme";

// Mock data for demonstration
const mockLeaderboard: LeaderboardEntry[] = [
  {
    user_id: "1",
    user_name: "John Doe",
    user_avatar: undefined,
    total_completions: 150,
    longest_streak: 45,
    current_streaks: 12,
    rank: 1,
  },
  {
    user_id: "2",
    user_name: "Jane Smith",
    user_avatar: undefined,
    total_completions: 128,
    longest_streak: 38,
    current_streaks: 8,
    rank: 2,
  },
  {
    user_id: "3",
    user_name: "Mike Johnson",
    user_avatar: undefined,
    total_completions: 95,
    longest_streak: 25,
    current_streaks: 15,
    rank: 3,
  },
];

export default function LeaderboardScreen() {
  const theme = useTheme();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank.toString();
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <Card
      style={[
        styles.leaderboardCard,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Card.Content>
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <Text style={styles.rankIcon}>{getRankIcon(item.rank)}</Text>
            <Avatar.Text
              size={40}
              label={item.user_name.charAt(0)}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={styles.userName}>
                {item.user_name}
              </Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.userStats,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {item.total_completions} total completions
              </Text>
            </View>
          </View>

          <View style={styles.streakInfo}>
            <Chip
              icon={() => <Text style={styles.streakEmoji}>🔥</Text>}
              style={[
                styles.streakChip,
                { backgroundColor: colors.streak.background },
              ]}
              textStyle={{ color: colors.streak.text, fontSize: 12 }}
              compact
            >
              {item.current_streaks} days
            </Chip>
            <Text
              variant="bodySmall"
              style={[
                styles.bestStreak,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Best: {item.longest_streak} days
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Surface
        style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}
      >
        <MaterialCommunityIcons
          name="trophy"
          size={60}
          color={colors.warning}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Leaderboard
        </Text>
        <Text
          variant="bodyLarge"
          style={[
            styles.headerSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          See how you rank against other habit builders
        </Text>
      </Surface>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="trophy-outline"
        size={80}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="headlineSmall"
        style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}
      >
        No leaderboard data
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Complete habits to appear on the leaderboard
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={mockLeaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
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
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    alignItems: "center",
  },
  headerTitle: {
    marginTop: spacing.md,
    fontWeight: "bold",
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  leaderboardCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    minWidth: 30,
    textAlign: "center",
  },
  avatar: {
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: "600",
  },
  userStats: {
    marginTop: spacing.xs,
  },
  streakInfo: {
    alignItems: "flex-end",
  },
  streakChip: {
    marginBottom: spacing.xs,
  },
  streakEmoji: {
    fontSize: 14,
  },
  bestStreak: {
    fontSize: 12,
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
});
