import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
// ----------------------------------------------------------------------
var PORT = 8082;
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    // Must match the host in your production `VITE_SERVER_URL` when using the dev proxy below.
    var devProxyTarget = env.VITE_DEV_PROXY_TARGET || 'https://tickdash.tickmartsy.com';
    // The proxy only matters when the app calls the API on a relative path
    // (`VITE_SERVER_URL=/api`); with an absolute URL the browser goes straight to
    // the host and nothing hits the dev server. Enabling it conditionally keeps an
    // absolute-URL setup untouched.
    var useDevProxy = ((_b = env.VITE_SERVER_URL) !== null && _b !== void 0 ? _b : '').startsWith('/');
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
