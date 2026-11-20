import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { SessionTimeoutProvider } from '../SessionTimeoutProvider';
import { useSessionTimeout } from '../SessionTimeoutContext';
import NativeSessionTimeout from '../NativeModule';
import type { SessionTimeoutContextValue } from '../types';

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

const Noop = () => null;

const captureContext = (store: { current?: SessionTimeoutContextValue }) => {
  return function ContextProbe() {
    store.current = useSessionTimeout();
    return null;
  };
};

describe('SessionTimeoutProvider error handling', () => {
  let onTimeout: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    onTimeout = jest.fn();
    onError = jest.fn();
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onError with "poll" when polling fails', async () => {
    const error = new Error('poll failed');
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockRejectedValue(
      error
    );

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={onTimeout}
        onError={onError}
      >
        <Noop />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, 'poll');
    });
  });

  it('calls onError with "start" when starting fails', async () => {
    const error = new Error('start failed');
    (NativeSessionTimeout.startTimer as jest.Mock).mockRejectedValue(error);

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={onTimeout}
        onError={onError}
      >
        <Noop />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, 'start');
    });
  });

  it('calls onError with "reset" when resetting fails', async () => {
    const error = new Error('reset failed');
    (NativeSessionTimeout.resetTimer as jest.Mock).mockRejectedValue(error);
    const ctx: { current?: SessionTimeoutContextValue } = {};

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={onTimeout}
        onError={onError}
      >
        {React.createElement(captureContext(ctx))}
      </SessionTimeoutProvider>
    );

    await act(async () => {
      await ctx.current?.resetTimer();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, 'reset');
    });
  });

  it('calls onError with "pause" and "resume" when those fail', async () => {
    const pauseError = new Error('pause failed');
    const resumeError = new Error('resume failed');
    (NativeSessionTimeout.pauseTimer as jest.Mock).mockRejectedValue(
      pauseError
    );
    (NativeSessionTimeout.resumeTimer as jest.Mock).mockRejectedValue(
      resumeError
    );
    const ctx: { current?: SessionTimeoutContextValue } = {};

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={onTimeout}
        onError={onError}
      >
        {React.createElement(captureContext(ctx))}
      </SessionTimeoutProvider>
    );

    await act(async () => {
      await ctx.current?.pauseTimer();
    });
    await act(async () => {
      await ctx.current?.resumeTimer();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(pauseError, 'pause');
      expect(onError).toHaveBeenCalledWith(resumeError, 'resume');
    });
  });

  it('falls back to console.error when no onError is provided', async () => {
    const error = new Error('poll failed');
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockRejectedValue(
      error
    );

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={onTimeout}>
        <Noop />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    expect(onError).not.toHaveBeenCalled();
  });
});

describe('SessionTimeoutProvider config validation', () => {
  let onTimeout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    onTimeout = jest.fn();
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not start the native timer when timeout is invalid and warns', async () => {
    render(
      <SessionTimeoutProvider timeout={0} onTimeout={onTimeout}>
        <Noop />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(console.warn).toHaveBeenCalled();
    });
    expect(NativeSessionTimeout.startTimer).not.toHaveBeenCalled();
  });

  it('warns when warningDuration is not less than timeout', async () => {
    render(
      <SessionTimeoutProvider
        timeout={1000}
        warningDuration={2000}
        onTimeout={onTimeout}
      >
        <Noop />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('should be less than')
      );
    });
  });
});

describe('SessionTimeoutProvider pauseOnBackground disabled', () => {
  let onTimeout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    onTimeout = jest.fn();
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not pause or resume on app state changes when pauseOnBackground is false', async () => {
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={onTimeout}
        pauseOnBackground={false}
      >
        <Noop />
      </SessionTimeoutProvider>
    );

    const listener = addEventListenerSpy.mock.calls[0]?.[1];
    expect(listener).toBeDefined();

    await act(async () => {
      listener?.('background');
    });
    await act(async () => {
      listener?.('active');
    });

    expect(NativeSessionTimeout.pauseTimer).not.toHaveBeenCalled();
    expect(NativeSessionTimeout.resumeTimer).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });
});
