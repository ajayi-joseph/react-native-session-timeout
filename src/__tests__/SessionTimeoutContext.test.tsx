import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useSessionTimeout } from '../SessionTimeoutContext';
import { SessionTimeoutProvider } from '../SessionTimeoutProvider';

// Mock the native module
jest.mock('../NativeModule', () => ({
  __esModule: true,
  default: {
    startTimer: jest.fn(() => Promise.resolve()),
    stopTimer: jest.fn(() => Promise.resolve()),
    resetTimer: jest.fn(() => Promise.resolve()),
    getRemainingTime: jest.fn(() => Promise.resolve(300000)),
    pauseTimer: jest.fn(() => Promise.resolve()),
    resumeTimer: jest.fn(() => Promise.resolve()),
  },
}));

describe('useSessionTimeout', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionTimeoutProvider timeout={300000} onTimeout={() => {}}>
      {children}
    </SessionTimeoutProvider>
  );

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSessionTimeout());
    }).toThrow('useSessionTimeout must be used within a SessionTimeoutProvider');

    consoleSpy.mockRestore();
  });

  it('should return context value when used within provider', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper });

    expect(result.current).toHaveProperty('isWarning');
    expect(result.current).toHaveProperty('remainingTime');
    expect(result.current).toHaveProperty('isActive');
    expect(result.current).toHaveProperty('resetTimer');
    expect(result.current).toHaveProperty('pauseTimer');
    expect(result.current).toHaveProperty('resumeTimer');
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper });

    expect(result.current.isWarning).toBe(false);
    expect(result.current.isActive).toBe(true);
    expect(typeof result.current.remainingTime).toBe('number');
  });

  it('should expose control functions', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper });

    expect(typeof result.current.resetTimer).toBe('function');
    expect(typeof result.current.pauseTimer).toBe('function');
    expect(typeof result.current.resumeTimer).toBe('function');
  });
});
