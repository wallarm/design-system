#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ICONS_DIR = path.resolve('packages/design-system/src/icons');

const SIMPLE_NAMES = [
  'Braze', 'Brevo', 'Infobip', 'Mailersend', 'Mailgun', 'Mailjet', 'Mailtrap',
  'Mandrill', 'Maqsam', 'Mattermost', 'Netcore', 'Plunk', 'Postmark',
  'Resend', 'Sendgrid', 'Ses', 'Smtp', 'Sparkpost', 'Webhook', 'Zulip',
  'Aws', 'Dribbble', 'Onlyfans',
];

if (SIMPLE_NAMES.length !== 23) {
  throw new Error(`Expected 23 names, got ${SIMPLE_NAMES.length}`);
}

const OPEN = "viewBox='0 0 24 24'>";
const CLOSE = '</SvgIcon>';

for (const name of SIMPLE_NAMES) {
  const srcPath = path.join(ICONS_DIR, `${name}.tsx`);
  const outPath = path.join(ICONS_DIR, `${name}Neutral.tsx`);

  if (fs.existsSync(outPath)) {
    throw new Error(`Refusing to overwrite existing file: ${outPath}`);
  }

  const src = fs.readFileSync(srcPath, 'utf8');
  const openIdx = src.indexOf(OPEN);
  const closeIdx = src.lastIndexOf(CLOSE);
  if (openIdx === -1 || closeIdx === -1) {
    throw new Error(`Could not locate SvgIcon boundaries in ${name}.tsx`);
  }

  let children = src.slice(openIdx + OPEN.length, closeIdx);

  // Gradient defs are no longer referenced once every fill becomes currentColor.
  children = children.replace(/<defs>[\s\S]*?<\/defs>\n?/g, '');

  // Every discrete fill (solid hex, keyword black, or gradient reference) becomes currentColor.
  children = children.replace(/fill='#[0-9A-Fa-f]{3,8}'/g, "fill='currentColor'");
  children = children.replace(/fill='url\(#[^)]+\)'/g, "fill='currentColor'");
  children = children.replace(/fill='black'/g, "fill='currentColor'");

  // Every discrete stroke (solid hex, keyword black, or gradient reference) becomes currentColor.
  children = children.replace(/stroke='#[0-9A-Fa-f]{3,8}'/g, "stroke='currentColor'");
  children = children.replace(/stroke='url\(#[^)]+\)'/g, "stroke='currentColor'");
  children = children.replace(/stroke='black'/g, "stroke='currentColor'");

  const neutralName = `${name}Neutral`;
  const body = `import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ${neutralName}: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>${children}</SvgIcon>
);

${neutralName}.displayName = '${neutralName}Icon';
`;

  fs.writeFileSync(outPath, body);
  console.log(`Wrote ${outPath}`);
}
