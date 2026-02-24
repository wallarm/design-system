#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';

interface PackageJson {
  exports?: Record<string, any>;
  files?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

interface ExportConfig {
  development?: string;
  [key: string]: any;
}

const pkgDir = process.env.INIT_CWD || process.cwd();
const packageJsonPath = path.join(pkgDir, 'package.json');
const packageJsonBackupPath = path.join(pkgDir, 'package.json.backup');

/**
 * Find monorepo root by walking up looking for pnpm-workspace.yaml
 */
function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error('Could not find monorepo root (pnpm-workspace.yaml)');
}

/**
 * Remove development conditions from export configuration
 */
function cleanExports(exports: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const cleanedValue = { ...value } as ExportConfig;
      delete cleanedValue.development;
      cleaned[key] = cleanedValue;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Resolve workspace:* dependencies to real versions
 */
function resolveWorkspaceDeps(
  deps: Record<string, string>,
  monorepoRoot: string,
): Record<string, string> {
  const resolved = { ...deps };

  for (const [name, version] of Object.entries(resolved)) {
    if (!version.startsWith('workspace:')) {
      continue;
    }

    // Find the package in the monorepo
    const possiblePaths = [
      path.join(monorepoRoot, 'packages', name.replace(/^@[^/]+\//, '')),
      path.join(monorepoRoot, 'packages', 'configs', name.replace(/^@[^/]+\//, '')),
      path.join(monorepoRoot, 'apps', name.replace(/^@[^/]+\//, '')),
    ];

    let realVersion: string | null = null;
    for (const pkgPath of possiblePaths) {
      const pkgJsonPath = path.join(pkgPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkg.name === name) {
          realVersion = pkg.version;
          break;
        }
      }
    }

    if (realVersion) {
      resolved[name] = realVersion;
      console.log(`  📎 ${name}: workspace:* → ${realVersion}`);
    } else {
      console.warn(`  ⚠️  Could not resolve workspace version for ${name}`);
    }
  }

  return resolved;
}

/**
 * Prepare package.json for publishing to NPM
 */
function prepareForPublish(): void {
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson: PackageJson = JSON.parse(packageJsonContent);

    // Backup original package.json
    fs.writeFileSync(packageJsonBackupPath, packageJsonContent);
    console.log('💾 Original backed up to package.json.backup');

    // Clean exports — remove development conditions
    if (packageJson.exports) {
      packageJson.exports = cleanExports(packageJson.exports);
      console.log('📦 Removed development exports');
    }

    // Remove src from files if present (only dist should be published)
    if (packageJson.files?.includes('src')) {
      packageJson.files = packageJson.files.filter((f) => f !== 'src');
      console.log('📁 Removed src from files');
    }

    // Resolve workspace:* dependencies
    const monorepoRoot = findMonorepoRoot(pkgDir);

    if (packageJson.dependencies) {
      const hasWorkspaceDeps = Object.values(packageJson.dependencies).some((v) =>
        v.startsWith('workspace:'),
      );
      if (hasWorkspaceDeps) {
        console.log('🔗 Resolving workspace dependencies:');
        packageJson.dependencies = resolveWorkspaceDeps(packageJson.dependencies, monorepoRoot);
      }
    }

    // Write cleaned package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log('✅ package.json prepared for publishing');
  } catch (error) {
    console.error('❌ Error preparing package.json:', error);
    process.exit(1);
  }
}

prepareForPublish();
