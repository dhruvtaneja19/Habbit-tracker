import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  Card,
  Button,
  Switch,
  Divider,
  List,
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth-context";
import { useThemeContext } from "../lib/theme-context";
import { appwriteService } from "../lib/appwrite";
import { spacing, borderRadius, colors } from "../constants/theme";

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);

  const { user, signOut } = useAuth();
  const { themeMode, setThemeMode } = useThemeContext();
  const theme = useTheme();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Info",
              "Account deletion feature will be implemented soon"
            );
          },
        },
      ]
    );
  };

  const checkDatabaseSetup = async () => {
    Alert.alert(
      "Database Setup Check",
      "Checking Appwrite database configuration...",
      [{ text: "OK" }]
    );

    if (__DEV__) {
      const isSetupCorrect = await appwriteService.checkDatabaseSetup();
      if (isSetupCorrect) {
        Alert.alert(
          "✅ Database Setup Complete",
          "Your Appwrite database is properly configured!",
          [{ text: "Great!" }]
        );
      } else {
        Alert.alert(
          "⚠️ Database Setup Needed",
          "Your Appwrite database needs to be configured. Check the console for detailed instructions.",
          [
            {
              text: "View Setup Guide",
              onPress: () =>
                Alert.alert(
                  "Database Setup Guide",
                  "1. Go to cloud.appwrite.io/console\n" +
                    "2. Create collections: habits, completions, users\n" +
                    "3. Add required attributes\n" +
                    "4. Set permissions to 'Users'\n\n" +
                    "See DATABASE_SETUP.md for detailed instructions."
                ),
            },
            { text: "OK" },
          ]
        );
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Info */}
      <Surface
        style={[styles.userCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.userInfo}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[styles.avatarText, { color: theme.colors.onPrimary }]}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.name || "User Name"}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.userEmail,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {user?.email || "user@example.com"}
            </Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={() =>
            Alert.alert("Info", "Edit profile feature coming soon")
          }
          style={styles.editButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </Surface>

      {/* Statistics */}
      <Surface
        style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Statistics
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: theme.colors.primary }]}
            >
              0
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

          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: colors.success }]}
            >
              0
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Completed Today
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, { color: colors.warning }]}
            >
              0
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

      {/* Settings */}
      <Surface
        style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Settings
        </Text>

        <List.Item
          title="Theme"
          description="Choose your preferred theme"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
        />

        <View style={styles.themeSelector}>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(value) => setThemeMode(value as any)}
            buttons={[
              {
                value: "light",
                label: "Light",
                icon: "white-balance-sunny",
              },
              {
                value: "dark",
                label: "Dark",
                icon: "weather-night",
              },
              {
                value: "system",
                label: "System",
                icon: "cog",
              },
            ]}
          />
        </View>

        <Divider />

        <List.Item
          title="Notifications"
          description="Habit reminders and alerts"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch value={notifications} onValueChange={setNotifications} />
          )}
        />

        <Divider />

        <List.Item
          title="Export Data"
          description="Download your habit data"
          left={(props) => <List.Icon {...props} icon="download" />}
          onPress={() => Alert.alert("Info", "Export feature coming soon")}
        />

        <Divider />

        <List.Item
          title="Check Database Setup"
          description="Verify Appwrite database configuration"
          left={(props) => <List.Icon {...props} icon="database-check" />}
          onPress={() => checkDatabaseSetup()}
        />

        <Divider />

        <List.Item
          title="Privacy Policy"
          description="Read our privacy policy"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          onPress={() =>
            Alert.alert("Info", "Privacy policy will be shown here")
          }
        />

        <Divider />

        <List.Item
          title="Terms of Service"
          description="Read our terms of service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() =>
            Alert.alert("Info", "Terms of service will be shown here")
          }
        />
      </Surface>

      {/* Actions */}
      <Surface
        style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]}
      >
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          icon="logout"
        >
          Sign Out
        </Button>

        <Button
          mode="outlined"
          onPress={handleDeleteAccount}
          style={[styles.deleteButton, { borderColor: colors.error }]}
          textColor={colors.error}
          icon="delete"
        >
          Delete Account
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  userCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
  },
  userEmail: {
    marginTop: spacing.xs,
  },
  editButton: {
    alignSelf: "flex-start",
  },
  statsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
  },
  statLabel: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  settingsCard: {
    borderRadius: borderRadius.lg,
    elevation: 2,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  actionsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
  },
  signOutButton: {
    marginBottom: spacing.md,
  },
  deleteButton: {
    borderWidth: 1,
  },
  themeSelector: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
