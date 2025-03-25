const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // 解决模块解析问题
    extraNodeModules: {
      'react-native-vendor-html': __dirname
    },
    // 确保babel可以正确处理所有文件
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // 增加缓存大小
  maxWorkers: 2,
  cacheStores: [],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config); 