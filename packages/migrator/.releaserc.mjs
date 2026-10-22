import { defineConfig } from '../configs/publishing/releaserc.mjs';

export default defineConfig({
  tagFormat: 'migrator-v${version}',
  pkgRoot: '.',
  changelogFile: 'CHANGELOG.md',
  gitAssets: ['packages/migrator/package.json', 'packages/migrator/CHANGELOG.md'],
  releaseMessage:
    'chore(release): @wallarm-org/migrator@${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
});
