import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { listCandidateFiles } from './lib/files';
import { REPORT_FILE, renderReport } from './lib/report';
import { runMigrations } from './lib/runner';
import { UsageError, type VersionsFile } from './lib/types';
import { parseExactVersion, selectMigrations } from './lib/versions';
import { migrations } from './migrations';

interface IO {
  log(s: string): void;
  error(s: string): void;
}

const USAGE = `Usage: migrator --from <version> [--to <version>] [--dry-run] [paths...]

Migrates a consumer app across @wallarm-org/design-system breaking changes.

Options:
  --from <version>  design-system version you are migrating from (required, exact)
  --to <version>    target version (default: installed @wallarm-org/design-system)
  --dry-run         print changes, write nothing
  --help            show this help
  --version         show migrator version

Without paths, tracked files under the current directory are scanned.`;

function installedVersion(cwd: string): string {
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    const file = path.join(dir, 'node_modules/@wallarm-org/design-system/package.json');
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')).version;
    if (path.dirname(dir) === dir)
      throw new UsageError('could not find installed @wallarm-org/design-system: pass --to');
  }
}

function lineDiff(before: string, after: string): string[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const lines: string[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) lines.push(`  L${i + 1}: ${a[i]?.trim() ?? ''} → ${b[i]?.trim() ?? ''}`);
  }
  return lines;
}

export async function main(
  argv: string[],
  cwd: string,
  versions: VersionsFile,
  // Passed in (read at runtime by index.ts): a bundled package.json import would freeze the pre-release version.
  version: string,
  // biome-ignore lint/suspicious/noConsole: CLI output
  io: IO = { log: console.log, error: console.error },
): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        from: { type: 'string' },
        to: { type: 'string' },
        'dry-run': { type: 'boolean' },
        help: { type: 'boolean' },
        version: { type: 'boolean' },
      },
      allowPositionals: true,
      strict: true,
    });
    if (values.help) {
      io.log(USAGE);
      return 0;
    }
    if (values.version) {
      io.log(version);
      return 0;
    }
    if (values.from === undefined) throw new UsageError('--from is required');

    const from = parseExactVersion(values.from, '--from');
    const to = parseExactVersion(values.to ?? installedVersion(cwd), '--to');
    const selected = selectMigrations({ from, to, versions, migrations });
    const files = listCandidateFiles(cwd, positionals);
    const { changed, manual, skipped } = runMigrations({ files, cwd, migrations: selected });
    const dry = values['dry-run'] === true;

    for (const c of changed) {
      if (dry) {
        io.log(c.file);
        for (const l of lineDiff(c.before, c.after)) io.log(l);
      } else {
        fs.writeFileSync(path.join(cwd, c.file), c.after);
      }
    }
    for (const s of skipped) io.error(`warning: skipped ${s.file}: ${s.error}`);
    const writeReport = !dry && (manual.length > 0 || skipped.length > 0);
    if (writeReport) {
      fs.writeFileSync(path.join(cwd, REPORT_FILE), renderReport({ from, to, manual, skipped }));
    }
    const s = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
    io.log(
      `${dry ? '[dry-run] ' : ''}${s(changed.length, 'file')} changed, ${s(manual.length, 'manual item')}` +
        (skipped.length ? `, ${s(skipped.length, 'file')} skipped` : '') +
        (writeReport ? `; see ${REPORT_FILE}` : ''),
    );
    return 0;
  } catch (e) {
    if (
      e instanceof UsageError ||
      (e as NodeJS.ErrnoException)?.code?.startsWith('ERR_PARSE_ARGS')
    ) {
      io.error((e as Error).message);
      return 1;
    }
    throw e;
  }
}
