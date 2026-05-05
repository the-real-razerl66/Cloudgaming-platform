import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build mode
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'CloudGamingClient',
          fileName: (format) => `cloud-gaming-client.${format}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }

  // Example app mode for local development
  return {
    root: 'examples',
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: {
      outDir: '../dist-example',
      emptyOutDir: true,
    },
  };
});
