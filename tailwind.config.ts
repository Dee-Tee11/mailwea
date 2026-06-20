import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#7F77DD',
        'accent-dark': '#534AB7',
        'accent-light': '#EEEDFE',
      },
    },
  },
  plugins: [],
}
export default config
