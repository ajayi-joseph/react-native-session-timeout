/**
 * Sample React Native App - Session Timeout Demo
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  SessionTimeoutProvider,
  useSessionTimeout,
} from 'react-native-session-timeout';

function WarningDialog() {
  const { isWarning, remainingTime, resetTimer } = useSessionTimeout();

  return (
    <Modal visible={isWarning} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>⚠️ Session Expiring</Text>
          <Text style={styles.dialogMessage}>
            Your session will expire in{'\n'}
            <Text style={styles.countdown}>
              {Math.floor(remainingTime / 1000)}
            </Text>{' '}
            seconds
          </Text>
          <TouchableOpacity style={styles.button} onPress={resetTimer}>
            <Text style={styles.buttonText}>Continue Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function AppContent() {
  const {
    remainingTime,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isActive,
    isWarning,
  } = useSessionTimeout();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Session Timeout Demo</Text>
          <Text style={styles.subtitle}>
            Timeout: 20 seconds • Warning: 10 seconds
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  styles.statusBanner,
                  {
                    backgroundColor: isActive
                      ? isWarning
                        ? '#FFA500'
                        : '#10B981'
                      : '#EF4444',
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isActive ? (isWarning ? 'Warning' : 'Active') : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Remaining Time:</Text>
            <Text style={styles.timeValue}>{formatTime(remainingTime)}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Warning Active:</Text>
            <Text style={styles.value}>{isWarning ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        {/* 
          Wrap controls in a View with onStartShouldSetResponder to prevent 
          touch events from bubbling up to the SessionTimeoutProvider's PanResponder.
          This ensures button taps only trigger their onPress, not resetTimer.
        */}
        <View style={styles.controls} onStartShouldSetResponder={() => true}>
          <Text style={styles.controlsTitle}>Manual Controls</Text>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <Text style={styles.controlButtonText}>🔄 Reset Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={pauseTimer}>
            <Text style={styles.controlButtonText}>⏸️ Pause Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={resumeTimer}>
            <Text style={styles.controlButtonText}>▶️ Resume Timer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works:</Text>
          <Text style={styles.infoText}>
            • Timer starts at 20 seconds{'\n'}• Warning appears at 10 seconds
            {'\n'}• Session expires at 0 seconds{'\n'}• Any interaction resets
            the timer{'\n'}• Test by waiting or using controls above
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Tip:</Text>
          <Text style={styles.tipText}>
            The control buttons are wrapped with onStartShouldSetResponder to
            prevent them from triggering the activity detector. In your app,
            wrap any UI that shouldn't reset the timer the same way.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            👆 Tap anywhere else to reset the timer
          </Text>
        </View>
      </ScrollView>
      <WarningDialog />
    </SafeAreaView>
  );
}

export default function App() {
  const handleTimeout = () => {
    Alert.alert(
      'Session Expired',
      'You have been logged out due to inactivity',
    );
    console.log('Session timed out!');
  };

  const handleWarning = (remainingTime: number) => {
    console.log(`Warning: ${remainingTime}ms remaining`);
  };

  return (
    <SessionTimeoutProvider
      timeout={20000}
      warningDuration={10000}
      onTimeout={handleTimeout}
      onWarning={handleWarning}
      pauseOnBackground={false}
    >
      <AppContent />
    </SessionTimeoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusBanner: {
    padding: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  controls: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  footer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F44336',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
