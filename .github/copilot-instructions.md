# Copilot Instructions for Habit Tracker App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context

This is a React Native Expo Go Lightweight Habit Tracker App with the following tech stack:

### Core Technologies

- **Framework**: React Native with Expo Go
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper
- **State Management**: Zustand
- **Storage**: AsyncStorage + SQLite for offline, Appwrite for cloud sync
- **Authentication**: Appwrite
- **Animations**: React Native Reanimated

### Project Structure

- Use functional components with hooks
- Follow React Native best practices for performance
- Implement proper TypeScript typing
- Use Expo-compatible packages only
- Follow atomic design principles for components

### Key Features to Implement

1. User authentication with Appwrite
2. Habit CRUD operations
3. Daily streak tracking with visual indicators
4. Leaderboard system
5. Push notifications for reminders
6. Dark/light mode support
7. Offline-first architecture with cloud sync

### Code Style Guidelines

- Use TypeScript strict mode
- Implement proper error handling
- Use React Native Paper components for consistency
- Follow React hooks patterns
- Implement loading states and optimistic updates
- Use proper navigation patterns

### Performance Considerations

- Optimize FlatList rendering for habit lists
- Implement proper image optimization
- Use React.memo for expensive components
- Implement proper state management to avoid unnecessary re-renders
- Use proper async/await patterns for database operations

### Database Schema

- Users: id, name, email, avatar, created_at
- Habits: id, user_id, title, description, frequency, icon, streak_count, last_completed, created_at
- Completions: id, user_id, habit_id, completed_at, created_at
- Leaderboard: Calculated from habit completions and streaks
