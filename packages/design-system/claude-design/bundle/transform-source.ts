import { transformAsync } from '@babel/core';
import { globalImportsPlugin } from '../previews/global-imports';
import { refComponentsPlugin } from './ref-components';

/** Runs after Rspack's native SWC compiler, preserving its React Compiler output. */
export async function transformCanvasSource(
  code: string,
  filename: string,
  options: { globalExports?: string[] },
): Promise<string> {
  const result = await transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    plugins: [
      ...(/\.stories\.|\/(?:stories|story-content)\//.test(filename) ? [] : [refComponentsPlugin]),
      ...(options.globalExports
        ? [globalImportsPlugin(filename, new Set(options.globalExports))]
        : []),
    ],
  });
  if (!result?.code) throw new Error(`No canvas compatibility output for ${filename}`);
  return result.code;
}
