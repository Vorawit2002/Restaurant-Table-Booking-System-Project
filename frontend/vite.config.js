import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: 'public',
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        login: resolve(__dirname, 'public/login.html'),
        register: resolve(__dirname, 'public/register.html'),
        booking: resolve(__dirname, 'public/booking.html'),
        myBookings: resolve(__dirname, 'public/my-bookings.html'),
        admin: resolve(__dirname, 'public/admin.html'),
        adminTables: resolve(__dirname, 'public/admin-tables.html'),
        adminBookings: resolve(__dirname, 'public/admin-bookings.html'),
      },
    },
  },
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
