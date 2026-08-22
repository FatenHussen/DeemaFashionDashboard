import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// ----------------------------------------------------------------------

const PORT = 8082;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // API host only (e.g. http://127.0.0.1:8000). The browser already requests `/api/...`;
  // if this value also ends with `/api`, the proxy forwards to `/api/api/...` and Laravel 404s.
  const devProxyTarget = (env.VITE_DEV_PROXY_TARGET || 'https://tickdash.tickmartsy.com').replace(
    /\/api\/?$/,
    ''
  );
  // The proxy only matters when the app calls the API on a relative path
  // (`VITE_SERVER_URL=/api`); with an absolute URL the browser goes straight to
  // the host and nothing hits the dev server. Enabling it conditionally keeps an
  // absolute-URL setup untouched.
  const useDevProxy = (env.VITE_SERVER_URL ?? '').startsWith('/');

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
  server: useDevProxy
    ? {
        proxy: {
          '/api': {
            target: devProxyTarget,
            changeOrigin: true,
            secure: true,
          },
        },
      }
    : undefined,
  preview: { port: PORT, host: true },
  };
});
