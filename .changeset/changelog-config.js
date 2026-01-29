const getReleaseLine = async (changeset, type) => {
  const [firstLine, ...otherLines] = changeset.summary
    .split('\n')
    .map(l => l.trimRight());

  // Extract commit type from the summary if it follows conventional format
  const conventionalMatch = firstLine.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\((.+)\))?:\s*(.+)$/);

  if (conventionalMatch) {
    const [, commitType, scope, subject] = conventionalMatch;
    const scopeStr = scope ? `**${scope}:** ` : '';
    return `- ${scopeStr}${subject}${changeset.commit ? ` (${changeset.commit})` : ''}`;
  }

  // Fallback to default format
  return `- ${firstLine}${changeset.commit ? ` (${changeset.commit})` : ''}`;
};

const getDependencyReleaseLine = async (changesets, dependenciesUpdated) => {
  if (dependenciesUpdated.length === 0) return '';

  const updatedDependenciesList = dependenciesUpdated.map(
    dependency => `  - ${dependency.name}@${dependency.newVersion}`
  );

  return ['- Updated dependencies:', ...updatedDependenciesList].join('\n');
};

const defaultChangelogFunctions = {
  getReleaseLine,
  getDependencyReleaseLine
};

module.exports = defaultChangelogFunctions;