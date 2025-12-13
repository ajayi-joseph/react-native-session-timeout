import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import {
  SessionTimeoutProvider,
  useSessionTimeout,
} from '../src';

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
    isWarning,
    remainingTime,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isActive,
  } = useSessionTimeout();

  const [eventLog, setEventLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  React.useEffect(() => {
    if (isWarning) {
      addLog('⚠️ Warning: Session expiring soon!');
    }
  }, [isWarning]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>React Native Session Timeout</Text>
          <Text style={styles.subtitle}>Example App</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Session Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isActive ? '#4CAF50' : '#F44336' },
              ]}
            />
            <Text style={styles.statusText}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Text style={styles.timerText}>
            Time Remaining: {Math.floor(remainingTime / 1000)}s
          </Text>
          {isWarning && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ Session expiring soon!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton]}
              onPress={() => {
                resetTimer();
                addLog('✅ Timer reset');
              }}>
              <Text style={styles.controlButtonText}>Reset Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.secondaryButton]}
              onPress={() => {
                pauseTimer();
                addLog('⏸️ Timer paused');
              }}
              disabled={!isActive}>
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.secondaryButton]}
              onPress={() => {
                resumeTimer();
                addLog('▶️ Timer resumed');
              }}
              disabled={isActive}>
              <Text style={styles.controlButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.sectionTitle}>Event Log</Text>
          {eventLog.length === 0 ? (
            <Text style={styles.emptyLog}>
              Interact with the controls to see events
            </Text>
          ) : (
            eventLog.map((log, index) => (
              <Text key={index} style={styles.logEntry}>
                {log}
              </Text>
            ))
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ How it works</Text>
          <Text style={styles.infoText}>
            • Session timeout: 2 minutes{'\n'}
            • Warning appears: 30 seconds before timeout{'\n'}
            • Touch anywhere to reset the timer{'\n'}
            • App handles background/foreground automatically
          </Text>
        </View>
      </ScrollView>

      <WarningDialog />
    </SafeAreaView>
  );
}

export default function App() {
  const handleTimeout = () => {
    console.log('Session timed out! User should be logged out.');
  };

  const handleWarning = (remainingTime: number) => {
    console.log(`Warning: ${remainingTime}ms remaining`);
  };

  return (
    <SessionTimeoutProvider
      timeout={120000} // 2 minutes
      warningDuration={30000} // 30 seconds warning
      onTimeout={handleTimeout}
      onWarning={handleWarning}
      pauseOnBackground={false}>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
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
  statusLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 10,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  warningText: {
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  buttonRow: {
    gap: 10,
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 150,
  },
  emptyLog: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logEntry: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 22,
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
