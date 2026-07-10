import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      // 1. Tambahkan ini agar aset dimuat relatif terhadap index.html
      base: './', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // 2. Pastikan alias mengarah ke folder src yang benar
          '@': path.resolve(__dirname, './src'), 
        }
      },
      // 3. Tambahkan konfigurasi build agar file tidak terpecah salah
      build: {
        outDir: 'dist',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      }
    };
});
