import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    restoreMocks: true,
    testTimeout: 15000,
    deps: {
      optimizer: {
        web: {
          include: [
            '@heroui/react',
            '@heroui/styles',
            '@internationalized/message',
            '@react-aria/i18n',
            'react-aria-components',
          ],
        },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'main',
          environment: 'node',
          include: ['tests/main/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'renderer',
          environment: 'jsdom',
          setupFiles: ['tests/renderer/setup.ts'],
          include: ['tests/renderer/**/*.test.tsx'],
          deps: {
            optimizer: {
              web: {
                enabled: true,
                include: [
                  '@heroui/react',
                  '@heroui/styles',
                  '@internationalized/message',
                  '@react-aria/i18n',
                  'react-aria-components',
                ],
              },
            },
          },
        },
      },
    ],
  },
});
