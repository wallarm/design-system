/**
 * Component folders that are implementation details, not public API: none is in the root
 * barrel and no consumer imports its subpath. `components.json` omits them (so MCP never
 * offers them) and guidelines may not cite them. `NavPanel` is rendered by
 * `RemoteShellPanel` and configured only through `RemoteShell`'s `NavConfig`.
 */
export const INTERNAL_COMPONENTS: ReadonlySet<string> = new Set([
  'NavPanel',
  'ButtonBase',
  'Polymorphic',
  'TemporalCore',
]);
