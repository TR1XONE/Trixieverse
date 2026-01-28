# TrixieVerse Mobile App - API Integration Guide

## Setup

### 1. Install Required Package

```bash
cd mobile
npm install @react-native-async-storage/async-storage
```

### 2. Set Environment Variables

Create `.env` in root directory:
```
EXPO_PUBLIC_API_URL=https://api.trixieverse.com/api
```

Or for local development:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. API Service Usage

All screens now have API integration via the centralized `services/api.ts` service.

## Screen Updates

### LoginScreen
```tsx
import api from '../services/api';

const handleLogin = async () => {
  const response = await api.login(email, password);
  // Token automatically saved to AsyncStorage
  // navigation?.replace('Main');
};
```

### DashboardScreen
```tsx
import api from '../services/api';

const fetchPlayerData = async () => {
  const profile = await api.getProfile();
  setPlayerData({
    username: profile.username,
    rating: profile.rating,
    // ... other fields
  });
};
```

### LeaderboardScreen
```tsx
import api from '../services/api';

if (activeFilter === 'global') {
  const players = await api.getGlobalLeaderboard(100);
} else if (activeFilter === 'friends') {
  const players = await api.getFriendsLeaderboard(50);
}
```

### SocialScreen
```tsx
import api from '../services/api';

const activity = await api.getActivityFeed(10);
const friends = await api.getFriends();
```

### SettingsScreen
```tsx
import api from '../services/api';

const handleLogout = async () => {
  await api.logout();
  navigation?.replace('Login');
};
```

## Available API Methods

### Authentication
- `login(email, password)` - User login
- `register(email, password, username)` - User registration
- `logout()` - Logout and clear token

### User Profile
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update profile
- `linkAccount(gameName, tag)` - Link Wild Rift account

### Matches
- `getMatches(limit, offset)` - Get recent matches
- `getMatch(matchId)` - Get single match details
- `analyzeMatch(matchId)` - Get AI coach analysis

### Leaderboard
- `getGlobalLeaderboard(limit, offset)` - Global rankings
- `getFriendsLeaderboard(limit)` - Friends only
- `getRegionalLeaderboard(region, limit)` - Regional rankings
- `getUserRanking()` - User's current ranking

### Social
- `getActivityFeed(limit)` - Recent community activity
- `getFriends()` - User's friend list
- `addFriend(userId)` - Add a friend
- `removeFriend(userId)` - Remove a friend

### Coach
- `getCoachResponse(query)` - Get AI coach advice
- `getCoachMemories()` - Get coach memories
- `getCoachPersonality()` - Get personality settings
- `updateCoachPersonality(data)` - Update personality

### Achievements
- `getAchievements()` - Get unlocked achievements
- `getAchievementProgress()` - Get progress towards achievements

### Notifications
- `registerDeviceToken(token, platform)` - Register push notifications
- `getNotifications(limit)` - Get notifications
- `markNotificationAsRead(notificationId)` - Mark as read

## Error Handling

All API calls throw errors on failure. Wrap in try/catch:

```tsx
try {
  const data = await api.getProfile();
  setData(data);
} catch (error) {
  console.error('Failed to fetch:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Failed to load profile');
}
```

## Token Management

Tokens are automatically:
- ✅ Saved to AsyncStorage after login
- ✅ Loaded on app start
- ✅ Sent in Authorization headers
- ✅ Cleared on logout or 401 error

## Building the APK

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build Android APK locally
eas build --platform android --local

# Or use cloud build
eas build --platform android
```

## Testing with Expo Go

```bash
npx expo start

# Then scan QR code on your phone with Expo Go app
```

## Next Steps

1. ✅ API service created
2. ✅ Screens integrated with API imports
3. ✅ Environment variables set up
4. 🔄 Connect to real backend endpoints
5. 🔄 Test on device/simulator
6. 🔄 Build APK and deploy to Google Play

## Backend Requirements

Ensure your backend has these endpoints:

- `POST /api/auth/login` - Accept email, password
- `GET /api/account/profile` - Requires auth header
- `GET /api/leaderboard` - Global leaderboard with pagination
- `GET /api/leaderboard/friends` - Friends leaderboard
- `GET /api/social/activity` - Activity feed
- `GET /api/social/friends` - Friends list

See [server/routes](../../server/routes) for implementation details.
