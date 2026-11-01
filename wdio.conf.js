// WebdriverIO setup for isolated Cheapflights browser tests and failure artifacts.
require('dotenv/config');
const { browser } = require('@wdio/globals');
const { addAttachment } = require('@wdio/allure-reporter');

const { getScreenshotPath } = require('./scripts/test-report-utils.cjs');

exports.config = {
  runner: 'local',
  specs: ['./test/specs/web/**/*.e2e.js'],
  maxInstances: 1,
  capabilities: [{ browserName: 'chrome' }],
  logLevel: 'warn',
  baseUrl: process.env.CHEAPFLIGHTS_BASE_URL?.trim() || 'https://www.cheapflights.com.au/',
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: './test_reports/allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: true
      }
    ]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 90_000
  },
  // Captures failures before restarting the session to isolate the next test.
  async afterTest(test, _context, result) {
    try {
      if (!result.passed && !result.skipped) {
        // Capture the failed page before reloadSession clears the browser state.
        const screenshotPath = getScreenshotPath(test);
        const screenshot = await browser.saveScreenshot(screenshotPath);
        if (screenshot.length === 0) {
          throw new Error(`WebdriverIO returned an empty failure screenshot for "${test.title}".`);
        }

        await addAttachment('Failure screenshot', screenshot, 'image/png');
        console.error(`Failure screenshot saved to ${screenshotPath}`);
      }
    } finally {
      await browser.reloadSession();
    }
  }
};
