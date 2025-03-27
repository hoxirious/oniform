import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
    plugins: [
        tailwindcss(),
        svgLoader(),
        cloudflare()
    ],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html',
                readme: './readme/index.html',
                faq: './faq/index.html',
            },
        },
        emptyOutDir: true,
    },
    publicDir: 'src/public', // Copies src/public/ to dist/
});

