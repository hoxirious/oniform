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
                index: './index.html',
                readme: './readme.html',
                faq: './faq.html',
                client: './src/index.ts', // Outputs as dist/client.js
            },
            output: {
                entryFileNames: '[name].js', // e.g., client.js
                chunkFileNames: 'chunks/[name].js',
                assetFileNames: 'assets/[name].[ext]', // e.g., assets/minus.svg
            },
        },
        emptyOutDir: true,
    },
    publicDir: 'src/public', // Copies src/public/ to dist/
});

