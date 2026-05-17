const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') {
    return;
  }

  const executableName = context.packager.executableName;
  const executablePath = path.join(context.appOutDir, executableName);
  const realExecutableName = `${executableName}.bin`;
  const realExecutablePath = path.join(context.appOutDir, realExecutableName);

  await fs.rm(realExecutablePath, { force: true });
  await fs.rename(executablePath, realExecutablePath);

  const wrapper = `#!/usr/bin/env bash
set -e

APP_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
exec "\${APP_DIR}/${realExecutableName}" --no-sandbox --disable-dev-shm-usage "$@"
`;

  await fs.writeFile(executablePath, wrapper, { mode: 0o755 });
  await fs.chmod(executablePath, 0o755);
  await fs.chmod(realExecutablePath, 0o755);
};
