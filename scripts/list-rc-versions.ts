#!/usr/bin/env tsx

/**
 * List all RC versions for the design system packages
 * Usage: pnpm list-rc
 */

import { execSync } from 'node:child_process';
import chalk from 'chalk';

const PACKAGES = [
  '@wallarm/design-system',
  '@wallarm/eslint-config-wallarm',
  '@wallarm/prettier-config-wallarm',
  '@wallarm/stylelint-config-wallarm',
  '@wallarm/tailwind-config-wallarm',
  '@wallarm/tsconfig-wallarm',
];

interface DistTag {
  name: string;
  version: string;
}

function getDistTags(packageName: string): DistTag[] {
  try {
    const output = execSync(`npm view ${packageName} dist-tags --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    const tags = JSON.parse(output);
    return Object.entries(tags)
      .filter(([tag]) => tag.startsWith('rc-'))
      .map(([name, version]) => ({ name, version: version as string }));
  } catch (error) {
    return [];
  }
}

function main(): void {
  console.log(chalk.bold.cyan('\n📦 RC Versions for Wallarm Design System\n'));

  let hasAnyRc = false;

  for (const pkg of PACKAGES) {
    const rcTags = getDistTags(pkg);

    if (rcTags.length > 0) {
      hasAnyRc = true;
      console.log(chalk.bold.yellow(`${pkg}:`));

      for (const tag of rcTags) {
        const featureName = tag.name.replace('rc-', '');
        console.log(
          `  ${chalk.green('●')} ${chalk.cyan(featureName)} → ${chalk.gray(tag.version)}`,
        );
        console.log(
          `    ${chalk.dim('Install:')} npm install ${pkg}@${tag.name}`,
        );
      }
      console.log();
    }
  }

  if (!hasAnyRc) {
    console.log(chalk.yellow('No RC versions currently available.'));
    console.log(
      chalk.dim('RC versions are created when you push to feature/* branches.'),
    );
  } else {
    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.bold.green('\n✨ Usage Examples:\n'));
    console.log('  Install specific RC:');
    console.log('    npm install @wallarm/design-system@rc-button\n');
    console.log('  Install with alias:');
    console.log('    npm install my-rc@npm:@wallarm/design-system@rc-button\n');
  }
}

// Handle missing chalk gracefully
if (!chalk) {
  console.error('Please install chalk: pnpm add -D chalk');
  process.exit(1);
}

main();
