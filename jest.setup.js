/* eslint-env jest */
// Mock Dimensions first, before any other mocks
jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const Dimensions = {
    get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
    set: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };
  return Dimensions;
});

// Mock TurboModuleRegistry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  return {
    getEnforcing: jest.fn(() => ({
      getConstants: () => ({
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 83, patch: 0 },
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isMacCatalyst: false,
      }),
    })),
    get: jest.fn(),
  };
});

// Mock AppState before React Native
jest.mock('react-native/Libraries/AppState/AppState', () => {
  const mockListeners = new Map();
  return {
    currentState: 'active',
    addEventListener: jest.fn((event, handler) => {
      if (!mockListeners.has(event)) {
        mockListeners.set(event, []);
      }
      mockListeners.get(event).push(handler);
      return {
        remove: jest.fn(() => {
          const handlers = mockListeners.get(event) || [];
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }),
      };
    }),
    removeEventListener: jest.fn(),
    _mockListeners: mockListeners,
  };
});

// Mock NativeModules directly
const mockSessionTimeoutModule = {
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
  resetTimer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  getRemainingTime: jest.fn(() => Promise.resolve(120000)),
  isTimerActive: jest.fn(() => Promise.resolve(true)),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

// Mock react-native with PanResponder
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Set up NativeModules
  if (!RN.NativeModules) {
    RN.NativeModules = {};
  }
  RN.NativeModules.SessionTimeoutModule = mockSessionTimeoutModule;

  // Set up AppState
  const AppStateMock = require('react-native/Libraries/AppState/AppState');
  Object.defineProperty(RN, 'AppState', {
    get: () => AppStateMock,
    configurable: true,
  });

  // Set up PanResponder
  Object.defineProperty(RN, 'PanResponder', {
    value: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
    configurable: true,
  });

  return RN;
});

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock PanResponder
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {},
  })),
}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
