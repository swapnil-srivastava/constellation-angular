// PreToolUse hook (see .claude/settings.json).
// Blocks `git push`, `gh pr create` and the GitHub MCP PR/push tools unless `pnpm verify`
// passed on exactly the code being pushed (the committed tree at HEAD).
import { readFileSync, existsSync } from 'node:fs';
import { git, markerPath } from './verified-tree.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name ?? '';
const command = input.tool_input?.command ?? '';

const guarded =
  (tool === 'Bash' && /\bgit\s+push\b|\bgh\s+pr\s+create\b/.test(command)) ||
  /^mcp__github__(create_pull_request|push_files)$/.test(tool);

if (!guarded) process.exit(0);

let head = '';
let verified = '';
try {
  head = git(['rev-parse', 'HEAD^{tree}']);
  verified = existsSync(markerPath()) ? readFileSync(markerPath(), 'utf8').trim() : '';
} catch {
  process.exit(0); // not in a git repo: nothing to check
}

if (verified && verified === head) process.exit(0);

console.error(
  [
    'Blocked by the development workflow (CLAUDE.md, step 4 and 5):',
    verified
      ? '- The committed code changed since `pnpm verify` last passed.'
      : '- `pnpm verify` has not passed in this checkout yet.',
    '- Commit your changes, run `pnpm verify` and show its output.',
    '- Run `/code-review medium` (and `/security-review` for auth, sdk-config or workflow changes) before opening the PR.',
  ].join('\n'),
);
process.exit(2);
