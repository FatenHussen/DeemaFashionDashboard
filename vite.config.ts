import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// ----------------------------------------------------------------------

const PORT = 8082;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Must match the host in your production `VITE_SERVER_URL` when using the dev proxy below.
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || 'https://tickdash.tickmartsy.com';

  return {
  plugins: [
    react(),
    tailwindcss(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
      {
        find: '@',
        replacement: path.resolve(process.cwd(), 'src'),
      },
    ],
  },
  // server: {
  //   port: PORT,
  //   host: true,
  //   proxy: {
  //     '/api': {
  //       target: devProxyTarget,
  //       changeOrigin: true,
  //       secure: true,
  //     },
  //   },
  // },
  preview: { port: PORT, host: true },
  };
});
