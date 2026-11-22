// Shared by mark-verified.mjs and require-verify.mjs.
// The "verified tree" is the git tree hash of the working directory (tracked and
// untracked, minus ignored files), so it matches HEAD^{tree} once those exact files are committed.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const git = (args, env = process.env) =>
  execFileSync('git', args, { encoding: 'utf8', env }).trim();

export const repoRoot = () => git(['rev-parse', '--show-toplevel']);

export const markerPath = () => join(repoRoot(), '.claude', '.verified');

export function workingTreeHash() {
  const dir = mkdtempSync(join(tmpdir(), 'verify-index-'));
  const index = join(dir, 'index');
  try {
    const realIndex = git(['rev-parse', '--git-path', 'index']);
    if (existsSync(realIndex)) copyFileSync(realIndex, index);
    const env = { ...process.env, GIT_INDEX_FILE: index };
    git(['add', '-A'], env);
    return git(['write-tree'], env);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
