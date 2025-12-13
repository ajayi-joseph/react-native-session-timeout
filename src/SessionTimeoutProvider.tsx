import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  PropsWithChildren,
} from 'react';
import {
  AppState,
  AppStateStatus,
  NativeEventEmitter,
  NativeModules,
  PanResponder,
  View,
} from 'react-native';
import { SessionTimeoutContext } from './SessionTimeoutContext';
import NativeSessionTimeout from './NativeModule';
import type { SessionTimeoutConfig } from './types';

const eventEmitter = new NativeEventEmitter(NativeModules.SessionTimeoutModule);

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

  // Update remaining time periodically
  const updateRemainingTime = useCallback(async () => {
    try {
      const remaining = await NativeSessionTimeout.getRemainingTime();
      setRemainingTime(remaining);

      // Check if we should show warning
      if (remaining <= warningDuration && remaining > 0) {
        if (!warningTriggeredRef.current) {
          warningTriggeredRef.current = true;
          setIsWarning(true);
          onWarning?.(remaining);
        }
      }

      // Check if timeout occurred
      if (remaining <= 0) {
        setIsWarning(false);
        setIsActive(false);
        onTimeout();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error updating remaining time:', error);
    }
  }, [warningDuration, onWarning, onTimeout]);

  // Start the timer
  const startTimer = useCallback(async () => {
    try {
      await NativeSessionTimeout.startTimer(timeout);
      setIsActive(true);
      setIsWarning(false);
      warningTriggeredRef.current = false;

      // Start polling for remaining time
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(updateRemainingTime, 1000);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, [timeout, updateRemainingTime]);

  // Reset the timer
  const resetTimer = useCallback(async () => {
    try {
      await NativeSessionTimeout.resetTimer();
      setRemainingTime(timeout);
      setIsWarning(false);
      warningTriggeredRef.current = false;
      setIsActive(true);
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  }, [timeout]);

  // Pause the timer
  const pauseTimer = useCallback(async () => {
    try {
      await NativeSessionTimeout.pauseTimer();
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }, []);

  // Resume the timer
  const resumeTimer = useCallback(async () => {
    try {
      await NativeSessionTimeout.resumeTimer();
      setIsActive(true);
      if (!intervalRef.current) {
        intervalRef.current = setInterval(updateRemainingTime, 1000);
      }
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }, [updateRemainingTime]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground
        if (pauseOnBackground) {
          await resumeTimer();
        }
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to background
        if (pauseOnBackground) {
          await pauseTimer();
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [pauseOnBackground, pauseTimer, resumeTimer]);

  // Initialize timer
  useEffect(() => {
    if (enabled) {
      startTimer();
    } else {
      pauseTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      NativeSessionTimeout.stopTimer().catch(console.error);
    };
  }, [enabled, startTimer, pauseTimer]);

  // Create pan responder to detect user activity
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        resetTimer();
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
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {children}
      </View>
    </SessionTimeoutContext.Provider>
  );
}
