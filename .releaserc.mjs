import { defineConfig } from './packages/configs/publishing/releaserc.mjs';

export default defineConfig({
  tagFormat: 'v${version}',
  pkgRoot: 'packages/design-system',
  changelogFile: 'packages/design-system/CHANGELOG.md',
  gitAssets: [
    'packages/design-system/package.json',
    'packages/design-system/CHANGELOG.md',
    'packages/migrator/versions.json',
  ],
  extraPrepare: ['./packages/configs/publishing/stamp-migrations.mjs'],
  releaseMessage: 'chore(release): v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
  successComment: 'This PR is included in version ${nextRelease.version}',
});
