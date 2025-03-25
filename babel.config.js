module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 确保Babel可以正确处理所有依赖
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console']
    }
  }
}; 