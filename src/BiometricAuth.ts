import type { BiometricAuthenticator, BiometricConfig } from './types';

const DEFAULT_TITLE = 'Re-authenticate to continue';
const DEFAULT_CANCEL = 'Cancel';

/**
 * Resolves a default biometric authenticator from optional peer
 * dependencies. Tries `react-native-biometrics` first, then
 * `expo-local-authentication`. Returns null when neither is installed.
 */
export function resolveDefaultAuthenticator(): BiometricAuthenticator | null {
  // react-native-biometrics
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-biometrics');
    const ReactNativeBiometrics = mod?.default ?? mod;
    if (ReactNativeBiometrics) {
      return async (config?: BiometricConfig) => {
        const rnBiometrics = new ReactNativeBiometrics({
          allowDeviceCredentials: true,
        });
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: config?.title ?? DEFAULT_TITLE,
          cancelButtonText: config?.cancelLabel ?? DEFAULT_CANCEL,
        });
        return success === true;
      };
    }
  } catch {
    // not installed - fall through
  }

  // expo-local-authentication
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LocalAuthentication = require('expo-local-authentication');
    if (LocalAuthentication?.authenticateAsync) {
      return async (config?: BiometricConfig) => {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: config?.title ?? DEFAULT_TITLE,
          cancelLabel: config?.cancelLabel ?? DEFAULT_CANCEL,
        });
        return result?.success === true;
      };
    }
  } catch {
    // not installed - fall through
  }

  return null;
}

export const MISSING_AUTHENTICATOR_ERROR =
  '`requireBiometricOnResume` is enabled but no biometric authenticator is available. ' +
  'Install `react-native-biometrics` or `expo-local-authentication`, ' +
  'or pass a custom `biometricAuthenticator` prop.';
