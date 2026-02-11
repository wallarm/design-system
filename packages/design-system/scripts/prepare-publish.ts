#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface PackageJson {
  exports?: Record<string, any>;
  files?: string[];
  [key: string]: any;
}

interface ExportConfig {
  development?: string;
  types?: string;
  import?: string;
  require?: string;
  default?: string;
  [key: string]: any;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJsonBackupPath = path.join(__dirname, '../package.json.backup');

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
 * Prepare package.json for publishing to NPM
 */
function prepareForPublish(): void {
  try {
    // Read package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson: PackageJson = JSON.parse(packageJsonContent);

    // Backup original package.json
    fs.writeFileSync(packageJsonBackupPath, JSON.stringify(packageJson, null, 2));
    console.log('💾 Original backed up to package.json.backup');

    // Clean exports
    if (packageJson.exports) {
      packageJson.exports = cleanExports(packageJson.exports);
      console.log('📦 Removed development exports');
    }

    // Remove src from files if present (only dist should be published)
    if (packageJson.files?.includes('src')) {
      packageJson.files = packageJson.files.filter(f => f !== 'src');
      console.log('📁 Removed src from files');
    }

    // Write cleaned package.json
    // biome-ignore lint/style/useTemplate: just new line
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log('✅ package.json prepared for publishing');
  } catch (error) {
    console.error('❌ Error preparing package.json:', error);
    process.exit(1);
  }
}

// Run the script
prepareForPublish();
