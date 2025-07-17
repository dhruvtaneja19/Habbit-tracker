import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
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
  IconButton,
  Chip,
  Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../lib/auth-context";
import { useHabitStore } from "../lib/habit-store";
import {
  CreateHabitFormData,
  RootStackParamList,
} from "../types/database.types";
import { spacing, borderRadius, colors } from "../constants/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Animated components
const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Sample habit icons
const habitIcons = [
  { icon: "💪", label: "Exercise" },
  { icon: "📚", label: "Reading" },
  { icon: "💧", label: "Water" },
  { icon: "🧘", label: "Meditation" },
  { icon: "🌱", label: "Learning" },
  { icon: "🎨", label: "Creative" },
  { icon: "🚶", label: "Walking" },
  { icon: "💤", label: "Sleep" },
  { icon: "🍎", label: "Healthy Eating" },
  { icon: "📝", label: "Writing" },
];

export default function CreateHabitScreen() {
  const [formData, setFormData] = useState<CreateHabitFormData>({
    title: "",
    description: "",
    frequency: "daily",
  });
  const [selectedIcon, setSelectedIcon] = useState(habitIcons[0].icon);
  const [selectedColor, setSelectedColor] = useState(colors.habitColors[0]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { user } = useAuth();
  const { createHabit } = useHabitStore();
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Animation values
  const slideAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    slideAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    fadeAnim.value = withTiming(1, { duration: 800 });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
    progressAnim.value = withTiming(currentStep / 2, { duration: 300 });
  }, [currentStep]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(slideAnim.value, [0, 1], [50, 0]) },
      { scale: scaleAnim.value },
    ],
    opacity: fadeAnim.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Habit title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Shake animation for errors
      scaleAnim.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a habit");
      return;
    }

    setLoading(true);

    try {
      await createHabit(user.$id, {
        ...formData,
        created_at: new Date().toISOString(),
      });

      // Success animation
      scaleAnim.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );

      setTimeout(() => {
        navigation.goBack();
      }, 300);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View
        style={[styles.progressBar, { backgroundColor: theme.colors.outline }]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: theme.colors.primary },
            progressStyle,
          ]}
        />
      </View>
      <Text
        variant="bodySmall"
        style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}
      >
        Step {currentStep + 1} of 3
      </Text>
    </View>
  );

  const renderBasicInfo = () => (
    <AnimatedCard
      style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <Text
          variant="headlineSmall"
          style={[styles.stepTitle, { color: theme.colors.onSurface }]}
        >
          📝 Basic Information
        </Text>
        <Text
          variant="bodyMedium"
          style={[
            styles.stepDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Let's start with the basics of your new habit
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Habit Title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            mode="outlined"
            error={!!errors.title}
            style={styles.input}
            left={<TextInput.Icon icon="target" />}
            placeholder="e.g., Drink 8 glasses of water"
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            mode="outlined"
            multiline
            numberOfLines={3}
            error={!!errors.description}
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
            placeholder="Add more details about your habit..."
          />
          {errors.description && (
            <HelperText type="error">{errors.description}</HelperText>
          )}
        </View>
      </Card.Content>
    </AnimatedCard>
  );

  const renderFrequency = () => (
    <AnimatedCard
      style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <Text
          variant="headlineSmall"
          style={[styles.stepTitle, { color: theme.colors.onSurface }]}
        >
          ⏰ Frequency
        </Text>
        <Text
          variant="bodyMedium"
          style={[
            styles.stepDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          How often do you want to practice this habit?
        </Text>

        <RadioButton.Group
          onValueChange={(value) =>
            setFormData({ ...formData, frequency: value as "daily" | "weekly" })
          }
          value={formData.frequency}
        >
          <Pressable
            style={[
              styles.frequencyOption,
              { borderColor: theme.colors.outline },
            ]}
            onPress={() => setFormData({ ...formData, frequency: "daily" })}
          >
            <RadioButton value="daily" />
            <View style={styles.frequencyContent}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                Daily
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Practice every day
              </Text>
            </View>
            <MaterialCommunityIcons
              name="calendar-today"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>

          <Pressable
            style={[
              styles.frequencyOption,
              { borderColor: theme.colors.outline },
            ]}
            onPress={() => setFormData({ ...formData, frequency: "weekly" })}
          >
            <RadioButton value="weekly" />
            <View style={styles.frequencyContent}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                Weekly
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Practice once a week
              </Text>
            </View>
            <MaterialCommunityIcons
              name="calendar-week"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        </RadioButton.Group>
      </Card.Content>
    </AnimatedCard>
  );

  const renderSummary = () => (
    <AnimatedCard
      style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <Text
          variant="headlineSmall"
          style={[styles.stepTitle, { color: theme.colors.onSurface }]}
        >
          ✅ Review & Create
        </Text>
        <Text
          variant="bodyMedium"
          style={[
            styles.stepDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Review your habit details before creating
        </Text>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Title:
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                color: theme.colors.onSurface,
                flex: 1,
                textAlign: "right",
              }}
            >
              {formData.title}
            </Text>
          </View>

          {formData.description && (
            <>
              <Divider style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Description:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurface,
                    flex: 1,
                    textAlign: "right",
                  }}
                >
                  {formData.description}
                </Text>
              </View>
            </>
          )}

          <Divider style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Frequency:
            </Text>
            <Chip mode="outlined" compact>
              {formData.frequency.charAt(0).toUpperCase() +
                formData.frequency.slice(1)}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </AnimatedCard>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderFrequency();
      case 2:
        return renderSummary();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedSurface style={[styles.surface, containerStyle]}>
          {renderStepIndicator()}
          {renderStepContent()}

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <Button
                  mode="outlined"
                  onPress={prevStep}
                  style={styles.backButton}
                  icon="arrow-left"
                >
                  Back
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  mode="contained"
                  onPress={nextStep}
                  style={styles.nextButton}
                  icon="arrow-right"
                  contentStyle={styles.buttonContent}
                  disabled={currentStep === 0 && !formData.title.trim()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.createButton}
                  icon="plus"
                  contentStyle={styles.buttonContent}
                >
                  Create Habit
                </Button>
              )}
            </View>
          </View>
        </AnimatedSurface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  surface: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  stepIndicator: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: borderRadius.xs,
  },
  stepText: {
    textAlign: "center",
  },
  stepCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
  },
  stepTitle: {
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  stepDescription: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: "transparent",
  },
  frequencyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  frequencyContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  summaryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  summaryDivider: {
    marginVertical: spacing.xs,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nextButton: {
    flex: 2,
    marginLeft: spacing.sm,
  },
  createButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
