# 🎯 Habit Tracker App

A modern, offline-first habit tracking app built with React Native and Expo, featuring cloud sync, streak tracking, and beautiful Material Design 3 UI.

![React Native](https://img.shields.io/badge/React%20Native-0.72-blue)
![Expo](https://img.shields.io/badge/Expo-~49.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Appwrite](https://img.shields.io/badge/Appwrite-1.4-red)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Material Design 3** with React Native Paper
- **Dark/Light Mode** support with system preference detection
- **Smooth Animations** powered by React Native Reanimated
- **Progressive Forms** with multi-step habit creation

### 🔄 **Offline-First Architecture**
- **Local Storage** with AsyncStorage for instant response
- **Background Sync** with Appwrite when online
- **Optimistic Updates** for seamless user experience
- **Conflict Resolution** for data consistency

### 📊 **Smart Tracking**
- **Streak Calculation** with daily/weekly frequency support
- **Visual Progress** with animated charts and indicators
- **Completion History** with detailed analytics
- **Habit Insights** and performance metrics

### 🔐 **Authentication & Security**
- **Secure Login** with Appwrite authentication
- **Session Management** with automatic token refresh
- **User Isolation** - all data scoped to authenticated user
- **Password Recovery** and account management

## 🛠️ Tech Stack

### **Frontend**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation v6** - Navigation library
- **React Native Paper** - Material Design components
- **React Native Reanimated** - High-performance animations

### **State Management**
- **Zustand** - Lightweight state management
- **React Context** - Global state for auth and theme
- **AsyncStorage** - Local data persistence

### **Backend & Services**
- **Appwrite** - Backend-as-a-Service
- **Cloud Database** - Real-time data sync
- **Authentication** - User management
- **Cloud Storage** - File uploads (avatars, etc.)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habit-tracker.git
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Appwrite configuration:
   ```env
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_APPWRITE_PLATFORM=com.yourcompany.habittracker
   EXPO_PUBLIC_DB_ID=your-database-id
   EXPO_PUBLIC_USERS_COLLECTION_ID=your-users-collection-id
   EXPO_PUBLIC_HABITS_COLLECTION_ID=your-habits-collection-id
   EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID=your-completions-collection-id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### 🏗️ Building for Production

#### Android APK
```bash
eas build --platform android --profile preview
```

#### iOS App Store
```bash
eas build --platform ios --profile production
```

## 📱 App Architecture

### **Folder Structure**
```
habbit/
├── assets/                 # Static assets (images, icons)
├── components/             # Reusable UI components
├── constants/              # Theme and configuration constants
├── lib/                    # Core libraries and utilities
│   ├── appwrite.ts        # Appwrite service configuration
│   ├── auth-context.tsx   # Authentication context
│   ├── habit-store.ts     # Zustand store for habits
│   └── theme-context.tsx  # Theme management
├── navigation/             # Navigation configuration
├── screens/               # App screens/pages
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── App.tsx               # Main app component
```

### **Key Design Patterns**

#### 1. **Offline-First Architecture**
```typescript
// Always save locally first, then sync
const createHabit = async (habitData) => {
  // 1. Save locally immediately
  await AsyncStorage.setItem(`habit_${id}`, JSON.stringify(habit));
  
  // 2. Update UI optimistically
  setHabits(prev => [...prev, habit]);
  
  // 3. Sync to cloud in background
  try {
    await appwriteService.createHabit(habitData);
  } catch (error) {
    // Handle sync failure gracefully
    console.log('Will sync later when online');
  }
};
```

#### 2. **State Management with Zustand**
```typescript
interface HabitStore {
  habits: Habit[];
  loading: boolean;
  createHabit: (data: CreateHabitData) => Promise<void>;
  completeHabit: (id: string) => Promise<void>;
  fetchHabits: () => Promise<void>;
}

const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  loading: false,
  // ... actions
}));
```

#### 3. **Authentication Context**
```typescript
const AuthContext = createContext<AuthContextType>();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 🎨 UI Components

### **Custom Components**
- **HabitCard** - Individual habit display with progress
- **StreakIndicator** - Visual streak counter
- **ProgressChart** - Animated progress visualization
- **CustomButton** - Themed button component
- **LoadingSpinner** - Loading state indicator

### **Theming**
```typescript
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    primary: '#6366F1',
    primaryContainer: '#E0E7FF',
    secondary: '#10B981',
    // ... complete color palette
  }
};
```

## 🔧 Development

### **Available Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run build      # Build for production
```

### **Code Quality**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks (optional)

## 📊 Performance Optimizations

### **List Virtualization**
```typescript
<FlatList
  data={habits}
  renderItem={renderHabit}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: 120,
    offset: 120 * index,
    index,
  })}
/>
```

### **Memory Management**
- **React.memo** for expensive components
- **useCallback** for stable function references
- **useMemo** for expensive calculations
- **Image optimization** with proper caching

## 🔐 Security Features

- **User Authentication** with secure session management
- **Data Encryption** in transit and at rest
- **Permission-based Access** to user data
- **Input Validation** and sanitization
- **Secure Storage** of sensitive information

## 📚 Learning Resources

### **Technologies Used**
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Team** for the amazing framework
- **Expo Team** for the development platform
- **Appwrite Team** for the backend services
- **Material Design Team** for the design system

---

**Made with ❤️ by [Your Name]**
