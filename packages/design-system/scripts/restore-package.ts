#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJsonBackupPath = path.join(__dirname, '../package.json.backup');

/**
 * Restore package.json from backup after publishing
 */
function restorePackageJson(): void {
  try {
    // Check if backup exists
    if (!fs.existsSync(packageJsonBackupPath)) {
      console.log('⚠️  No backup found, skipping restore');
      process.exit(0);
    }

    // Restore from backup
    const backupContent = fs.readFileSync(packageJsonBackupPath, 'utf8');
    fs.writeFileSync(packageJsonPath, backupContent);
    console.log('✅ package.json restored from backup');

    // Remove backup
    fs.unlinkSync(packageJsonBackupPath);
    console.log('🗑️  Backup file removed');
  } catch (error) {
    console.error('❌ Error restoring package.json:', error);
    process.exit(1);
  }
}

// Run the script
restorePackageJson();
