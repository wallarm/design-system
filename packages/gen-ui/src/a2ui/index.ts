/**
 * `@wallarm-org/gen-ui/a2ui`: render the catalog from A2UI v1.0 messages. What needs the A2UI
 * agent library (and its parser) has its own entry points: `/a2ui/express` and `/a2ui/prompt`.
 */
export { A2uiSurfaces, type A2uiSurfacesProps } from './A2uiSurfaces';
export { type A2uiMessage, createA2uiCatalog, WALLARM_A2UI_CATALOG_ID } from './catalog';
export { checkA2uiAnswer } from './check';
export { toA2uiProps, toA2uiSchema } from './toA2uiSchema';
