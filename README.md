# react-native-session-timeout

A comprehensive React Native library for **inactivity detection** and **idle app monitoring** with automatic session timeout management, customizable warning UI support, and full Android 10+ compatibility.

## Why This Library?

This library **detects user inactivity** and manages session expiration for security and compliance needs.

**Perfect for:**
- 🏦 **Banking/Finance Apps** - Auto-logout after inactivity (PCI-DSS, SOC2)
- 🏢 **Enterprise Apps** - Security policies requiring session timeouts
- 🛒 **E-commerce** - Expire shopping carts/sessions
- 🏥 **Healthcare Apps** - HIPAA compliance with automatic session termination
- 🔐 **Any app requiring security-based session management**

## Features

✅ **Inactivity & Idle Detection** - Automatically tracks user activity (taps, scrolls, swipes, gestures)  
✅ **Android 10+ Compatible** - No background timer issues  
✅ **Automatic Lifecycle Handling** - Properly handles app background/foreground transitions  
✅ **Built-in Warning Dialogs** - Countdown timer with customizable warning UI  
✅ **TypeScript Support** - Full type definitions included  
✅ **Zero Native Linking** - Works with autolinking  
✅ **Customizable** - Configure timeout duration, warning time, and callbacks  
✅ **Performant** - Uses native modules for accurate timekeeping

## Installation

```bash
npm install react-native-session-timeout
# or
yarn add react-native-session-timeout
```

### iOS

```bash
cd ios && pod install
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { SessionTimeoutProvider, useSessionTimeout } from 'react-native-session-timeout';

function App() {
  return (
    <SessionTimeoutProvider
      timeout={300000} // 5 minutes in milliseconds
      warningDuration={60000} // Show warning 1 minute before timeout
      onTimeout={() => {
        console.log('Session timed out!');
        // Handle logout or session expiry
      }}
      onWarning={(remainingTime) => {
        console.log(`Warning: ${remainingTime}ms remaining`);
      }}
    >
      <YourApp />
    </SessionTimeoutProvider>
  );
}
```

### Using the Hook

```tsx
import { useSessionTimeout } from 'react-native-session-timeout';

function YourComponent() {
  const {
    isWarning,
    remainingTime,
    resetTimer,
    pauseTimer,
    resumeTimer,
  } = useSessionTimeout();

  return (
    <View>
      {isWarning && (
        <View style={styles.warningBanner}>
          <Text>
            Session expiring in {Math.floor(remainingTime / 1000)} seconds
          </Text>
          <Button title="Stay Logged In" onPress={resetTimer} />
        </View>
      )}
      <YourContent />
    </View>
  );
}
```

### Custom Warning Dialog

```tsx
import React from 'react';
import { Modal, View, Text, Button } from 'react-native';
import { SessionTimeoutProvider, useSessionTimeout } from 'react-native-session-timeout';

function CustomWarningDialog() {
  const { isWarning, remainingTime, resetTimer } = useSessionTimeout();

  return (
    <Modal visible={isWarning} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Session Expiring</Text>
          <Text style={styles.message}>
            Your session will expire in {Math.floor(remainingTime / 1000)} seconds
          </Text>
          <Button title="Continue Session" onPress={resetTimer} />
        </View>
      </View>
    </Modal>
  );
}

function App() {
  return (
    <SessionTimeoutProvider
      timeout={300000}
      warningDuration={60000}
      onTimeout={handleTimeout}
    >
      <YourApp />
      <CustomWarningDialog />
    </SessionTimeoutProvider>
  );
}
```

## Inactivity Detection

The library **automatically detects user activity** and resets the timer on any interaction:

- ✅ **Taps** - Any touch on the screen
- ✅ **Scrolls** - ScrollView, FlatList, etc.
- ✅ **Swipes** - Gesture-based navigation
- ✅ **Gestures** - Any PanResponder-based interaction

**How it works:** The library wraps your app with a `PanResponder` that detects all touch events. When the user interacts with the app, the inactivity timer automatically resets, keeping the session alive. If the user is idle (no interaction) for the configured `timeout` duration, the `onTimeout` callback is triggered.

**Example Use Case:**
```tsx
// Logout user after 5 minutes of inactivity
<SessionTimeoutProvider
  timeout={300000} // 5 minutes
  onTimeout={() => {
    console.log('User has been idle for 5 minutes');
    // Perform logout
  }}
>
  <YourApp />
</SessionTimeoutProvider>
```

## API

### SessionTimeoutProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `timeout` | `number` | Yes | Total timeout duration in milliseconds |
| `warningDuration` | `number` | No | Show warning this many milliseconds before timeout (default: 60000) |
| `onTimeout` | `() => void` | Yes | Callback when session times out |
| `onWarning` | `(remainingTime: number) => void` | No | Callback when warning period starts |
| `enabled` | `boolean` | No | Enable/disable the timeout (default: true) |
| `pauseOnBackground` | `boolean` | No | Pause timer when app goes to background (default: false) |

### useSessionTimeout Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isWarning` | `boolean` | Whether in warning period |
| `remainingTime` | `number` | Milliseconds remaining until timeout |
| `resetTimer` | `() => void` | Reset the session timer |
| `pauseTimer` | `() => void` | Pause the timer |
| `resumeTimer` | `() => void` | Resume the timer |
| `isActive` | `boolean` | Whether timer is currently active |

## How It Works

The library uses native timers (Android/iOS) for accurate timekeeping and automatically calls your `onTimeout` callback when the session expires.

### Implementation Example

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionTimeoutProvider } from 'react-native-session-timeout';

function App() {
  const handleTimeout = async () => {
    try {
      // 1. Call logout endpoint to invalidate server session
      const token = await AsyncStorage.getItem('authToken');
      await fetch('https://api.example.com/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API fails
    }
    
    // 2. Clear local storage
    await AsyncStorage.removeItem('authToken');
    
    // 3. Navigate to login
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    
    // 4. Notify user
    Alert.alert('Session Expired', 'Please log in again');
  };

  return (
    <SessionTimeoutProvider
      timeout={300000} // 5 minutes
      warningDuration={60000} // 1 minute warning
      onTimeout={handleTimeout}
    >
      <YourApp />
    </SessionTimeoutProvider>
  );
}
```

### Key Features

- **Native Timers**: Accurate timing even when JS thread is busy
- **Automatic Lifecycle Handling**: Manages app background/foreground transitions
- **Warning System**: Configurable warning period before timeout
- **Activity Tracking**: Resets timer on user interaction

## Use Cases

This library is essential for apps that require automatic logout for security:

- 🏦 **Banking & Finance** - PCI-DSS compliance requirement
- 🏥 **Healthcare** - HIPAA compliance for patient data protection
- 💼 **Enterprise** - Corporate security policies (ISO 27001)
- 🏛️ **Government** - Classified/sensitive information handling
- 🔐 **Security-sensitive apps** - Auto-logout after inactivity
- 


## Demo
![Simulator Screen Recording - iPhone 15 Pro - 2025-12-13 at 23 45 30](https://github.com/user-attachments/assets/2fa81613-7457-4f06-8fd2-8bf60faf1c6a)



## License

MIT
