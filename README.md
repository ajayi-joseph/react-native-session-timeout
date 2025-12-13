# react-native-session-timeout

A comprehensive React Native library for handling user session timeouts with proper app lifecycle management, warning dialogs, and full Android 10+ compatibility.

## Features

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
| `events` | `string[]` | No | Custom events to track for activity (default: touch events) |

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

### Complete Logout Flow

The library provides a complete session timeout solution with three layers working together:

#### 1. Native Timer (Android/iOS)
Native modules maintain an accurate countdown timer that runs in the background:
```java
// Android: Handler-based timer
remainingTime = timeoutDuration - (currentTime - lastResetTime);
```

```swift
// iOS: Timer-based implementation
timer = Timer.scheduledTimer(timeInterval: 1.0, ...)
```

**Why native?** JavaScript timers can be unreliable when the JS thread is busy with animations, state updates, or heavy computations.

#### 2. Automatic State Synchronization
The library automatically syncs with the native timer every second (this happens internally - you don't need to do anything):
```tsx
// Internal implementation - handled automatically by the library
setInterval(() => {
  const remaining = await NativeSessionTimeout.getRemainingTime();
  
  if (remaining <= warningDuration) {
    onWarning?.(remaining); // Triggers your warning callback
  }
  
  if (remaining <= 0) {
    onTimeout(); // Triggers your logout callback
  }
}, 1000);
```

**You don't write this code** - the library does this automatically!

#### 3. Your Logout Handler (This is all you need to implement!)
Simply provide an `onTimeout` callback where you implement logout logic:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function App() {
  const navigation = useNavigation();

  const handleTimeout = async () => {
    // 1. Clear authentication tokens
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    
    // 2. Clear any cached user data
    await AsyncStorage.removeItem('userData');
    
    // 3. Reset app state
    // (use your state management solution: Redux, Zustand, etc.)
    
    // 4. Navigate to login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    
    // 5. Show user-friendly message
    Alert.alert(
      'Session Expired',
      'For your security, you have been logged out due to inactivity.',
      [{ text: 'OK' }]
    );
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

### Real-World Example: Banking App

```tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SessionTimeoutProvider } from 'react-native-session-timeout';

function BankingApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleTimeout = async () => {
    // Security-critical cleanup
    await secureStorage.clearAll();
    
    // Update UI
    setIsLoggedIn(false);
    
    // Log for security audit
    console.log('[Security] User session expired at:', new Date().toISOString());
    
    // Navigate to login
    navigation.navigate('Login');
    
    Alert.alert(
      'Session Expired',
      'You have been logged out due to inactivity',
      [{ text: 'Login Again', onPress: () => navigation.navigate('Login') }]
    );
  };

  const handleWarning = (remainingTime: number) => {
    // Optional: Log warning for analytics
    console.log(`Warning: ${Math.floor(remainingTime / 1000)}s remaining`);
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <SessionTimeoutProvider
      timeout={120000} // 2 minutes (banking apps use short timeouts)
      warningDuration={30000} // 30 second warning
      onTimeout={handleTimeout}
      onWarning={handleWarning}
      pauseOnBackground={true} // Pause when app backgrounds (security feature)
    >
      <BankingDashboard />
    </SessionTimeoutProvider>
  );
}
```

### Lifecycle Management

The library automatically handles app lifecycle transitions:

- **Active**: Timer runs normally, tracks user activity
- **Background**: Timer behavior depends on `pauseOnBackground` prop
- **Inactive**: Timer continues (iOS transition state)

### Activity Tracking

By default, the library tracks:
- Touch events (taps, scrolls, etc.)
- Navigation events
- Custom events you specify

### Native Modules

The library uses native modules to:
- Accurately track time even when JS thread is busy
- Handle app lifecycle events reliably
- Avoid Android 10+ background restrictions

## Differences from Similar Libraries

### vs. react-native-idle-timer

| Feature | react-native-idle-timer | react-native-session-timeout |
|---------|------------------------|------------------------------|
| **Purpose** | Prevent screen from sleeping | Automatically logout users |
| **Use Case** | Video players, navigation apps | Banking, healthcare, secure apps |
| **Security** | Not security-related | Security/compliance requirement |
| **Action** | Keeps screen ON | Logs user OUT |
| **Compliance** | N/A | HIPAA, PCI-DSS, SOC 2 |
| **Warning System** | No warnings | Countdown warnings |
| **Example** | Netflix keeping screen on | Bank app auto-logout |

**They solve opposite problems:**
- `react-native-idle-timer`: "Don't let my screen turn off during this video" 🎥
- `react-native-session-timeout`: "Automatically log me out if I'm not using the app" 🔒

### vs. react-native-user-inactivity

| Feature | react-native-user-inactivity | react-native-session-timeout |
|---------|------------------------------|------------------------------|
| Android 10+ Support | ❌ Issues | ✅ Full support |
| Native Linking | ⚠️ Manual required | ✅ Automatic |
| Lifecycle Handling | ❌ Limited | ✅ Comprehensive |
| Warning Dialogs | ❌ Manual | ✅ Built-in |
| Background Timer | ⚠️ External dependency | ✅ Native implementation |
| TypeScript | ⚠️ Basic | ✅ Full support |

## Use Cases

This library is essential for apps that:

- 🏦 **Banking & Finance** - Required by PCI-DSS compliance
- 🏥 **Healthcare** - HIPAA compliance for patient data protection
- 💼 **Enterprise** - Corporate security policies (ISO 27001)
- 🏛️ **Government** - Apps handling classified/sensitive information
- 🔐 **Any app with sensitive data** - Security best practice

Real-world examples:
- Chase Bank app logs out after 5 minutes
- Epic MyChart (healthcare) logs out after 10 minutes  
- Workday (HR/Payroll) logs out after 15 minutes
- Government portals auto-logout for security

## License

MIT
