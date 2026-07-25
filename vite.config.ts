import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-core',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 50,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](?:recharts|victory-vendor|d3-[^\\/]+|decimal\.js-light|internmap)[\\/]/,
              priority: 40,
            },
            {
              name: 'mock-api',
              test: /node_modules[\\/](?:msw|@mswjs[\\/][^\\/]+|graphql|headers-polyfill|outvariant|until-async|is-node-process|path-to-regexp)[\\/]/,
              priority: 40,
            },
            {
              name: 'tanstack',
              test: /node_modules[\\/]@tanstack[\\/]/,
              priority: 30,
            },
            {
              name: 'base-ui',
              test: /node_modules[\\/]@base-ui[\\/]/,
              priority: 30,
            },
          ],
        },
      },
    },
  },
})
