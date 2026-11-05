import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  type DesignSystemMetadata,
  designSystemMetadataSchema,
  type GuidelinesMetadata,
  guidelinesMetadataSchema,
} from '@wallarm-org/mcp-core';

/**
 * Resolve and load design system metadata.
 *
 * Resolution order:
 * 1. --metadata-path CLI argument (explicit path)
 * 2. import.meta.resolve('@wallarm-org/design-system/metadata')
 * 3. Walk up from cwd looking for node_modules/@wallarm-org/design-system/dist/metadata/components.json
 * 4. <cwd>/apps/* and <cwd>/packages/* node_modules (monorepos that install DS in one app only)
 * 5. The snapshot bundled into this package's dist/metadata at build time
 */

const DS_METADATA = path.join(
  '@wallarm-org',
  'design-system',
  'dist',
  'metadata',
  'components.json',
);

export interface MetadataSource {
  kind: 'installed' | 'bundled';
  path: string;
}

/** One line naming where the metadata came from, for instructions and response footers. */
export const describeSource = (source: MetadataSource, version: string): string =>
  source.kind === 'installed'
    ? `Source: installed @wallarm-org/design-system v${version}`
    : `Source: bundled snapshot v${version} — may differ from your installed version (install @wallarm-org/design-system or pass --metadata-path)`;

function parseMetadataPathArg(args: string[]): string | undefined {
  const idx = args.indexOf('--metadata-path');
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

function findMetadataInNodeModules(startDir: string): string | undefined {
  let dir = startDir;
  const root = path.parse(dir).root;

  while (dir !== root) {
    const candidate = path.join(dir, 'node_modules', DS_METADATA);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }

  return undefined;
}

function findMetadataInWorkspaces(cwd: string): string | undefined {
  for (const group of ['apps', 'packages']) {
    const groupDir = path.join(cwd, group);
    if (!fs.existsSync(groupDir)) continue;
    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(groupDir, entry.name, 'node_modules', DS_METADATA);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

const defaultBundledPath = () =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'metadata', 'components.json');

async function resolveViaImportMeta(): Promise<string | undefined> {
  try {
    const resolved = import.meta.resolve('@wallarm-org/design-system/metadata');
    const filePath = resolved.startsWith('file://') ? new URL(resolved).pathname : resolved;
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  } catch {
    // Package not resolvable — expected when DS is not installed
  }
  return undefined;
}

export async function loadMetadata(
  args: string[] = process.argv,
  {
    cwd = process.cwd(),
    bundledPath = defaultBundledPath(),
    resolveInstalled = resolveViaImportMeta,
  } = {},
): Promise<{ metadata: DesignSystemMetadata; metadataPath: string; source: MetadataSource }> {
  let metadataPath: string | undefined;
  let kind: MetadataSource['kind'] = 'installed';

  // 1. Check CLI arg
  metadataPath = parseMetadataPathArg(args);
  if (metadataPath) {
    metadataPath = path.resolve(metadataPath);
  }

  // 2. Try import.meta.resolve
  if (!metadataPath) {
    metadataPath = await resolveInstalled();
  }

  // 3. Walk up from cwd, 4. apps/* and packages/*
  if (!metadataPath) {
    metadataPath = findMetadataInNodeModules(cwd) ?? findMetadataInWorkspaces(cwd);
  }

  // 5. Bundled snapshot
  if (!metadataPath && fs.existsSync(bundledPath)) {
    metadataPath = bundledPath;
    kind = 'bundled';
  }

  if (!metadataPath) {
    throw new Error(
      'Could not find Wallarm Design System metadata.\n\n' +
        'Make sure @wallarm-org/design-system is installed and built, or provide the path explicitly:\n' +
        '  wallarm-ds-mcp --metadata-path ./path/to/components.json\n',
    );
  }

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata file not found at: ${metadataPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  const result = designSystemMetadataSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `Invalid metadata format in ${metadataPath}:\n${result.error.message}\n\n` +
        'This might mean the design system version is incompatible with this MCP server version.',
    );
  }

  return { metadata: result.data, metadataPath, source: { kind, path: metadataPath } };
}

/**
 * Load `guidelines.json` from the directory of the resolved `components.json`.
 * Optional: design-system versions before guidelines shipped lack the file.
 */
export function loadGuidelines(metadataPath: string): GuidelinesMetadata | undefined {
  const guidelinesPath = path.join(path.dirname(metadataPath), 'guidelines.json');
  if (!fs.existsSync(guidelinesPath)) return undefined;

  const result = guidelinesMetadataSchema.safeParse(
    JSON.parse(fs.readFileSync(guidelinesPath, 'utf-8')),
  );
  if (!result.success) {
    throw new Error(`Invalid guidelines format in ${guidelinesPath}:\n${result.error.message}`);
  }
  return result.data;
}
