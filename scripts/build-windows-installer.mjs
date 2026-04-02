import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const arch = process.argv[2] ?? 'x64';
const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolvePrepackagedDir() {
  const preferredPath = path.join(outDir, `PretextChat-win32-${arch}`);
  if (existsSync(preferredPath)) return preferredPath;

  const candidates = readdirSync(outDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().includes(`win32-${arch}`))
    .map((name) => path.join(outDir, name));

  if (candidates.length > 0) return candidates[0];

  throw new Error(`Unable to find a prepackaged Windows app for arch "${arch}" in ${outDir}`);
}

const builderArchFlag = arch === 'x64' ? '--x64' : arch === 'arm64' ? '--arm64' : null;

if (!builderArchFlag) {
  throw new Error(`Unsupported Windows build arch: ${arch}`);
}

run('npx', ['electron-forge', 'package', '--platform=win32', `--arch=${arch}`]);

const prepackagedDir = resolvePrepackagedDir();

run('npx', [
  'electron-builder',
  '--win',
  'nsis',
  'portable',
  builderArchFlag,
  '--config',
  'electron-builder.yml',
  '--prepackaged',
  prepackagedDir,
  '--publish',
  'never',
]);
