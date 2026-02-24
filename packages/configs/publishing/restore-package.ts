#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';

const pkgDir = process.cwd();
const packageJsonPath = path.join(pkgDir, 'package.json');
const packageJsonBackupPath = path.join(pkgDir, 'package.json.backup');

/**
 * Restore package.json from backup after publishing
 */
function restorePackageJson(): void {
  try {
    if (!fs.existsSync(packageJsonBackupPath)) {
      console.log('⚠️  No backup found, skipping restore');
      process.exit(0);
    }

    const backupContent = fs.readFileSync(packageJsonBackupPath, 'utf8');
    fs.writeFileSync(packageJsonPath, backupContent);
    console.log('✅ package.json restored from backup');

    fs.unlinkSync(packageJsonBackupPath);
    console.log('🗑️  Backup file removed');
  } catch (error) {
    console.error('❌ Error restoring package.json:', error);
    process.exit(1);
  }
}

restorePackageJson();
