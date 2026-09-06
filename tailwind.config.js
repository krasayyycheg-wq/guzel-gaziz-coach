/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#111111',
        'bg-card': '#1A1A1A',
        'accent': '#FFD600',
        'accent-hover': '#FFE033',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B6B6B',
        'border': '#2A2A2A',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
