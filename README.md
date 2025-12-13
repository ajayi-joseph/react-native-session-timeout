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

## Differences from react-native-user-inactivity

| Feature | react-native-user-inactivity | react-native-session-timeout |
|---------|------------------------------|------------------------------|
| Android 10+ Support | ❌ Issues | ✅ Full support |
| Native Linking | ⚠️ Manual required | ✅ Automatic |
| Lifecycle Handling | ❌ Limited | ✅ Comprehensive |
| Warning Dialogs | ❌ Manual | ✅ Built-in |
| Background Timer | ⚠️ External dependency | ✅ Native implementation |
| TypeScript | ⚠️ Basic | ✅ Full support |

## License

MIT
