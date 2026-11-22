// PreToolUse hook (see .claude/settings.json).
// Blocks `git push`, `gh pr create` and the GitHub MCP PR/push tools unless `pnpm verify`
// passed on exactly the code being pushed (the committed tree at HEAD).
import { readFileSync, existsSync } from 'node:fs';
import { git, markerPath } from './verified-tree.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name ?? '';
const command = input.tool_input?.command ?? '';

// push_files sends file contents from the tool input, which the local check cannot see.
if (tool === 'mcp__github__push_files') {
  console.error('Blocked by the development workflow: commit locally, run `pnpm verify`, then use `git push`.');
  process.exit(2);
}

// `git push`, also with global options before it (`git -C dir push`), and `gh pr create`.
const guarded =
  (tool === 'Bash' && /\bgit\b[^;&|\n]*\spush\b|\bgh\s+pr\s+create\b/.test(command)) ||
  tool === 'mcp__github__create_pull_request';

if (!guarded) process.exit(0);

let head = '';
let verified = '';
try {
  head = git(['rev-parse', 'HEAD^{tree}']);
  verified = existsSync(markerPath()) ? readFileSync(markerPath(), 'utf8').trim() : '';
} catch {
  console.error('Blocked by the development workflow: could not read the repo to check `pnpm verify`.');
  process.exit(2);
}

if (verified && verified === head) process.exit(0);

console.error(
  [
    'Blocked by the development workflow (CLAUDE.md, step 4 and 5):',
    verified
      ? '- The committed code differs from what `pnpm verify` last checked (new commits, or untracked files present during verify).'
      : '- `pnpm verify` has not passed in this checkout yet.',
    '- Commit your changes, run `pnpm verify` and show its output.',
    '- Run `/code-review medium` (and `/security-review` for auth, sdk-config or workflow changes) before opening the PR.',
  ].join('\n'),
);
process.exit(2);
