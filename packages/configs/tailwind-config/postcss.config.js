import tailwindcss from '@tailwindcss/postcss';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const postcssConfig = {
  plugins: [
    tailwindcss({
      base: resolve(__dirname, '../../../'),
    }),
  ],
};
