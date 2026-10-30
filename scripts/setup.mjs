import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const minimumNodeVersion = [18, 20, 0];
const currentNodeVersion = process.versions.node.split('.').map(Number);

if (compareVersions(currentNodeVersion, minimumNodeVersion) < 0) {
  throw new Error(
    `Node.js ${minimumNodeVersion.join('.')} or newer is required. Current version: ${process.versions.node}.`
  );
}

const projectRoot = process.cwd();
const envExample = join(projectRoot, '.env.example');
const envFile = join(projectRoot, '.env');

if (!existsSync(envExample)) {
  throw new Error('Cannot find .env.example. Run this command from the project root.');
}

if (!existsSync(envFile)) {
  copyFileSync(envExample, envFile);
  console.log('Created .env from .env.example.');
} else {
  console.log('Keeping existing .env.');
}

const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Could not locate npm. Run this setup using `npm run setup`.');
}

const install = spawnSync(process.execPath, [npmCli, 'ci'], { stdio: 'inherit' });

if (install.error) {
  throw install.error;
}

if (install.status !== 0) {
  process.exitCode = install.status ?? 1;
}

function compareVersions(left, right) {
  for (let index = 0; index < right.length; index += 1) {
    const difference = (left[index] ?? 0) - right[index];
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}
