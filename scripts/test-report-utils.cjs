const { createHash } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const path = require('node:path');

const reportDirectory = path.resolve(process.cwd(), 'test_reports');
const screenshotDirectory = path.join(reportDirectory, 'screenshots');

function ensureReportDirectories() {
  mkdirSync(screenshotDirectory, { recursive: true });
}

function getScreenshotPath(test) {
  const fullTitle = typeof test.fullTitle === 'function' ? test.fullTitle() : test.fullTitle || test.title;
  const title = String(fullTitle || 'failed-test');
  const hash = createHash('sha1').update(title).digest('hex').slice(0, 10);
  const fileTitle = title
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return path.join(screenshotDirectory, `web-${fileTitle || 'failed-test'}-${hash}.png`);
}

module.exports = {
  ensureReportDirectories,
  getScreenshotPath,
  reportDirectory,
  screenshotDirectory
};
