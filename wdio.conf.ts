import 'dotenv/config';

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./test/specs/web/**/*.e2e.ts'],
  maxInstances: 1,
  capabilities: [{ browserName: 'chrome' }],
  logLevel: 'warn',
  baseUrl: process.env.CHEAPFLIGHTS_BASE_URL?.trim() || 'https://www.cheapflights.com.au/',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 90_000
  }
};
