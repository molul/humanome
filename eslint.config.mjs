// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    ignores: ['assets/primevuePresets/**/*.js']
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/prop-name-casing': 'off',
      'vue/html-self-closing': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'debug', 'table', 'info'] }],
      camelcase: 'off'
    }
  }
])
