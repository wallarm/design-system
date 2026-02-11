import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/components');
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

const components = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

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
};

components.forEach(component => {
  exports[`./${component}`] = {
    development: `./src/components/${component}/index.ts`,
    types: `./dist/components/${component}/index.d.ts`,
    import: `./dist/components/${component}/index.js`,
    require: `./dist/components/${component}/index.js`,
    default: `./dist/components/${component}/index.js`,
  };
});

exports['./*'] = {
  development: './src/components/*/index.ts',
  types: './dist/components/*/index.d.ts',
  import: './dist/components/*/index.js',
  require: './dist/components/*/index.js',
  default: './dist/components/*/index.js',
};

packageJson.exports = exports;

// biome-ignore lint/style/useTemplate: just new line
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Generated exports for ${components.length} components`);
