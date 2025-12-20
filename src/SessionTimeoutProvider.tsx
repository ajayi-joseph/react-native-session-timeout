import React, { useEffect, useState, useRef, PropsWithChildren } from 'react';
import {
  AppState,
  AppStateStatus,
  PanResponder,
  View,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});

import { SessionTimeoutContext } from './SessionTimeoutContext';
import NativeSessionTimeout from './NativeModule';
import type { SessionTimeoutConfig } from './types';

export function SessionTimeoutProvider({
  children,
  timeout,
  warningDuration = 60000,
  onTimeout,
  onWarning,
  enabled = true,
  pauseOnBackground = false,
}: PropsWithChildren<SessionTimeoutConfig>) {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);
  const [isActive, setIsActive] = useState(enabled);

  const warningTriggeredRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Store ALL state setters and props in refs to avoid stale closures
  const stateRef = useRef({
    setRemainingTime,
    setIsWarning,
    setIsActive,
    timeout,
    warningDuration,
    onTimeout,
    onWarning,
  });

  // Update refs on every render
  stateRef.current = {
    setRemainingTime,
    setIsWarning,
    setIsActive,
    timeout,
    warningDuration,
    onTimeout,
    onWarning,
  };

  // Poll function - extracted so we can call it immediately
  const pollRemainingTime = async () => {
    try {
      const remaining = await NativeSessionTimeout.getRemainingTime();
      const {
        setRemainingTime: setRemaining,
        setIsWarning: setWarning,
        setIsActive: setActive,
        warningDuration: wd,
        onWarning: ow,
        onTimeout: ot,
      } = stateRef.current;

      setRemaining(remaining);

      if (remaining <= wd && remaining > 0) {
        if (!warningTriggeredRef.current) {
          warningTriggeredRef.current = true;
          setWarning(true);
          ow?.(remaining);
        }
      }

      if (remaining <= 0) {
        setWarning(false);
        setActive(false);
        ot();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error polling:', error);
    }
  };

  // Start polling - polls immediately, then every second
  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll immediately to avoid 20->18 skip
    pollRemainingTime();

    // Then poll every second
    intervalRef.current = setInterval(pollRemainingTime, 1000);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Timer controls

  const startTimer = React.useCallback(async () => {
    try {
      await NativeSessionTimeout.startTimer(stateRef.current.timeout);
      stateRef.current.setIsActive(true);
      stateRef.current.setIsWarning(false);
      warningTriggeredRef.current = false;
      startPolling();
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, [startPolling]);

  const resetTimer = React.useCallback(async () => {
    try {
      await NativeSessionTimeout.resetTimer();
      stateRef.current.setRemainingTime(stateRef.current.timeout);
      stateRef.current.setIsWarning(false);
      warningTriggeredRef.current = false;
      stateRef.current.setIsActive(true);
      startPolling();
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  }, [startPolling]);

  const pauseTimer = React.useCallback(async () => {
    try {
      await NativeSessionTimeout.pauseTimer();
      stateRef.current.setIsActive(false);
      stopPolling();
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }, [stopPolling]);

  const resumeTimer = React.useCallback(async () => {
    try {
      await NativeSessionTimeout.resumeTimer();
      stateRef.current.setIsActive(true);
      startPolling();
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }, [startPolling]);

  // Store resetTimer in ref for PanResponder
  const resetTimerRef = useRef(resetTimer);
  resetTimerRef.current = resetTimer;

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          if (pauseOnBackground) {
            await resumeTimer();
          }
        } else if (
          appStateRef.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          if (pauseOnBackground) {
            await pauseTimer();
          }
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [pauseOnBackground, pauseTimer, resumeTimer]);

  // Initialize timer on mount
  useEffect(() => {
    if (enabled) {
      startTimer();
    }

    return () => {
      stopPolling();
      NativeSessionTimeout.stopTimer?.().catch?.(console.error);
    };
  }, [enabled, startTimer]);

  // Create pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimerRef.current();
        return false;
      },
    })
  ).current;

  const contextValue = {
    isWarning,
    remainingTime,
    isActive,
    resetTimer,
    pauseTimer,
    resumeTimer,
  };

  return (
    <SessionTimeoutContext.Provider value={contextValue}>
      <View style={styles.flex1} {...panResponder.panHandlers}>
        {children}
      </View>
    </SessionTimeoutContext.Provider>
  );
}
