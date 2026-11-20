const PREFIX = '[react-native-session-timeout]';

/**
 * Returns true when `timeout` is a usable duration (a finite, positive number
 * of milliseconds). An invalid timeout must not start the native timer, since
 * it would otherwise fire `onTimeout` immediately or never.
 */
export function isValidTimeout(timeout: number): boolean {
  return typeof timeout === 'number' && Number.isFinite(timeout) && timeout > 0;
}

/**
 * Validates the provider's timing configuration and returns a list of
 * human-readable warning messages (empty when the config is valid). The
 * provider logs these in development to surface misconfiguration early.
 */
export function validateSessionConfig(
  timeout: number,
  warningDuration: number
): string[] {
  const warnings: string[] = [];

  if (!isValidTimeout(timeout)) {
    warnings.push(
      `${PREFIX} "timeout" must be a finite number greater than 0 (received ${String(
        timeout
      )}). The session timer will not start.`
    );
  }

  const warningIsValidNumber =
    typeof warningDuration === 'number' &&
    Number.isFinite(warningDuration) &&
    warningDuration >= 0;

  if (!warningIsValidNumber) {
    warnings.push(
      `${PREFIX} "warningDuration" must be a finite number greater than or equal to 0 (received ${String(
        warningDuration
      )}).`
    );
  } else if (isValidTimeout(timeout) && warningDuration >= timeout) {
    warnings.push(
      `${PREFIX} "warningDuration" (${warningDuration}) should be less than "timeout" (${timeout}); otherwise the warning triggers on the first poll.`
    );
  }

  return warnings;
}
