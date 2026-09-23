import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'character-gallery.spec.ts',
  workers: 1,
  use: {
    headless: true,
  },
});
