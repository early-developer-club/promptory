/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'background': '#F9FAFB',
      'surface': '#FFFFFF',
      'primary': '#2563EB',
      'primary-hover': '#1D4ED8',
      'secondary': '#9CA3AF',
      'text-primary': '#1F2937',
      'text-secondary': '#6B7280',
      'border': '#E5E7EB',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}
