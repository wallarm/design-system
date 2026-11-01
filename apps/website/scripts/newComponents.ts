import { execFileSync } from 'node:child_process';

const DAY_MS = 86_400_000;
const STABLE = /^v\d+\.\d+\.\d+$/;

export const isShallowOutput = (stdout: string): boolean => stdout.trim() === 'true';

export const isWithinWindow = (
  releaseDate: Date,
  referenceDate: Date,
  windowDays: number,
): boolean => releaseDate.getTime() >= referenceDate.getTime() - windowDays * DAY_MS;

// A component is "new" when its first stable release is within windowDays of the latest stable one.
// Fails soft (empty set + one warning) when git or tags are unavailable.
export function findNewComponents(
  componentNames: string[],
  opts: { repoRoot: string; windowDays: number },
): Set<string> {
  const git = (...args: string[]): string =>
    execFileSync('git', args, {
      cwd: opts.repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  try {
    // Shallow clones make the boundary commit look like the one that added every component.
    if (isShallowOutput(git('rev-parse', '--is-shallow-repository')))
      throw new Error('shallow clone');
    const dates = new Map<string, Date>();
    for (const line of git(
      'for-each-ref',
      '--sort=creatordate',
      '--format=%(refname:short) %(creatordate:iso-strict)',
      'refs/tags',
    ).split('\n')) {
      const [tag, date] = line.split(' ');
      if (tag && date && STABLE.test(tag)) dates.set(tag, new Date(date));
    }
    const reachable = new Set(git('tag', '--merged', 'HEAD').split('\n'));
    const latest = [...dates].filter(([t]) => reachable.has(t)).at(-1);
    if (!latest) throw new Error('no stable tags');
    const result = new Set<string>();
    for (const name of componentNames) {
      const sha = git(
        'log',
        '--diff-filter=A',
        '--format=%H',
        '--',
        `packages/design-system/src/components/${name}/index.ts`,
      )
        .split('\n')
        .filter(Boolean)
        .at(-1);
      if (!sha) continue;
      // `dates` is sorted by creator date, so the first containing tag is the earliest release.
      const containing = new Set(git('tag', '--contains', sha).split('\n'));
      const first = [...dates].find(([t]) => containing.has(t));
      if (first && isWithinWindow(first[1], latest[1], opts.windowDays)) result.add(name);
    }
    return result;
  } catch {
    process.stdout.write(
      'docs: git history/tags unavailable, skipping "new" badges (shallow clone or no tags)\n',
    );
    return new Set();
  }
}
