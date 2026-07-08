export interface BiometricConfig {
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
}

export type BiometricAuthenticator = (
  config?: BiometricConfig
) => Promise<boolean>;

export interface SessionTimeoutConfig {
  timeout: number;
  warningDuration?: number;
  onTimeout: () => void;
  onWarning?: (remainingTime: number) => void;
  enabled?: boolean;
  pauseOnBackground?: boolean;
  /**
   * When true, returning to the app while the session is in the warning
   * state (or after it expired in the background) triggers a biometric
   * prompt before the session is resumed.
   */
  requireBiometricOnResume?: boolean;
  /** Text shown on the biometric prompt. */
  biometricConfig?: BiometricConfig;
  /**
   * Custom authenticator. If omitted, the library auto-detects
   * `react-native-biometrics` or `expo-local-authentication`.
   * Must resolve `true` on successful authentication.
   */
  biometricAuthenticator?: BiometricAuthenticator;
  /** Called when biometric re-authentication succeeds. */
  onBiometricSuccess?: () => void;
  /** Called when biometric re-authentication fails or is cancelled. */
  onBiometricFailed?: () => void;
}

export interface SessionTimeoutState {
  isWarning: boolean;
  remainingTime: number;
  isActive: boolean;
  /** True while a biometric re-authentication prompt is in progress. */
  isAuthenticating?: boolean;
}

export interface SessionTimeoutControls {
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export type SessionTimeoutContextValue = SessionTimeoutState &
  SessionTimeoutControls;
