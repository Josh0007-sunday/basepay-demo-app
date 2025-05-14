import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import inject from '@rollup/plugin-inject'
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }) as any,
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
