const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0,
  outputDir: '.local/e2e-results', reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 940, height: 800 } } },
    { name: 'minimum-window', use: { viewport: { width: 360, height: 380 } } },
  ],
  webServer: { command: 'node scripts/test-server.cjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
});
