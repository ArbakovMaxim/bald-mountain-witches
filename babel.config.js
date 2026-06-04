module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Плагін reanimated має бути ОСТАННІМ у списку.
    plugins: ['react-native-reanimated/plugin'],
  };
};
