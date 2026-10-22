import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { type Node, type SourceFile, SyntaxKind } from 'ts-morph';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { migrations } from '../../migrations';
import { renderReport } from '../report';
import { migrateSource, runMigrations } from '../runner';
import type { MigrationContext } from '../types';

const IMP = "import { Avatar } from '@wallarm-org/design-system';\n";
let cwd: string;

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'migrator-'));
});
afterEach(() => fs.rmSync(cwd, { recursive: true, force: true }));

function run(files: Record<string, string>) {
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(cwd, name), text);
  return runMigrations({
    files: Object.keys(files).map(f => path.join(cwd, f)),
    cwd,
    migrations,
  });
}

describe('runMigrations', () => {
  it('changes files, reports manual items and skips parse errors', () => {
    const r = run({
      'a.tsx': `${IMP}const a = <Avatar size='xs' />;\n`,
      'b.tsx': `${IMP}const b = <Avatar size={s} />;\n`,
      'c.tsx': `${IMP}const = ;\n`,
      'd.tsx': 'const = ;\n',
    });
    expect(r.changed.map(c => c.file)).toEqual(['a.tsx', 'b.tsx']);
    expect(r.changed[0]?.after).toContain("size='md'");
    expect(r.changed[1]?.after).toContain('@wds-migration(avatar-size-rename)');
    expect(r.manual[0]).toMatchObject({
      file: 'b.tsx',
      line: 2,
      migrationId: 'avatar-size-rename',
    });
    expect(r.skipped).toHaveLength(1);
    expect(r.skipped[0]?.file).toBe('c.tsx');
    expect(JSON.stringify(r)).not.toContain('d.tsx');
  });
});

describe('runMigrations isolation', () => {
  it('isolates a throwing transform and keeps other results', () => {
    fs.writeFileSync(path.join(cwd, 'bad.tsx'), `${IMP}const a = 1;\n`);
    fs.writeFileSync(path.join(cwd, 'good.tsx'), `${IMP}const a = <Avatar size='xs' />;\n`);
    const boom = {
      id: 'boom',
      title: 'boom',
      transform: (f: SourceFile, ctx: MigrationContext) => {
        if (f.getFilePath().endsWith('bad.tsx')) {
          ctx.report(f, 'half-done');
          throw new Error('kaboom');
        }
      },
    };
    const r = runMigrations({
      files: ['bad.tsx', 'good.tsx'].map(f => path.join(cwd, f)),
      cwd,
      migrations: [boom, ...migrations],
    });
    expect(r.skipped).toEqual([{ file: 'bad.tsx', error: 'kaboom' }]);
    expect(r.manual).toHaveLength(0);
    expect(r.changed.map(c => c.file)).toEqual(['good.tsx']);
  });

  it('skips unreadable files and continues', () => {
    fs.writeFileSync(path.join(cwd, 'ok.tsx'), `${IMP}const a = <Avatar size='xs' />;\n`);
    const r = runMigrations({
      files: [path.join(cwd, 'missing.tsx'), path.join(cwd, 'ok.tsx')],
      cwd,
      migrations,
    });
    expect(r.skipped[0]?.file).toBe('missing.tsx');
    expect(r.changed).toHaveLength(1);
  });

  it('reports subdirectory paths relative to cwd', () => {
    fs.mkdirSync(path.join(cwd, 'src'));
    fs.writeFileSync(path.join(cwd, 'src/x.tsx'), `${IMP}const a = <Avatar size='xs' />;\n`);
    const r = runMigrations({ files: [path.join(cwd, 'src/x.tsx')], cwd, migrations });
    expect(r.changed[0]?.file).toBe('src/x.tsx');
  });
});

const avatarMig = migrations.filter(m => m.id === 'avatar-size-rename');
const mark = (id: string, msg: string) => `/* @wds-migration(${id}): ${msg} */`;
const reporter = (id: string, msg: string, pick: (f: SourceFile) => Node) => ({
  id,
  title: id,
  transform: (f: SourceFile, ctx: MigrationContext) => ctx.report(pick(f), msg),
});

describe('migrateSource markers', () => {
  const src = (body: string) => `${IMP}${body}\n`;

  it('inserts a marker after the tag name for an attribute report', () => {
    const r = migrateSource({
      text: src('<Avatar size={s} />'),
      fileName: 'a.tsx',
      migrations: avatarMig,
    });
    expect(r.code).toBe(
      src(`<Avatar ${mark('avatar-size-rename', r.manual[0]?.message ?? '')} size={s} />`),
    );
    expect(r.manual).toEqual([
      {
        line: 2,
        migrationId: 'avatar-size-rename',
        message: expect.stringContaining('non-static'),
      },
    ]);
  });

  it('inserts a marker for an element (spread) report on an opening element', () => {
    const r = migrateSource({
      text: src('<Avatar {...p}>x</Avatar>'),
      fileName: 'a.tsx',
      migrations: avatarMig,
    });
    expect(r.code).toBe(
      src(`<Avatar ${mark('avatar-size-rename', r.manual[0]?.message ?? '')} {...p}>x</Avatar>`),
    );
  });

  it('is idempotent', () => {
    const once = migrateSource({
      text: src('<Avatar size={s} />'),
      fileName: 'a.tsx',
      migrations: avatarMig,
    });
    const twice = migrateSource({ text: once.code, fileName: 'a.tsx', migrations: avatarMig });
    expect(twice.code).toBe(once.code);
    expect(twice.manual).toHaveLength(1);
  });

  it('two migrations on one element add two markers', () => {
    const first = (f: SourceFile) => f.getFirstDescendantOrThrow(n => n.getText() === 'size={s}');
    const r = migrateSource({
      text: src('<Avatar size={s} />'),
      fileName: 'a.tsx',
      migrations: [reporter('one', 'first', first), reporter('two', 'second', first)],
    });
    expect(r.code).toBe(
      src(`<Avatar ${mark('two', 'second')} ${mark('one', 'first')} size={s} />`),
    );
  });

  it('a marker on an inner element in an attribute does not suppress the outer one', () => {
    const everyAvatar = {
      id: 'x',
      title: 'x',
      transform: (f: SourceFile, ctx: MigrationContext) => {
        for (const el of f.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement))
          ctx.report(el, 'm');
      },
    };
    const inner = `<Avatar ${mark('x', 'm')} />`;
    const r = migrateSource({
      text: src(`<Avatar icon={${inner}} />`),
      fileName: 'a.tsx',
      migrations: [everyAvatar],
    });
    expect(r.code).toBe(src(`<Avatar ${mark('x', 'm')} icon={${inner}} />`));
  });

  it('sanitizes */ and newlines in messages', () => {
    const r = migrateSource({
      text: src('<Avatar />'),
      fileName: 'a.tsx',
      migrations: [
        reporter('x', 'a */ b\nc', f =>
          f.getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement),
        ),
      ],
    });
    expect(r.code).toBe(src(`<Avatar ${mark('x', 'a * / b c')} />`));
  });

  it('no marker when the node is outside JSX', () => {
    const text = src('<Avatar />');
    const r = migrateSource({ text, fileName: 'a.tsx', migrations: [reporter('x', 'm', f => f)] });
    expect(r.code).toBe(text);
    expect(r.manual).toHaveLength(1);
  });

  it('keeps CRLF', () => {
    const text = `${IMP}<div>\n<Avatar size={s} />\n</div>\n`.split('\n').join('\r\n');
    const r = migrateSource({ text, fileName: 'a.tsx', migrations: avatarMig });
    expect(r.code).toContain('@wds-migration(avatar-size-rename)');
    expect(r.code.split('\r\n')).toHaveLength(text.split('\r\n').length);
    expect(r.code.replace(/\r\n/g, '')).not.toContain('\n');
  });
});

describe('renderReport', () => {
  const manual = [
    { file: 'src/b.tsx', line: 3, migrationId: 'avatar-size-rename', message: 'check' },
  ];

  it('renders items and closing sentence', () => {
    const out = renderReport({ from: '2.9.0', to: '3.2.0', manual, skipped: [] });
    expect(out.split('\n')[0]).toBe('# Design-system migration: manual steps (@wds-migration)');
    expect(out).toContain('from 2.9.0 to 3.2.0');
    expect(out).toContain('- [ ] `src/b.tsx:3` — check (avatar-size-rename)');
    expect(out).not.toContain('## Files that could not be parsed');
    expect(out.trimEnd().endsWith('Delete this file once every item is done.')).toBe(true);
  });

  it('lists skipped files', () => {
    const out = renderReport({
      from: '1.0.0',
      to: '2.0.0',
      manual: [],
      skipped: [{ file: 'c.tsx', error: 'bad' }],
    });
    expect(out).toContain('## Files that could not be parsed');
    expect(out).toContain('c.tsx');
  });
});
