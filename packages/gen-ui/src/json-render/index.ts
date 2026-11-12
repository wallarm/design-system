/** `@wallarm-org/gen-ui/json-render`: render the catalog from json-render specs. */
export type { Spec, SpecStreamLine } from '@json-render/core';
export { createJsonRenderCatalog, type JsonRenderCatalog } from './catalog';
export { JsonRenderSurface, type JsonRenderSurfaceProps } from './JsonRenderSurface';
export { sanitizeSpec, specFromLines } from './spec';
