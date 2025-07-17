/**
 * Database Setup Instructions for Appwrite
 *
 * This file contains the required database schema for the Habit Tracker app.
 * You need to manually create these collections and attributes in your Appwrite console.
 *
 * Go to: https://cloud.appwrite.io/console -> Your Project -> Databases -> Your Database
 */

export const DATABASE_SCHEMA = {
  // Collection 1: habits
  habits: {
    collectionId: "6863c6de001fe39e0414", // Use this exact ID when creating the collection
    name: "habits", // Collection name for display
    attributes: [
      { key: "user_id", type: "string", size: 255, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 1000, required: false },
      { key: "frequency", type: "string", size: 50, required: true }, // 'daily' or 'weekly'
      { key: "streak_count", type: "integer", required: true, default: 0 },
      { key: "last_completed", type: "datetime", required: false },
      { key: "created_at", type: "datetime", required: true },
    ],
    indexes: [
      { key: "user_id", type: "key", attributes: ["user_id"] },
      { key: "frequency", type: "key", attributes: ["frequency"] },
    ],
  },

  // Collection 2: completions
  completions: {
    collectionId: "6863c6de001fe39e0415", // Use this exact ID when creating the collection
    name: "completions", // Collection name for display
    attributes: [
      { key: "user_id", type: "string", size: 255, required: true },
      { key: "habit_id", type: "string", size: 255, required: true },
      { key: "completed_at", type: "datetime", required: true },
    ],
    indexes: [
      { key: "user_id", type: "key", attributes: ["user_id"] },
      { key: "habit_id", type: "key", attributes: ["habit_id"] },
      { key: "user_habit", type: "key", attributes: ["user_id", "habit_id"] },
    ],
  },

  // Collection 3: users
  users: {
    collectionId: "6863c6de001fe39e0413", // Use this exact ID when creating the collection
    name: "users", // Collection name for display
    attributes: [
      { key: "accountId", type: "string", size: 255, required: true },
      { key: "name", type: "string", size: 255, required: true },
      { key: "email", type: "string", size: 255, required: true },
      { key: "avatar", type: "string", size: 500, required: false },
    ],
    indexes: [
      { key: "accountId", type: "unique", attributes: ["accountId"] },
      { key: "email", type: "key", attributes: ["email"] },
    ],
  },
};

export const SETUP_INSTRUCTIONS = `
🔧 APPWRITE DATABASE SETUP INSTRUCTIONS

1. Go to your Appwrite Console: https://cloud.appwrite.io/console
2. Select your project
3. Go to Databases → Your Database
4. Create the following collections:

📁 COLLECTION: habits
- Collection ID: habits
- Attributes:
  • user_id (String, 255 chars, Required)
  • title (String, 255 chars, Required)
  • description (String, 1000 chars, Optional)
  • frequency (String, 50 chars, Required)
  • streak_count (Integer, Required, Default: 0)
  • last_completed (DateTime, Optional)
  • created_at (DateTime, Required)

📁 COLLECTION: completions  
- Collection ID: completions
- Attributes:
  • user_id (String, 255 chars, Required)
  • habit_id (String, 255 chars, Required)
  • completed_at (DateTime, Required)

📁 COLLECTION: users
- Collection ID: users
- Attributes:
  • accountId (String, 255 chars, Required)
  • name (String, 255 chars, Required)
  • email (String, 255 chars, Required)
  • avatar (String, 500 chars, Optional)

5. Set permissions for each collection:
   - Create: Users
   - Read: Users
   - Update: Users
   - Delete: Users

6. Make sure your environment variables match:
   - EXPO_PUBLIC_HABITS_COLLECTION_ID=habits
   - EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID=completions
   - EXPO_PUBLIC_USERS_COLLECTION_ID=users
`;

export function logSetupInstructions() {
  console.log(SETUP_INSTRUCTIONS);
}
