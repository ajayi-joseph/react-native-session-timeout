/* eslint-disable @typescript-eslint/no-var-requires */
import type { BiometricAuthenticator } from '../types';

describe('resolveDefaultAuthenticator', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns null when no biometric library is installed', () => {
    const { resolveDefaultAuthenticator } = require('../BiometricAuth');
    expect(resolveDefaultAuthenticator()).toBeNull();
  });

  describe('with react-native-biometrics installed', () => {
    const simplePrompt = jest.fn();
    const constructorSpy = jest.fn();

    const loadWithMock = (): BiometricAuthenticator => {
      jest.doMock(
        'react-native-biometrics',
        () => ({
          __esModule: true,
          default: class MockRNBiometrics {
            simplePrompt = simplePrompt;
            constructor(opts: unknown) {
              constructorSpy(opts);
            }
          },
        }),
        { virtual: true }
      );
      const { resolveDefaultAuthenticator } = require('../BiometricAuth');
      const authenticator = resolveDefaultAuthenticator();
      expect(authenticator).not.toBeNull();
      return authenticator;
    };

    beforeEach(() => {
      simplePrompt.mockReset();
      constructorSpy.mockReset();
    });

    it('maps config to simplePrompt and returns true on success', async () => {
      simplePrompt.mockResolvedValue({ success: true });
      const authenticator = loadWithMock();

      const result = await authenticator({
        title: 'Re-authenticate to continue',
        cancelLabel: 'Log out',
      });

      expect(result).toBe(true);
      expect(constructorSpy).toHaveBeenCalledWith({
        allowDeviceCredentials: true,
      });
      expect(simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Re-authenticate to continue',
        cancelButtonText: 'Log out',
      });
    });

    it('returns false when the prompt is cancelled', async () => {
      simplePrompt.mockResolvedValue({ success: false });
      const authenticator = loadWithMock();

      expect(await authenticator()).toBe(false);
      expect(simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Re-authenticate to continue',
        cancelButtonText: 'Cancel',
      });
    });
  });

  describe('with expo-local-authentication installed', () => {
    const authenticateAsync = jest.fn();

    const loadWithMock = (): BiometricAuthenticator => {
      // Ensure react-native-biometrics is treated as not installed
      jest.doMock(
        'react-native-biometrics',
        () => {
          throw new Error('module not installed');
        },
        { virtual: true }
      );
      jest.doMock(
        'expo-local-authentication',
        () => ({ authenticateAsync }),
        { virtual: true }
      );
      const { resolveDefaultAuthenticator } = require('../BiometricAuth');
      const authenticator = resolveDefaultAuthenticator();
      expect(authenticator).not.toBeNull();
      return authenticator;
    };

    beforeEach(() => {
      authenticateAsync.mockReset();
    });

    it('maps config to authenticateAsync and returns true on success', async () => {
      authenticateAsync.mockResolvedValue({ success: true });
      const authenticator = loadWithMock();

      const result = await authenticator({
        title: 'Unlock',
        cancelLabel: 'Log out',
      });

      expect(result).toBe(true);
      expect(authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Unlock',
        cancelLabel: 'Log out',
      });
    });

    it('returns false when authentication fails', async () => {
      authenticateAsync.mockResolvedValue({ success: false });
      const authenticator = loadWithMock();

      expect(await authenticator()).toBe(false);
    });

    it('returns false on a malformed result', async () => {
      authenticateAsync.mockResolvedValue(undefined);
      const authenticator = loadWithMock();

      expect(await authenticator()).toBe(false);
    });
  });
});
