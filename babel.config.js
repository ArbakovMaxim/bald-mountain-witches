module.exports = function (api) {
  api.cache(true);
  return {
    // У SDK 53 babel-preset-expo сам підключає плагін reanimated/worklets.
    // Дублювати його вручну НЕ можна — це ламає worklets у рантаймі (краш на старті).
    presets: ['babel-preset-expo'],
  };
};
