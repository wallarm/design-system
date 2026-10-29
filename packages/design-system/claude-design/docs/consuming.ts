export const tableExample = `\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root" theme="light">
  <x-import component-from-global-scope="WallarmDS.Table"
    data="{{rows}}" columns="{{columns}}" get-row-id="{{getRowId}}"></x-import>
</x-import>
\`\`\`

\`\`\`js
function renderVals() {
  return {
    rows: [{ id: 'event-1', method: 'GET', ip: '192.0.2.10' }],
    columns: [
      { accessorKey: 'method', header: 'Method', cell: WallarmDS.TableCells.httpMethod() },
      { accessorKey: 'ip', header: 'Source IP', cell: WallarmDS.TableCells.ip() }
    ],
    getRowId: function (row) { return row.id; }
  };
}
\`\`\``;

export const consuming = `## Consuming this system

The namespace is **WallarmDS**. Read a component's guide before using its props and composition. Names are flat: \`WallarmDS.DialogContent\`, not \`WallarmDS.Dialog.Content\`.

### Runtime and load order

Load \`tokens.css\` → \`components/bundle.css\` → \`components/bundle.js\`. The page supplies React 18 and ReactDOM before the bundle; use that runtime. The bundle assigns \`window.WallarmDS\`. Font files are under \`fonts/\` and are declared by \`tokens.css\`.

On a Design canvas, choose **Wallarm Design System** and mount a component with \`x-import\`. On a regular React page, use the corresponding React component and camelCase props. The concatenated \`components/index.d.ts\` is API documentation for the artifact, not a standalone installable TypeScript package.

### Canvas props and values

\`component-from-global-scope\` names the global component. Canvas attribute names are kebab-case: \`default-open\`, \`on-value-change\`, \`class-name\`. Strings can be written directly. Booleans, numbers, arrays, objects and callbacks must be values from a classic JavaScript \`renderVals()\` function, passed through \`{{holes}}\`; \`loading="false"\` would be a string. Combine example values into the canvas's one \`renderVals()\` function. Nested \`x-import\` nodes become React children. Scripts use classic JavaScript: no JSX, TypeScript or module imports.

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root" theme="light">
  <x-import component-from-global-scope="WallarmDS.Button"
    variant="primary" loading="{{loading}}">Save rule</x-import>
</x-import>
\`\`\`

\`\`\`js
function renderVals() { return { loading: false }; }
\`\`\`

### Root, dark artboards and overlays

Wrap each artboard with \`WallarmDS.Root\`. It scopes semantic tokens and portal content without changing the page's \`html\` theme or localStorage. Use \`theme="dark"\` for a dark artboard:

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root" theme="dark">
  <x-import component-from-global-scope="WallarmDS.Text">Dark artboard</x-import>
</x-import>
\`\`\`

Keep Dialog, DropdownMenu, Popover and other overlay parts inside that Root. To show an overlay in a static composition, supply \`default-open="{{shown}}"\` with \`shown: true\`; use the component's full composition from its guide. A controlled \`open\` value also needs an update callback when the prototype should close. Do not substitute ThemeProvider: it changes the page-level theme.

### Icons

Icons are under \`WallarmDS.Icons.\`, for example:

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Icons.Search"
  class-name="icon-md text-icon-primary" aria-hidden="true"></x-import>
\`\`\`

Use the group's static SVG assets when React is unnecessary. Do not draw replacements for existing icons.

### Tables

Pass real arrays and column callbacks through holes. \`WallarmDS.TableCells\` supplies cell-renderer factories built from the existing components. Column accessors must match the row fields:

${tableExample}

The artifact exposes public component-subpath exports as canvas globals too, including Dialog, CodeEditor and CodeSnippet families that are absent from the npm root barrel. This does not add npm root exports. Root and TableCells are canvas-only helpers. Product applications use the package's existing root or component subpath imports and compose their own providers and cells.`;
