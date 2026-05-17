const { spawnSync } = require('node:child_process');

const electronVersion = require('electron/package.json').version;
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(
  npx,
  [
    'electron-rebuild',
    '-v',
    electronVersion,
    '-w',
    'better-sqlite3',
    '--force',
    '--build-from-source',
  ],
  {
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
