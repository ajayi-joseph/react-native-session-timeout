/* eslint-env jest */
// This file runs before the react-native preset loads
// Mock PanResponder before it's required by any component

global.mockPanResponderCreate = jest.fn(() => ({
  panHandlers: {
    onStartShouldSetPanResponder: jest.fn(() => false),
    onMoveShouldSetPanResponder: jest.fn(() => false),
    onPanResponderGrant: jest.fn(),
    onPanResponderMove: jest.fn(),
    onPanResponderRelease: jest.fn(),
    onPanResponderTerminate: jest.fn(),
  },
}));
