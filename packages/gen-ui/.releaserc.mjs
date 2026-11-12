import { defineConfig } from '../configs/publishing/releaserc.mjs';

export default defineConfig({
  tagFormat: 'gen-ui-v${version}',
  pkgRoot: '.',
  changelogFile: 'CHANGELOG.md',
  gitAssets: ['packages/gen-ui/package.json', 'packages/gen-ui/CHANGELOG.md'],
  releaseMessage:
    'chore(release): @wallarm-org/gen-ui@${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
});
