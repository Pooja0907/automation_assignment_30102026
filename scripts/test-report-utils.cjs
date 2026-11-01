// Shares report paths and deterministic failure-screenshot naming across runners.
const { createHash } = require('node:crypto');
const { mkdirSync, readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');

const reportDirectory = path.resolve(process.cwd(), 'test_reports');
const screenshotDirectory = path.join(reportDirectory, 'screenshots');

// Creates the shared report and screenshot directory if it is missing.
function ensureReportDirectories() {
  mkdirSync(screenshotDirectory, { recursive: true });
}

// Produces a readable, collision-resistant screenshot path for a failed test.
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

// Prints case-level results grouped by source spec using Allure's result metadata.
function printTestCaseSummary(resultsDirectory) {
  const resultFiles = readdirSync(resultsDirectory)
    .filter((file) => file.endsWith('-result.json'));
  const specs = new Map();

  for (const file of resultFiles) {
    const resultPath = path.join(resultsDirectory, file);
    const result = JSON.parse(readFileSync(resultPath, 'utf8'));
    const packageLabel = result.labels?.find((label) => label.name === 'package')?.value || '';
    const specMatch = packageLabel.match(/(?:^|\.)test\.specs\.(api|web)\.(.+)$/);
    const specName = specMatch
      ? `test/specs/${specMatch[1]}/${specMatch[2]}`
      : result.labels?.find((label) => label.name === 'suite')?.value || 'Unknown spec';
    const counts = specs.get(specName) || { passed: 0, failed: 0, skipped: 0 };

    if (result.status === 'passed') {
      counts.passed += 1;
    } else if (result.status === 'skipped') {
      counts.skipped += 1;
    } else {
      counts.failed += 1;
    }
    specs.set(specName, counts);
  }

  if (resultFiles.length === 0) {
    console.log('\nTest case summary: no Allure test results were produced.');
    return;
  }

  const rows = [...specs.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([specName, counts]) => ({ specName, ...counts }));
  const overall = rows.reduce((summary, row) => ({
    passed: summary.passed + row.passed,
    failed: summary.failed + row.failed,
    skipped: summary.skipped + row.skipped
  }), { passed: 0, failed: 0, skipped: 0 });
  const formatRow = ({ specName, passed, failed, skipped }) => {
    const count = passed + failed + skipped;
    const executed = passed + failed;
    const passRate = executed ? `${((passed / executed) * 100).toFixed(1)}%` : 'N/A';
    return `${specName}: ${passed} passed, ${failed} failed, ${skipped} skipped / ${count} total (${passRate} pass rate)`;
  };

  console.log('\nTest case summary by spec:');
  for (const row of rows) {
    console.log(`  ${formatRow(row)}`);
  }
  console.log(`Overall: ${formatRow({ specName: 'All specs', ...overall })}`);
}

module.exports = {
  ensureReportDirectories,
  getScreenshotPath,
  printTestCaseSummary,
  reportDirectory,
  screenshotDirectory
};
