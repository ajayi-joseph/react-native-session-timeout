const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders: [monorepoRoot],
  resolver: {
    // Block parent node_modules to avoid duplicate React instances
    blockList: [
      new RegExp(`${path.resolve(monorepoRoot, 'node_modules')}/react/.*`),
      new RegExp(`${path.resolve(monorepoRoot, 'node_modules')}/react-native/.*`),
    ],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
    ],
    extraNodeModules: {
      'react-native-session-timeout': monorepoRoot,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
