// Runs the selected suites and regenerates a clean Allure report for this invocation.
const { mkdirSync, rmSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  ensureReportDirectories,
  printTestCaseSummary,
  reportDirectory,
  screenshotDirectory
} = require('./test-report-utils.cjs');

const projectRoot = path.resolve(__dirname, '..');
const resultsDirectory = path.join(reportDirectory, 'allure-results');
const htmlReportDirectory = path.join(reportDirectory, 'allure-report');
const suites = process.argv[2] === 'all' ? ['api', 'web'] : [process.argv[2]];
const forwardedArguments = process.argv.slice(3);

if (suites.some((suite) => !['api', 'web'].includes(suite))) {
  throw new Error('Choose a test suite: api, web, or all.');
}

if (!process.env.npm_execpath) {
  throw new Error('Run tests using the documented npm scripts so npm can be located.');
}

ensureReportDirectories();
rmSync(screenshotDirectory, { recursive: true, force: true });
ensureReportDirectories();
rmSync(resultsDirectory, { recursive: true, force: true });
mkdirSync(resultsDirectory, { recursive: true });

let testFailure = false;
for (const suite of suites) {
  const result = spawnSync(
    process.execPath,
    [
      process.env.npm_execpath,
      'run',
      `test:${suite}:run`,
      ...(forwardedArguments.length ? ['--', ...forwardedArguments] : [])
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, ALLURE_RESULTS_DIR: resultsDirectory }
    }
  );

  if (result.error) {
    console.error(`Could not start the ${suite} test suite: ${result.error.message}`);
    testFailure = true;
  } else if (result.status !== 0) {
    testFailure = true;
  }
}

const allureCli = path.join(projectRoot, 'node_modules', 'allure-commandline', 'bin', 'allure');
const reportResult = spawnSync(
  process.execPath,
  [allureCli, 'generate', resultsDirectory, '--clean', '-o', htmlReportDirectory],
  { cwd: projectRoot, stdio: 'inherit' }
);

if (reportResult.error || reportResult.status !== 0) {
  console.error(
    `Could not generate the Allure report${reportResult.error ? `: ${reportResult.error.message}` : '.'}`
  );
  process.exitCode = 1;
} else {
  console.log(`Allure report generated at ${path.join(htmlReportDirectory, 'index.html')}`);
  process.exitCode = testFailure ? 1 : 0;
}

printTestCaseSummary(resultsDirectory);
