import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { SessionTimeoutProvider } from '../SessionTimeoutProvider';
import { useSessionTimeout } from '../SessionTimeoutContext';
import NativeSessionTimeout from '../NativeModule';
import type { SessionTimeoutContextValue } from '../types';

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

const TestComponent = () => null;

type Listener = (state: string) => void | Promise<void>;

describe('Biometric re-authentication on resume (issue #28)', () => {
  let mockOnTimeout: jest.Mock;
  let mockOnBiometricSuccess: jest.Mock;
  let mockOnBiometricFailed: jest.Mock;
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockOnTimeout = jest.fn();
    mockOnBiometricSuccess = jest.fn();
    mockOnBiometricFailed = jest.fn();
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
    addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderProvider = (props: Record<string, unknown> = {}) => {
    let contextValue: SessionTimeoutContextValue | undefined;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    const utils = render(
      <SessionTimeoutProvider
        timeout={300000}
        warningDuration={60000}
        onTimeout={mockOnTimeout}
        {...props}
      >
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    return { ...utils, getContext: () => contextValue };
  };

  const triggerWarning = async () => {
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      50000
    );
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  };

  const getListener = (): Listener => {
    const listener = addEventListenerSpy.mock.calls[0]?.[1];
    expect(listener).toBeDefined();
    return listener;
  };

  const backgroundThenForeground = async (listener: Listener) => {
    await act(async () => {
      await listener('background');
    });
    await act(async () => {
      await listener('active');
    });
  };

  it('prompts for biometrics when returning during the warning state', async () => {
    const authenticator = jest.fn(() => Promise.resolve(true));

    renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
      biometricConfig: { title: 'Re-authenticate to continue' },
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(authenticator).toHaveBeenCalledWith({
        title: 'Re-authenticate to continue',
      });
    });
  });

  it('resets the session and calls onBiometricSuccess when auth succeeds', async () => {
    const authenticator = jest.fn(() => Promise.resolve(true));

    const { getContext } = renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
      onBiometricSuccess: mockOnBiometricSuccess,
      onBiometricFailed: mockOnBiometricFailed,
    });

    await triggerWarning();
    expect(getContext()?.isWarning).toBe(true);

    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(mockOnBiometricSuccess).toHaveBeenCalledTimes(1);
      expect(NativeSessionTimeout.resetTimer).toHaveBeenCalled();
      expect(getContext()?.isWarning).toBe(false);
      expect(getContext()?.isActive).toBe(true);
    });
    expect(mockOnBiometricFailed).not.toHaveBeenCalled();
  });

  it('deactivates the session and calls onBiometricFailed when auth fails', async () => {
    const authenticator = jest.fn(() => Promise.resolve(false));

    const { getContext } = renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
      onBiometricSuccess: mockOnBiometricSuccess,
      onBiometricFailed: mockOnBiometricFailed,
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(mockOnBiometricFailed).toHaveBeenCalledTimes(1);
      expect(getContext()?.isActive).toBe(false);
      expect(getContext()?.isWarning).toBe(false);
    });
    expect(mockOnBiometricSuccess).not.toHaveBeenCalled();
    expect(NativeSessionTimeout.stopTimer).toHaveBeenCalled();
  });

  it('treats an authenticator error as a failed authentication', async () => {
    const authenticator = jest.fn(() =>
      Promise.reject(new Error('sensor unavailable'))
    );

    const { getContext } = renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
      onBiometricFailed: mockOnBiometricFailed,
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(mockOnBiometricFailed).toHaveBeenCalledTimes(1);
      expect(getContext()?.isActive).toBe(false);
    });
  });

  it('fails safely when no authenticator is available', async () => {
    // No biometricAuthenticator prop, and neither react-native-biometrics
    // nor expo-local-authentication is installed in this environment.
    const { getContext } = renderProvider({
      requireBiometricOnResume: true,
      onBiometricFailed: mockOnBiometricFailed,
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(mockOnBiometricFailed).toHaveBeenCalledTimes(1);
      expect(getContext()?.isActive).toBe(false);
    });
  });

  it('does not prompt when requireBiometricOnResume is false', async () => {
    const authenticator = jest.fn(() => Promise.resolve(true));

    renderProvider({
      requireBiometricOnResume: false,
      biometricAuthenticator: authenticator,
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    expect(authenticator).not.toHaveBeenCalled();
  });

  it('does not prompt when the session never entered the warning state', async () => {
    const authenticator = jest.fn(() => Promise.resolve(true));

    renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
    });

    // No warning triggered - plenty of time remaining
    await backgroundThenForeground(getListener());

    expect(authenticator).not.toHaveBeenCalled();
  });

  it('exposes isAuthenticating in the context while the prompt is open', async () => {
    let resolveAuth: (v: boolean) => void = () => {};
    const authenticator = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveAuth = resolve;
        })
    );

    const { getContext } = renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
    });

    await triggerWarning();

    const listener = getListener();
    await act(async () => {
      await listener('background');
    });
    act(() => {
      listener('active');
    });

    await waitFor(() => {
      expect(getContext()?.isAuthenticating).toBe(true);
    });

    await act(async () => {
      resolveAuth(true);
    });

    await waitFor(() => {
      expect(getContext()?.isAuthenticating).toBe(false);
    });
  });

  it('does not stack concurrent biometric prompts', async () => {
    let resolveAuth: (v: boolean) => void = () => {};
    const authenticator = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveAuth = resolve;
        })
    );

    renderProvider({
      requireBiometricOnResume: true,
      biometricAuthenticator: authenticator,
    });

    await triggerWarning();

    const listener = getListener();
    await act(async () => {
      await listener('background');
    });
    // Two rapid foreground events while the first prompt is still open
    act(() => {
      listener('active');
    });
    act(() => {
      listener('background');
      listener('active');
    });

    await act(async () => {
      resolveAuth(true);
    });

    expect(authenticator).toHaveBeenCalledTimes(1);
  });

  it('takes priority over pauseOnBackground resume when warning is active', async () => {
    const authenticator = jest.fn(() => Promise.resolve(true));

    renderProvider({
      requireBiometricOnResume: true,
      pauseOnBackground: true,
      biometricAuthenticator: authenticator,
    });

    await triggerWarning();
    await backgroundThenForeground(getListener());

    await waitFor(() => {
      expect(authenticator).toHaveBeenCalledTimes(1);
    });
    // resumeTimer must NOT be used to bypass the biometric gate
    expect(NativeSessionTimeout.resumeTimer).not.toHaveBeenCalled();
  });
});
