// When a PR changes the published package and its title is feat, fix, perf or
// breaking, the PR must raise packages/constellation-angular/package.json version
// by at least the matching semver step. Other PRs pass without a bump.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PKG_DIR = 'packages/constellation-angular/';
const PKG_JSON = `${PKG_DIR}package.json`;
const base = process.env.BASE_SHA;
const title = (process.env.PR_TITLE ?? '').trim();

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const parse = (v) => v.split('-')[0].split('.').map(Number);
const cmp = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};

const changed = sh(`git diff --name-only ${base}...HEAD`)
  .split('\n')
  .filter((f) => f.startsWith(PKG_DIR))
  .filter((f) => !f.endsWith('.md') && !f.endsWith('.spec.ts'));

const match = title.match(/^(\w+)(\([^)]*\))?(!)?:/);
const type = match?.[1];
const breaking = Boolean(match?.[3]);
const releasing = breaking || ['feat', 'fix', 'perf'].includes(type);

const baseVersion = JSON.parse(sh(`git show ${base}:${PKG_JSON}`)).version;
const headVersion = JSON.parse(readFileSync(PKG_JSON, 'utf8')).version;
const [maj, min, pat] = parse(baseVersion);

if (changed.length === 0 || !releasing) {
  const why = changed.length === 0 ? 'no package files changed' : `"${type}" does not release`;
  console.log(`No version bump needed (${why}). Version stays ${headVersion}.`);
  process.exit(0);
}

// Before 1.0.0 a breaking change raises the minor version, as npm's ^ ranges expect.
let required;
if (breaking) required = maj === 0 ? [0, min + 1, 0] : [maj + 1, 0, 0];
else if (type === 'feat') required = [maj, min + 1, 0];
else required = [maj, min, pat + 1];

console.log(`Package files changed: ${changed.join(', ')}`);
if (cmp(parse(headVersion), required) >= 0) {
  console.log(`Version ${baseVersion} -> ${headVersion} OK for "${title}".`);
} else {
  console.error(
    `This PR changes the package and is "${breaking ? `${type}!` : type}", so ${PKG_JSON} needs version ` +
      `${required.join('.')} or higher (main has ${baseVersion}, this PR has ${headVersion}).`,
  );
  process.exit(1);
}
