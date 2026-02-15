import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                problem: resolve(__dirname, 'problem.html'),
                stats: resolve(__dirname, 'stats.html'),
                login: resolve(__dirname, 'login.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
        },
    },
});
