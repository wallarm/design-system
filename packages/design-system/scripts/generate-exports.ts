import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');

interface ExportConditions {
  development?: string;
  types?: string;
  import: string;
  require: string;
  default: string;
}

interface PackageExports {
  [key: string]: ExportConditions;
}

interface PackageJson {
  exports?: PackageExports;
  [key: string]: unknown;
}

const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Per-component subpaths (`@wallarm-org/design-system/Button`) are covered by the
// `./*` wildcard below — no need to enumerate every component. The wildcard is
// resolved by any consumer using `moduleResolution` bundler/node16/nodenext,
// which is the only setup that reads `exports` at all.
const exports: PackageExports = {
  '.': {
    development: './src/index.ts',
    types: './dist/index.d.ts',
    import: './dist/index.js',
    require: './dist/index.js',
    default: './dist/index.js',
  },
  './icons': {
    development: './src/icons/index.ts',
    types: './dist/icons/index.d.ts',
    import: './dist/icons/index.js',
    require: './dist/icons/index.js',
    default: './dist/icons/index.js',
  },
  './theme': {
    development: './src/theme/index.css',
    import: './dist/theme/index.css',
    require: './dist/theme/index.css',
    default: './dist/theme/index.css',
  },
  './metadata': {
    import: './dist/metadata/components.json',
    require: './dist/metadata/components.json',
    default: './dist/metadata/components.json',
  },
  './*': {
    development: './src/components/*/index.ts',
    types: './dist/components/*/index.d.ts',
    import: './dist/components/*/index.js',
    require: './dist/components/*/index.js',
    default: './dist/components/*/index.js',
  },
};

packageJson.exports = exports;

// biome-ignore lint/style/useTemplate: just new line
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Generated package exports (root + icons + theme + metadata + ./* wildcard)');
