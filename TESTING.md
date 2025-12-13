# Testing Guide

This project includes comprehensive test coverage for the React Native Session Timeout library.

## Test Structure

The tests are organized into three main test suites:

### 1. **SessionTimeoutProvider Tests** (`src/__tests__/SessionTimeoutProvider.test.tsx`)

Comprehensive tests for the main provider component covering:
- Component rendering and initialization
- Timer lifecycle (start, stop, reset, pause, resume)
- Warning triggers and timeout callbacks
- App lifecycle integration (foreground/background behavior)
- State management and updates
- User interaction handling
- Cleanup on unmount

### 2. **Context Hook Tests** (`src/__tests__/SessionTimeoutContext.test.tsx`)

Tests for the `useSessionTimeout` hook:
- Error handling when used outside provider
- Context value accessibility
- Initial state verification
- Control function exposure

### 3. **TypeScript Type Tests** (`src/__tests__/types.test.ts`)

Validates TypeScript type definitions:
- `SessionTimeoutConfig` interface
- `SessionTimeoutState` interface  
- `SessionTimeoutControls` interface
- `SessionTimeoutContextValue` type

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- SessionTimeoutProvider

# Run tests in watch mode
npm test -- --watch
```

## Test Configuration

The project uses:
- **Jest** - Testing framework
- **@testing-library/react-native** - React Native testing utilities
- **react-test-renderer** - React component testing

Configuration files:
- `jest.setup.js` - Global test setup and mocks
- `babel.config.js` - Babel configuration for JSX/TypeScript
- `package.json` - Jest configuration and scripts

## Mocking Strategy

The tests mock the following:
- Native modules (`SessionTimeoutModule`)
- Native event emitters
- Platform constants
- App state management
- PanResponder for touch interactions

## Coverage Goals

The library aims for high test coverage:
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Writing New Tests

When adding new features:

1. Add unit tests for the feature
2. Test edge cases and error handling  
3. Verify TypeScript types if applicable
4. Update this guide if adding new test patterns

## Common Test Patterns

### Testing Async Behavior

```typescript
await act(async () => {
  // Trigger async action
});

await waitFor(() => {
  // Assert expected outcome
});
```

### Testing Context

```typescript
let contextValue: any;
const TestComponent = () => {
  contextValue = useSessionTimeout();
  return null;
};

render(
  <SessionTimeoutProvider {...props}>
    <TestComponent />
  </SessionTimeoutProvider>
);

// Assert contextValue properties
```

### Mocking Native Modules

```typescript
jest.mock('../NativeModule', () => ({
  __esModule: true,
  default: {
    method: jest.fn(() => Promise.resolve(value)),
  },
}));
```

## Troubleshooting

### Common Issues

1. **Mock not found errors**: Ensure mocks are defined before imports
2. **Async timing issues**: Use `act()` and `waitFor()` properly
3. **Type errors**: Verify mock return types match actual implementations

### Debug Mode

Run tests with additional logging:

```bash
npm test -- --verbose
```

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Pre-commit hooks  
- CI/CD pipeline builds

Ensure all tests pass before merging code.
