#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Packages that should be published
const PUBLISHABLE_PACKAGES = [
  '@wallarm-org/design-system',
  '@wallarm-org/eslint-config-wallarm',
  '@wallarm-org/prettier-config-wallarm',
  '@wallarm-org/stylelint-config-wallarm',
  '@wallarm-org/tailwind-config-wallarm',
  '@wallarm-org/tsconfig-wallarm',
] as const;

type PackageName = (typeof PUBLISHABLE_PACKAGES)[number];

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
}

interface ReleaseConfig {
  extends?: string;
  tagFormat: string;
  plugins: Array<string | [string, Record<string, any>]>;
}

/**
 * Create .releaserc.json for a publishable package
 */
function createPackageReleaseConfig(
  packagePath: string,
  packageName: string,
): void {
  const releaseConfig: ReleaseConfig = {
    extends: path.relative(
      packagePath,
      path.join(__dirname, '../.releaserc.json'),
    ),
    tagFormat: `${packageName}-v\${version}`,
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogFile: 'CHANGELOG.md',
        },
      ],
      [
        '@semantic-release/npm',
        {
          pkgRoot: '.',
        },
      ],
      [
        '@semantic-release/git',
        {
          assets: ['CHANGELOG.md', 'package.json'],
          message: `chore(release): ${packageName}@\${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}`,
        },
      ],
    ],
  };

  const configPath = path.join(packagePath, '.releaserc.json');
  fs.writeFileSync(configPath, JSON.stringify(releaseConfig, null, 2) + '\n');
  console.log(`✅ Created ${configPath}`);
}

/**
 * Read and parse package.json
 */
function readPackageJson(packagePath: string): PackageJson | null {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')) as PackageJson;
  } catch (error) {
    console.error(`❌ Failed to parse ${pkgJsonPath}:`, error);
    return null;
  }
}

/**
 * Check if package should be published
 */
function isPublishablePackage(packageName: string): boolean {
  return PUBLISHABLE_PACKAGES.includes(packageName as PackageName);
}

/**
 * Process all packages in the monorepo
 */
function setupPackages(): void {
  const packagesDir = path.join(__dirname, '../packages');

  // Process design-system package
  const designSystemPath = path.join(packagesDir, 'design-system');
  const designSystemPkg = readPackageJson(designSystemPath);

  if (designSystemPkg && isPublishablePackage(designSystemPkg.name)) {
    createPackageReleaseConfig(designSystemPath, designSystemPkg.name);
  }

  // Process config packages
  const configsDir = path.join(packagesDir, 'configs');

  if (!fs.existsSync(configsDir)) {
    console.warn('⚠️  Configs directory not found:', configsDir);
    return;
  }

  const configDirs = fs.readdirSync(configsDir).filter((dir) => {
    const dirPath = path.join(configsDir, dir);
    return fs.statSync(dirPath).isDirectory();
  });

  for (const dir of configDirs) {
    const packagePath = path.join(configsDir, dir);
    const pkg = readPackageJson(packagePath);

    if (pkg && isPublishablePackage(pkg.name)) {
      createPackageReleaseConfig(packagePath, pkg.name);
    }
  }
}

/**
 * Main execution
 */
function main(): void {
  console.log('🚀 Setting up semantic-release for monorepo packages...\n');

  try {
    setupPackages();
    console.log('\n✨ Semantic-release setup complete!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Execute
main();
