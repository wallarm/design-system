/**
 * Creates a semantic-release configuration with conditional changelog/git
 * plugins that only run on the main branch.
 *
 * RC (prerelease) builds on feature branches skip CHANGELOG updates and
 * `chore(release)` commits — they only publish to npm and create a GitHub release.
 *
 * @param {object} params
 * @param {string} params.tagFormat - Git tag format, e.g. `"v${version}"` or `"mcp-v${version}"`
 * @param {string} params.pkgRoot - Path to the package directory relative to repo root
 * @param {string} params.changelogFile - Path to CHANGELOG.md relative to repo root
 * @param {string[]} params.gitAssets - Files to commit on release (package.json, CHANGELOG.md)
 * @param {string} params.releaseMessage - Git commit message template
 * @param {string | false} [params.successComment] - GitHub PR comment on successful release
 * @returns {import('semantic-release').Options}
 */
export function defineConfig({
  tagFormat,
  pkgRoot,
  changelogFile,
  gitAssets,
  releaseMessage,
  successComment = false,
}) {
  const isMainBranch = process.env.GITHUB_REF_NAME === 'main';

  return {
    tagFormat,
    branches: [
      'main',
      {
        name: 'feature/*',
        prerelease: "rc-${name.replace(/[\\/_]/g, '-')}",
      },
      {
        name: 'fix/*',
        prerelease: "rc-${name.replace(/[\\/_]/g, '-')}",
      },
    ],
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'conventionalcommits',
          releaseRules: [
            { type: 'feat', release: 'minor' },
            { type: 'fix', release: 'patch' },
            { type: 'perf', release: 'patch' },
            { type: 'revert', release: 'patch' },
            { breaking: true, release: 'major' },
          ],
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
          },
        },
      ],
      [
        '@semantic-release/release-notes-generator',
        {
          preset: 'conventionalcommits',
          presetConfig: {
            types: [
              { type: 'feat', section: 'Features' },
              { type: 'fix', section: 'Bug Fixes' },
              { type: 'perf', section: 'Performance' },
              { type: 'revert', section: 'Reverts' },
            ],
          },
        },
      ],
      ...(isMainBranch
        ? [['@semantic-release/changelog', { changelogFile }]]
        : []),
      ['@semantic-release/npm', { pkgRoot }],
      ...(isMainBranch
        ? [
            [
              '@semantic-release/git',
              { assets: gitAssets, message: releaseMessage },
            ],
          ]
        : []),
      [
        '@semantic-release/github',
        { successComment, failComment: false },
      ],
    ],
  };
}
