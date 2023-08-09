import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.glb', '**/*.gltf', '**/*.hdr'],
  server: {
    port: 8080,
    host: true,
  },
  base: '/maiz/',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]', // This line retains original filenames
      },
    },
  },
});
