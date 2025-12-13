export interface SessionTimeoutConfig {
  timeout: number;
  warningDuration?: number;
  onTimeout: () => void;
  onWarning?: (remainingTime: number) => void;
  enabled?: boolean;
  pauseOnBackground?: boolean;
  events?: string[];
}

export interface SessionTimeoutState {
  isWarning: boolean;
  remainingTime: number;
  isActive: boolean;
}

export interface SessionTimeoutControls {
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export type SessionTimeoutContextValue = SessionTimeoutState & SessionTimeoutControls;
