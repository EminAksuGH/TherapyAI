/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite'in .env dosyasını otomatik yüklemesini sağlıyoruz
export default defineConfig(({ mode }) => {
    // Ortam değişkenlerini yükle
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        plugins: [react()],
        define: {
            'import.meta.env': JSON.stringify(process.env), // ✅ Doğru Çözüm
        }
    };
});
