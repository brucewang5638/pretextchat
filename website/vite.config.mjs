import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        download: resolve(__dirname, 'download/index.html'),
        features: resolve(__dirname, 'features/index.html'),
        aiWorkspace: resolve(__dirname, 'features/ai-workspace/index.html'),
        multiInstanceAi: resolve(__dirname, 'features/multi-instance-ai/index.html'),
        sessionRecovery: resolve(__dirname, 'features/session-recovery/index.html'),
        compareBrowserTabs: resolve(__dirname, 'compare/browser-tabs-vs-pretextchat/index.html'),
        faq: resolve(__dirname, 'faq/index.html'),
        changelog: resolve(__dirname, 'changelog/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4174,
  },
});
