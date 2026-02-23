import fs from 'fs';
import path from 'path';
import { type DesignSystemMetadata, designSystemMetadataSchema } from '@wallarm-org/mcp-core';

/**
 * Resolve and load design system metadata.
 *
 * Resolution order:
 * 1. --metadata-path CLI argument (explicit path)
 * 2. import.meta.resolve('@wallarm-org/design-system/metadata')
 * 3. Walk up from cwd looking for node_modules/@wallarm-org/design-system/dist/metadata/components.json
 */

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
    const candidate = path.join(
      dir,
      'node_modules',
      '@wallarm-org',
      'design-system',
      'dist',
      'metadata',
      'components.json',
    );
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }

  return undefined;
}

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

export async function loadMetadata(args: string[] = process.argv): Promise<DesignSystemMetadata> {
  let metadataPath: string | undefined;

  // 1. Check CLI arg
  metadataPath = parseMetadataPathArg(args);
  if (metadataPath) {
    metadataPath = path.resolve(metadataPath);
  }

  // 2. Try import.meta.resolve
  if (!metadataPath) {
    metadataPath = await resolveViaImportMeta();
  }

  // 3. Walk up from cwd
  if (!metadataPath) {
    metadataPath = findMetadataInNodeModules(process.cwd());
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

  return result.data;
}
