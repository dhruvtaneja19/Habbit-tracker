import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  HelperText,
  RadioButton,
  Card,
  Chip,
  IconButton,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";

import { useAuth } from "../lib/auth-context";
import { useHabitStore } from "../lib/habit-store";
import {
  CreateHabitFormData,
  RootStackParamList,
} from "../types/database.types";
import { spacing, borderRadius } from "../constants/theme";

const { width, height } = Dimensions.get("window");
const isTablet = width > 768;
const isAndroid = Platform.OS === "android";

export default function CreateHabitScreen() {
  const [formData, setFormData] = useState<CreateHabitFormData>({
    title: "",
    description: "",
    frequency: "daily",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Reanimated values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.95);
  const buttonScale = useSharedValue(1);

  const { user } = useAuth();
  const { createHabit } = useHabitStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  useEffect(() => {
    // Start entrance animations
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    scale.value = withSpring(1, { damping: 15, stiffness: 120 });
  }, []);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Habit title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Habit title must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      await createHabit(user.$id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency,
        created_at: new Date().toISOString(),
      });

      // Success animation
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(() => {
          Alert.alert("Success", "Habit created successfully!", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        })();
      });
    } catch (error: any) {
      console.error("Error creating habit:", error);
      Alert.alert("Error", error.message || "Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateHabitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.animatedContainer, animatedContainerStyle]}>
        <ScrollView
          style={[
            styles.scrollView,
            { backgroundColor: theme.colors.background },
          ]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Card
            style={[
              styles.headerCard,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Card.Content style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={32}
                  color={theme.colors.onPrimary}
                />
              </View>
              <Text
                variant="headlineMedium"
                style={[styles.headerTitle, { color: theme.colors.onPrimary }]}
              >
                Create New Habit
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.headerSubtitle,
                  { color: theme.colors.onPrimary },
                ]}
              >
                Build better habits, one step at a time
              </Text>
            </Card.Content>
          </Card>

          {/* Form */}
          <Surface
            style={[styles.form, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  Basic Information
                </Text>
              </View>

              <TextInput
                label="Habit Title *"
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.title}
                placeholder="e.g., Morning Exercise, Read 30 minutes"
                left={<TextInput.Icon icon="format-title" />}
                theme={{
                  colors: {
                    primary: theme.colors.primary,
                    onSurfaceVariant: theme.colors.onSurfaceVariant,
                  },
                }}
              />
              <HelperText type="error" visible={!!errors.title}>
                {errors.title}
              </HelperText>

              <TextInput
                label="Description (Optional)"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
                placeholder="Add more details about your habit..."
                left={<TextInput.Icon icon="text" />}
                theme={{
                  colors: {
                    primary: theme.colors.primary,
                    onSurfaceVariant: theme.colors.onSurfaceVariant,
                  },
                }}
              />
            </View>

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  Frequency
                </Text>
              </View>

              <RadioButton.Group
                onValueChange={(value) => updateFormData("frequency", value)}
                value={formData.frequency}
              >
                <Pressable
                  onPress={() => updateFormData("frequency", "daily")}
                  android_ripple={{ color: theme.colors.primary + "20" }}
                >
                  <Surface
                    style={[
                      styles.radioCard,
                      {
                        backgroundColor:
                          formData.frequency === "daily"
                            ? theme.colors.primaryContainer
                            : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <View style={styles.radioOption}>
                      <RadioButton value="daily" />
                      <View style={styles.radioContent}>
                        <MaterialCommunityIcons
                          name="calendar-today"
                          size={24}
                          color={theme.colors.primary}
                        />
                        <View style={styles.radioText}>
                          <Text variant="bodyLarge" style={styles.radioLabel}>
                            Daily
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            Track every day
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Surface>
                </Pressable>

                <Pressable
                  onPress={() => updateFormData("frequency", "weekly")}
                  android_ripple={{ color: theme.colors.primary + "20" }}
                >
                  <Surface
                    style={[
                      styles.radioCard,
                      {
                        backgroundColor:
                          formData.frequency === "weekly"
                            ? theme.colors.primaryContainer
                            : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <View style={styles.radioOption}>
                      <RadioButton value="weekly" />
                      <View style={styles.radioContent}>
                        <MaterialCommunityIcons
                          name="calendar-week"
                          size={24}
                          color={theme.colors.primary}
                        />
                        <View style={styles.radioText}>
                          <Text variant="bodyLarge" style={styles.radioLabel}>
                            Weekly
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            Track weekly goals
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Surface>
                </Pressable>
              </RadioButton.Group>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                disabled={loading}
                icon="close"
                textColor={theme.colors.onSurface}
              >
                Cancel
              </Button>
              <Animated.View style={buttonAnimatedStyle}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.createButton}
                  icon="plus"
                >
                  Create Habit
                </Button>
              </Animated.View>
            </View>
          </Surface>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 4,
  },
  headerContent: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    textAlign: "center",
    opacity: 0.9,
  },
  form: {
    borderRadius: borderRadius.lg,
    elevation: 2,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  input: {
    marginBottom: spacing.xs,
  },
  radioCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: 1,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: spacing.sm,
  },
  radioText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  radioLabel: {
    fontWeight: "500",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconChip: {
    marginBottom: spacing.sm,
  },
  iconChipText: {
    fontSize: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
  },
  colorCheckmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: isTablet ? "row" : "column",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: isTablet ? 1 : undefined,
    minHeight: 48,
  },
  createButton: {
    flex: isTablet ? 1 : undefined,
    minHeight: 48,
  },
});
