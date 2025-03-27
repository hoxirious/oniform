import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
    plugins: [
        tailwindcss(),
        svgLoader(),
    ],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html',
                readme: './readme.html',
                faq: './faq.html',
            },
        },
    },
});
