const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const root = path.resolve(__dirname, '..');
const modules = path.join(__dirname, 'node_modules');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],
  
  resolver: {
    blockList: exclusionList([
      // Exclude parent node_modules to avoid duplicate React instances
      new RegExp(`^${escape(path.join(root, 'node_modules'))}\\/.*$`),
    ]),
    extraNodeModules: {
      'react': path.join(modules, 'react'),
      'react-native': path.join(modules, 'react-native'),
      '@babel/runtime': path.join(modules, '@babel/runtime'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
