import { defineConfig } from '../configs/publishing/releaserc.mjs';

export default defineConfig({
  tagFormat: 'mcp-v${version}',
  pkgRoot: '.',
  changelogFile: 'CHANGELOG.md',
  gitAssets: ['packages/mcp/package.json', 'packages/mcp/CHANGELOG.md'],
  releaseMessage:
    'chore(release): @wallarm-org/mcp@${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
});
