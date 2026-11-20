// Fails unless the PR title follows Conventional Commits, for example
// "feat(demo): add plan cards" or "fix!: drop Angular 20 support".
// Squash merges use the PR title as the commit message on main.
const title = (process.env.PR_TITLE ?? '').trim();
const types = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'style', 'revert'];
const pattern = new RegExp(`^(${types.join('|')})(\\([a-z0-9-]+\\))?!?: \\S.*$`);

if (pattern.test(title)) {
  console.log(`PR title OK: ${title}`);
} else {
  console.error(`PR title "${title}" does not follow Conventional Commits.`);
  console.error(`Use "<type>(<optional scope>): <summary>", where type is one of: ${types.join(', ')}.`);
  console.error('Add "!" after the type or scope for a breaking change, for example "feat!: ...".');
  process.exit(1);
}
