# 🎯 Habit Tracker App - Database Setup Guide

## 🚨 URGENT: Fi### 4. 🔥 CRITICAL: Set Permissions (This fixes 401 errors!)

For **EACH collection** you created:

1. Click on the collection
2. Go to **"Settings"** tab
3. Scroll down to **"Permissions"** section
4. Set **ALL 4 permissions** to **"Users"**:
   - **Create:** Users
   - **Read:** Users
   - **Update:** Users
   - **Delete:** Users
5. Click **"Update"** to save

**⚠️ If you skip this step, you'll get 401 Unauthorized errors!**nauthorized" Error

The error you're seeing means either:

1. Collections don't exist with the right IDs
2. Collections don't have proper permissions

Follow this guide EXACTLY to fix it.

## 🚨 Quick Fix for "Unknown attribute: habit_id" Error

This error occurs because your Appwrite database collections are not set up yet. Here's how to fix it:

## 📋 Step-by-Step Database Setup

### 1. Go to Appwrite Console

Visit: https://cloud.appwrite.io/console

### 2. Navigate to Your Database

1. Select your project
2. Click on **"Databases"** in the sidebar
3. Click on your database

### 3. Create Collections

You need to create **exactly 3 collections** with these EXACT IDs:

#### Collection 1: `habits`

**Collection ID:** `6863c6de001fe39e0414` (Use this exact ID!)

**Attributes to add:**

- `user_id` - String, 255 characters, Required
- `title` - String, 255 characters, Required
- `description` - String, 1000 characters, Optional
- `frequency` - String, 50 characters, Required
- `streak_count` - Integer, Required, Default value: 0
- `last_completed` - DateTime, Optional
- `created_at` - DateTime, Required

#### Collection 2: `completions`

**Collection ID:** `6863c6de001fe39e0415` (Use this exact ID!)

**Attributes to add:**

- `user_id` - String, 255 characters, Required
- `habit_id` - String, 255 characters, Required
- `completed_at` - DateTime, Required

#### Collection 3: `users`

**Collection ID:** `6863c6de001fe39e0413` (This one already exists!)

**Attributes to add:**

- `accountId` - String, 255 characters, Required
- `name` - String, 255 characters, Required
- `email` - String, 255 characters, Required
- `avatar` - String, 500 characters, Optional

### 4. Set Permissions

For each collection, set these permissions:

- **Create:** Users
- **Read:** Users
- **Update:** Users
- **Delete:** Users

### 5. Verify Your Environment Variables

Make sure your `.env` file has:

```
EXPO_PUBLIC_HABITS_COLLECTION_ID=6863c6de001fe39e0414
EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID=6863c6de001fe39e0415
EXPO_PUBLIC_USERS_COLLECTION_ID=6863c6de001fe39e0413
```

## ✅ After Setup

Once you've created all collections with the correct attributes:

1. Restart your Expo app
2. Try completing a habit again
3. The sync should work without errors

## 💡 How the App Works

- **Offline First:** All data is saved locally first
- **Background Sync:** Data syncs with Appwrite when available
- **Error Handling:** App continues working even if sync fails

## 🔧 Troubleshooting

**Still getting errors?**

1. Check that collection IDs match exactly: `6863c6de001fe39e0414`, `6863c6de001fe39e0415`, `6863c6de001fe39e0413`
2. Verify all attributes are created with correct types
3. **CRITICAL:** Ensure permissions are set to "Users" for ALL operations (Create, Read, Update, Delete)
4. Check the browser console for detailed error messages
5. Make sure you're logged into Appwrite with a valid session

**401 Unauthorized Error?**

This means permissions are wrong. For each collection:

1. Go to Settings tab
2. Scroll to Permissions
3. Set ALL permissions (Create, Read, Update, Delete) to "Users"
4. Save and try again

**App working locally but not syncing?**

- This is normal! The app is designed to work offline
- Data will sync automatically once database is properly set up

## 📱 App Features

- ✨ Animated UI with smooth transitions
- 🌙 Dark mode support
- 📱 Responsive design for Android
- 🔄 Offline-first functionality
- 📊 Streak tracking
- 🎯 Habit completion tracking

Happy habit tracking! 🎉
