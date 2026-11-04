// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // This React Compiler rule can't tell that Reanimated shared values (`x.value = 1`) and
    // expo-video players (`player.currentTime = 5`) are meant to be mutated, so it is turned off.
    rules: { 'react-hooks/immutability': 'off' },
  },
]);
