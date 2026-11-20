import { isValidTimeout, validateSessionConfig } from '../validateConfig';

describe('isValidTimeout', () => {
  it('accepts finite positive numbers', () => {
    expect(isValidTimeout(1)).toBe(true);
    expect(isValidTimeout(300000)).toBe(true);
  });

  it('rejects zero, negatives, and non-finite values', () => {
    expect(isValidTimeout(0)).toBe(false);
    expect(isValidTimeout(-1)).toBe(false);
    expect(isValidTimeout(NaN)).toBe(false);
    expect(isValidTimeout(Infinity)).toBe(false);
  });

  it('rejects non-number values', () => {
    // @ts-expect-error intentionally passing a wrong type
    expect(isValidTimeout('300000')).toBe(false);
    // @ts-expect-error intentionally passing a wrong type
    expect(isValidTimeout(undefined)).toBe(false);
  });
});

describe('validateSessionConfig', () => {
  it('returns no warnings for a valid config', () => {
    expect(validateSessionConfig(300000, 60000)).toEqual([]);
  });

  it('warns when timeout is not positive', () => {
    const warnings = validateSessionConfig(0, 60000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"timeout"');
  });

  it('warns when warningDuration is negative', () => {
    const warnings = validateSessionConfig(300000, -5);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"warningDuration"');
  });

  it('warns when warningDuration is greater than or equal to timeout', () => {
    const warnings = validateSessionConfig(1000, 1000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('should be less than');
  });

  it('does not emit the comparison warning when timeout itself is invalid', () => {
    const warnings = validateSessionConfig(-1, 5000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"timeout"');
  });

  it('can report multiple problems at once', () => {
    const warnings = validateSessionConfig(0, -5);
    expect(warnings).toHaveLength(2);
  });
});
