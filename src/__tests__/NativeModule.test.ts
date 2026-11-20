/* eslint-disable @typescript-eslint/no-require-imports */
// `require` with jest.isolateModules is the idiomatic way to re-evaluate the
// module under test against a per-case mock of `react-native`.
/**
 * These tests exercise the native-module resolution in src/NativeModule.ts,
 * including the Proxy fallback that throws a linking error when the native
 * side is not available. Each case re-requires the module with its own mock of
 * `react-native` so the module-level branch is evaluated fresh.
 */
describe('NativeModule resolution', () => {
  afterEach(() => {
    jest.dontMock('react-native');
    jest.resetModules();
  });

  it('returns the native module when it is linked', () => {
    const fakeNative = { getRemainingTime: jest.fn() };

    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        NativeModules: { SessionTimeoutModule: fakeNative },
        Platform: { select: (obj: Record<string, unknown>) => obj.default },
      }));

      const resolved = require('../NativeModule').default;
      expect(resolved).toBe(fakeNative);
    });
  });

  it('throws a linking error (iOS variant) when the native module is missing', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        NativeModules: {},
        Platform: {
          select: (obj: Record<string, unknown>) => obj.ios ?? obj.default,
        },
      }));

      const resolved = require('../NativeModule').default;
      expect(() => resolved.getRemainingTime()).toThrow(
        /doesn't seem to be linked/
      );
      expect(() => resolved.startTimer(1000)).toThrow(/pod install/);
    });
  });

  it('throws a linking error (default variant) when the native module is missing', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        NativeModules: {},
        Platform: { select: (obj: Record<string, unknown>) => obj.default },
      }));

      const resolved = require('../NativeModule').default;
      expect(() => resolved.resetTimer()).toThrow(/Expo Go/);
    });
  });
});
