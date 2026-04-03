import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const arch = process.argv[2] ?? 'x64';
const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const packageJson = JSON.parse(await import(path.join(rootDir, 'package.json'), { with: { type: 'json' } }).then((mod) => mod.default));

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

function resolveRepositoryInfo() {
  const repositoryUrl = typeof packageJson.repository === 'string' ? packageJson.repository : packageJson.repository?.url;

  if (!repositoryUrl) {
    throw new Error('Missing repository.url in package.json, cannot generate app-update.yml');
  }

  const normalizedUrl = repositoryUrl
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '');

  const match = normalizedUrl.match(/github\.com\/([^/]+)\/([^/]+)$/i);
  if (!match) {
    throw new Error(`Unsupported repository URL for auto-update: ${repositoryUrl}`);
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function writeAppUpdateConfig(prepackagedDir) {
  const { owner, repo } = resolveRepositoryInfo();
  const resourcesDir = path.join(prepackagedDir, 'resources');
  const updateConfigPath = path.join(resourcesDir, 'app-update.yml');
  const updaterCacheDirName = `${String(packageJson.name || 'app').toLowerCase()}-updater`;
  const appUpdateConfig = [
    'provider: github',
    `owner: ${owner}`,
    `repo: ${repo}`,
    `updaterCacheDirName: ${updaterCacheDirName}`,
    '',
  ].join('\n');

  mkdirSync(resourcesDir, { recursive: true });
  writeFileSync(updateConfigPath, appUpdateConfig, 'utf8');
}

const builderArchFlag = arch === 'x64' ? '--x64' : arch === 'arm64' ? '--arm64' : null;

if (!builderArchFlag) {
  throw new Error(`Unsupported Windows build arch: ${arch}`);
}

run('npx', ['electron-forge', 'package', '--platform=win32', `--arch=${arch}`]);

const prepackagedDir = resolvePrepackagedDir();
writeAppUpdateConfig(prepackagedDir);

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
