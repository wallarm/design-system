import fs from 'fs';
import path from 'path';

import type { Project } from 'ts-morph';

/**
 * Component folders that are implementation details, not public API: none is in the root
 * barrel and no consumer imports its subpath. `components.json` omits them (so MCP never
 * offers them) and guidelines may not cite them. `NavPanel` is rendered by
 * `RemoteShellPanel` and configured only through `RemoteShell`'s `NavConfig`.
 */
export const INTERNAL_COMPONENTS: ReadonlySet<string> = new Set([
  'NavPanel',
  'ButtonBase',
  'Polymorphic',
  'TemporalCore',
]);

/** What consumers can import, and what guidelines must never show. */
export interface PublicApi {
  /** Names exported from the root barrel or a public `components/<Dir>/index.ts`. */
  names: Set<string>;
  /** Public component dir → names its `index.ts` exports (`@wallarm-org/design-system/<Dir>`). */
  dirs: Map<string, Set<string>>;
  /** Internal dir names plus every name their `index.ts` exports. */
  internal: Set<string>;
}

const exportsOf = (project: Project, file: string) =>
  new Set(
    (project.getSourceFile(file) ?? project.addSourceFileAtPath(file))
      .getExportedDeclarations()
      .keys(),
  );

export const collectPublicApi = (project: Project, srcDir: string): PublicApi => {
  const componentsDir = path.join(srcDir, 'components');
  const dirs = new Map<string, Set<string>>();
  const internal = new Set<string>(INTERNAL_COMPONENTS);
  for (const dirent of fs.readdirSync(componentsDir, { withFileTypes: true })) {
    const index = path.join(componentsDir, dirent.name, 'index.ts');
    if (!dirent.isDirectory() || !fs.existsSync(index)) continue;
    const names = exportsOf(project, index);
    if (INTERNAL_COMPONENTS.has(dirent.name)) for (const n of names) internal.add(n);
    else dirs.set(dirent.name, names);
  }
  const names = new Set(
    [exportsOf(project, path.join(srcDir, 'index.ts')), ...dirs.values()]
      .flatMap(set => [...set])
      .filter(n => !internal.has(n)),
  );
  for (const set of dirs.values()) for (const n of internal) set.delete(n);
  return { names, dirs, internal };
};
