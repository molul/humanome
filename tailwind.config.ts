import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    './assets/primevuePresets/**/*.{js,vue,ts}'
  ],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.neutral,
        fav: 'rgba(251, 191, 36)',
        error: '#DC2626',
        borderLight1: colors.neutral[200],
        borderLight2: colors.neutral[300],
        borderDark1: colors.neutral[800],
        borderDark2: colors.neutral[700],
        bgLight1: colors.white,
        bgLight2: colors.neutral[50],
        bgDark1: colors.neutral[900],
        bgDark2: colors.neutral[800],
        bgDark3: colors.neutral[900]
      },
      fontFamily: {
        primary: ['Geist', 'sans-serif'],
        'primary-mono': ['GeistMono', 'sans-serif']
      },
      fontSize: {
        xxs: [
          '0.625rem',
          {
            lineHeight: '0.875rem'
          }
        ]
      },
      height: {
        'screen-dvh': '100dvh'
      },
      screens: {
        ms: '320px',
        mm: '375px',
        ml: '425px',
        // sm: '640px',
        tab: '768px',
        lt: '1024px',
        // xl: '1280px',
        ltl: '1440px',
        dt: '1920px',
        '4k': '2560px'
      }
    }
  },
  plugins: [require('tailwindcss-primeui')]
}
