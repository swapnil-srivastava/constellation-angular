// Writes public/sdk-config.json from sdk-config.template.json and .env (or real env vars).
// The generated file is gitignored, so connection details never reach the repo.
// Note: whatever ends up in sdk-config.json is served to the browser.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const allowMissing = process.argv.includes('--allow-missing');

const env = { ...process.env };
const envFile = resolve(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trimStart().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const required = ['PEGA_SERVER_URL', 'PEGA_MASHUP_CLIENT_ID'];
const missing = required.filter(k => !env[k]);
if (missing.length) {
  const msg = `Missing ${missing.join(', ')}. Copy apps/demo/.env.example to apps/demo/.env and fill it in.`;
  if (!allowMissing) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(`${msg} Writing a placeholder sdk-config.json.`);
}

const template = readFileSync(resolve(root, 'sdk-config.template.json'), 'utf8');
const output = template.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => JSON.stringify(env[key] ?? '').slice(1, -1));
JSON.parse(output); // fail fast on invalid JSON
writeFileSync(resolve(root, 'public/sdk-config.json'), output);
console.log('Wrote public/sdk-config.json');
