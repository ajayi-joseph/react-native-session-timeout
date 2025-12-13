import type {
  SessionTimeoutConfig,
  SessionTimeoutState,
  SessionTimeoutControls,
  SessionTimeoutContextValue,
} from '../types';

describe('Type definitions', () => {
  it('should have correct SessionTimeoutConfig structure', () => {
    const config: SessionTimeoutConfig = {
      timeout: 300000,
      onTimeout: () => {},
    };

    expect(config).toBeDefined();
    expect(typeof config.timeout).toBe('number');
    expect(typeof config.onTimeout).toBe('function');
  });

  it('should allow optional properties in SessionTimeoutConfig', () => {
    const config: SessionTimeoutConfig = {
      timeout: 300000,
      warningDuration: 60000,
      onTimeout: () => {},
      onWarning: (time) => {},
      enabled: true,
      pauseOnBackground: true,
      events: ['touch', 'scroll'],
    };

    expect(config.warningDuration).toBe(60000);
    expect(config.enabled).toBe(true);
    expect(config.pauseOnBackground).toBe(true);
    expect(config.events).toEqual(['touch', 'scroll']);
  });

  it('should have correct SessionTimeoutState structure', () => {
    const state: SessionTimeoutState = {
      isWarning: false,
      remainingTime: 300000,
      isActive: true,
    };

    expect(state).toBeDefined();
    expect(typeof state.isWarning).toBe('boolean');
    expect(typeof state.remainingTime).toBe('number');
    expect(typeof state.isActive).toBe('boolean');
  });

  it('should have correct SessionTimeoutControls structure', () => {
    const controls: SessionTimeoutControls = {
      resetTimer: () => {},
      pauseTimer: () => {},
      resumeTimer: () => {},
    };

    expect(controls).toBeDefined();
    expect(typeof controls.resetTimer).toBe('function');
    expect(typeof controls.pauseTimer).toBe('function');
    expect(typeof controls.resumeTimer).toBe('function');
  });

  it('should combine state and controls in SessionTimeoutContextValue', () => {
    const contextValue: SessionTimeoutContextValue = {
      isWarning: false,
      remainingTime: 300000,
      isActive: true,
      resetTimer: () => {},
      pauseTimer: () => {},
      resumeTimer: () => {},
    };

    expect(contextValue).toBeDefined();
    expect(typeof contextValue.isWarning).toBe('boolean');
    expect(typeof contextValue.remainingTime).toBe('number');
    expect(typeof contextValue.isActive).toBe('boolean');
    expect(typeof contextValue.resetTimer).toBe('function');
    expect(typeof contextValue.pauseTimer).toBe('function');
    expect(typeof contextValue.resumeTimer).toBe('function');
  });
});
