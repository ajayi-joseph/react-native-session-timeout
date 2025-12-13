// Mock TurboModuleRegistry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  return {
    getEnforcing: jest.fn(() => ({
      getConstants: () => ({
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 72, patch: 0 },
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isMacCatalyst: false,
      }),
    })),
    get: jest.fn(),
  };
});

// Mock NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  SessionTimeoutModule: {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock PanResponder
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {},
  })),
}));

// Mock AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  currentState: 'active',
}));

// Patch react-native PanResponder after module loads
const RN = require('react-native');
Object.defineProperty(RN, 'PanResponder', {
  value: {
    create: global.mockPanResponderCreate,
  },
  writable: true,
  configurable: true,
});

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
