import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to avoid TypeScript errors with missing Node types
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // this ensures process.env.API_KEY works in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});