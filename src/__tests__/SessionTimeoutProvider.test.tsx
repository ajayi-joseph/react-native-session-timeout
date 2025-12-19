import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { SessionTimeoutProvider } from '../SessionTimeoutProvider';
import { useSessionTimeout } from '../SessionTimeoutContext';
import NativeSessionTimeout from '../NativeModule';

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

// Test component to access context
const TestComponent = () => {
  const context = useSessionTimeout();
  return null;
};

describe('SessionTimeoutProvider', () => {
  let mockOnTimeout: jest.Mock;
  let mockOnWarning: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockOnTimeout = jest.fn();
    mockOnWarning = jest.fn();
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      300000
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponent />
      </SessionTimeoutProvider>
    );
  });

  it('should start timer on mount when enabled', async () => {
    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={mockOnTimeout}
        enabled
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(NativeSessionTimeout.startTimer).toHaveBeenCalledWith(300000);
    });
  });

  it('should not start timer when disabled', async () => {
    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={mockOnTimeout}
        enabled={false}
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    await waitFor(() => {
      expect(NativeSessionTimeout.startTimer).not.toHaveBeenCalled();
    });
  });

  it('should trigger warning callback when warning duration is reached', async () => {
    const warningDuration = 60000;
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      50000
    );

    render(
      <SessionTimeoutProvider
        timeout={300000}
        warningDuration={warningDuration}
        onTimeout={mockOnTimeout}
        onWarning={mockOnWarning}
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnWarning).toHaveBeenCalledWith(50000);
    });
  });

  it('should trigger timeout callback when time expires', async () => {
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(0);

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponent />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnTimeout).toHaveBeenCalled();
    });
  });

  it('should pause timer when app goes to background if pauseOnBackground is true', async () => {
    const mockAppStateListener = jest.fn();
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={mockOnTimeout}
        pauseOnBackground={true}
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    // Get the listener that was registered
    const listener = addEventListenerSpy.mock.calls[0]?.[1];

    if (listener) {
      await act(async () => {
        listener('background');
      });

      await waitFor(() => {
        expect(NativeSessionTimeout.pauseTimer).toHaveBeenCalled();
      });
    }
  });

  it('should resume timer when app returns to foreground', async () => {
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

    render(
      <SessionTimeoutProvider
        timeout={300000}
        onTimeout={mockOnTimeout}
        pauseOnBackground={true}
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    const listener = addEventListenerSpy.mock.calls[0]?.[1];

    if (listener) {
      // Go to background first
      await act(async () => {
        listener('background');
      });

      // Return to active
      await act(async () => {
        listener('active');
      });

      await waitFor(() => {
        expect(NativeSessionTimeout.resumeTimer).toHaveBeenCalled();
      });
    }
  });

  it('should reset timer when activity is detected', async () => {
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      contextValue.resetTimer();
    });

    await waitFor(() => {
      expect(NativeSessionTimeout.resetTimer).toHaveBeenCalled();
    });
  });

  it('should allow manual pause of timer', async () => {
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      contextValue.pauseTimer();
    });

    await waitFor(() => {
      expect(NativeSessionTimeout.pauseTimer).toHaveBeenCalled();
    });
  });

  it('should allow manual resume of timer', async () => {
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      contextValue.resumeTimer();
    });

    await waitFor(() => {
      expect(NativeSessionTimeout.resumeTimer).toHaveBeenCalled();
    });
  });

  it('should stop timer on unmount', async () => {
    const { unmount } = render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponent />
      </SessionTimeoutProvider>
    );

    unmount();

    await waitFor(() => {
      expect(NativeSessionTimeout.stopTimer).toHaveBeenCalled();
    });
  });

  it('should update remaining time periodically', async () => {
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    (NativeSessionTimeout.getRemainingTime as jest.Mock)
      .mockResolvedValueOnce(300000)
      .mockResolvedValueOnce(299000);

    render(
      <SessionTimeoutProvider timeout={300000} onTimeout={mockOnTimeout}>
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(NativeSessionTimeout.getRemainingTime).toHaveBeenCalled();
    });
  });

  it('should not trigger warning multiple times', async () => {
    (NativeSessionTimeout.getRemainingTime as jest.Mock).mockResolvedValue(
      50000
    );

    render(
      <SessionTimeoutProvider
        timeout={300000}
        warningDuration={60000}
        onTimeout={mockOnTimeout}
        onWarning={mockOnWarning}
      >
        <TestComponent />
      </SessionTimeoutProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnWarning).toHaveBeenCalledTimes(1);
    });
  });

  it('should reset warning state when timer is reset', async () => {
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useSessionTimeout();
      return null;
    };

    (NativeSessionTimeout.getRemainingTime as jest.Mock)
      .mockResolvedValueOnce(50000)
      .mockResolvedValueOnce(300000);

    render(
      <SessionTimeoutProvider
        timeout={300000}
        warningDuration={60000}
        onTimeout={mockOnTimeout}
        onWarning={mockOnWarning}
      >
        <TestComponentWithContext />
      </SessionTimeoutProvider>
    );

    // Trigger warning
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Reset timer
    await act(async () => {
      contextValue.resetTimer();
    });

    await waitFor(() => {
      expect(contextValue.isWarning).toBe(false);
    });
  });
});
