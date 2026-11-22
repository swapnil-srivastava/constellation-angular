// Run by `pnpm verify` after lint, test and build pass.
// Records which files were verified so require-verify.mjs can allow a push of exactly those files.
import { writeFileSync } from 'node:fs';
import { markerPath, workingTreeHash } from './verified-tree.mjs';

const tree = workingTreeHash();
writeFileSync(markerPath(), `${tree}\n`);
console.log(`Verified tree ${tree}. git push and PR creation are now allowed for this exact code.`);
