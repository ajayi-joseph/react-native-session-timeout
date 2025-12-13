import React, { createContext, useContext } from 'react';
import type { SessionTimeoutContextValue } from './types';

export const SessionTimeoutContext = createContext<SessionTimeoutContextValue | null>(null);

export function useSessionTimeout(): SessionTimeoutContextValue {
  const context = useContext(SessionTimeoutContext);
  
  if (!context) {
    throw new Error(
      'useSessionTimeout must be used within a SessionTimeoutProvider'
    );
  }
  
  return context;
}
