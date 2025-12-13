import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-session-timeout' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const SessionTimeoutModule = NativeModules.SessionTimeoutModule
  ? NativeModules.SessionTimeoutModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface NativeSessionTimeoutModule {
  startTimer(timeout: number): Promise<void>;
  stopTimer(): Promise<void>;
  resetTimer(): Promise<void>;
  pauseTimer(): Promise<void>;
  resumeTimer(): Promise<void>;
  getRemainingTime(): Promise<number>;
  isTimerActive(): Promise<boolean>;
}

export default SessionTimeoutModule as NativeSessionTimeoutModule;
