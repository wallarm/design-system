/** Overlay roots with a \`defaultOpen\` prop; build-docs.test.ts checks both lists against metadata. */
export const DEFAULT_OPEN = ['DropdownMenu', 'Select', 'Tooltip', 'Calendar', 'FilterDropdown'];
/** Overlay roots that open only through a controlled \`open\` prop. */
export const CONTROLLED_OPEN = ['Dialog', 'Drawer', 'HoverCard', 'Popover', 'SearchModal'];

export const consuming = `## Consuming this system

The namespace is **WallarmDS**. Read a component's guide before using its props and composition. Names are flat: \`WallarmDS.DialogContent\`, not \`WallarmDS.Dialog.Content\`.

### Runtime and load order

Load \`tokens.css\` → \`components/bundle.css\` → \`components/bundle.js\`. The page supplies React 18 and ReactDOM before the bundle; use that runtime. The bundle assigns \`window.WallarmDS\`. Font files are under \`fonts/\` and are declared by \`tokens.css\`.

On a Design canvas, choose **Wallarm Design System** and mount a component with \`x-import\`. On a regular React page, use the corresponding React component and camelCase props. The concatenated \`components/index.d.ts\` is API documentation for the artifact, not a standalone installable TypeScript package.

### Canvas props and values

\`component-from-global-scope\` names the global component. Canvas attribute names are kebab-case: \`default-open\`, \`on-value-change\`, \`class-name\`. Strings can be written directly. Booleans, numbers, arrays, objects and callbacks must be values from a classic JavaScript \`renderVals()\` function, passed through \`{{holes}}\`; \`loading="false"\` would be a string. Combine example values into the canvas's one \`renderVals()\` function. Nested \`x-import\` nodes become React children. Scripts use classic JavaScript: no JSX, TypeScript or module imports.

### Root, dark artboards and overlays

Wrap each artboard with \`WallarmDS.Root\`. It scopes semantic tokens and portal content without changing the page's \`html\` theme or localStorage. Set \`theme="dark"\` on it for a dark artboard (\`theme="light"\` is the default).

Keep Dialog, DropdownMenu, Popover and other overlay parts inside that Root. To show an overlay in a static composition, use the component's full composition from its guide and open it by the prop it has:

- ${DEFAULT_OPEN.join(', ')}: \`default-open="{{shown}}"\` with \`shown: true\`.
- ${CONTROLLED_OPEN.join(', ')}: no \`default-open\`; pass \`open="{{shown}}"\` with \`shown: true\`, plus \`on-open-change\` from \`DCLogic\` state when the prototype should close.

Do not substitute ThemeProvider: it changes the page-level theme.

### Icons

Icons are under \`WallarmDS.Icons.\`; the icon name is the one the story imports. Use the group's static SVG assets when React is unnecessary. Do not draw replacements for existing icons.

## From a Storybook story to an artboard

Component guides carry every Storybook story verbatim. They are reference: read a story, then write your own artboard (\`<x-dc>\` markup plus one classic-JS \`class Component extends DCLogic\` whose \`renderVals()\` returns the values for \`{{holes}}\`). Do not define \`window.X\` components or import anything.

- \`import { X } from '@wallarm-org/design-system'\` → \`WallarmDS.X\` in \`x-import\`; icons → \`WallarmDS.Icons.X\` (or the icon prop by name).
- JSX element → \`<x-import component-from-global-scope="WallarmDS.X">\`; camelCase props → kebab-case attributes; non-string values → \`{{hole}}\` from \`renderVals()\`.
- \`useState\` / \`useReducer\` → \`this.state\` + \`this.setState\` in \`DCLogic\`; event handlers → methods returned from \`renderVals()\`.
- Fixture/mock data → constants in the artboard's script (shape copied from the shipped mock, values the screen's own).
- Render-prop props (\`cell\`, \`header\`, \`renderMenuAction\`, \`renderExpandedRow\`, …) → build the element in \`renderVals()\` with \`React.createElement(WallarmDS.X, props, …children)\` (\`var h = React.createElement;\`). JSX is not available on the canvas; \`React\` is the page's React 18 global.
- Storybook-only parts are ignored: \`fn()\`, \`args\` controls, decorators, \`play\`.
- Everything inside \`WallarmDS.Root\`.

Hooks cannot run in \`renderVals()\`. Use the design system's non-hook path instead: \`useChartTimeFormatters\` → \`WallarmDS.formatChartDate\`, \`formatChartDateTime\`, \`formatChartHour\`, \`formatChartTimezone\`; \`useToast\` → \`WallarmDS.toaster.create(...)\` from a \`DCLogic\` handler. \`useMemo\` / \`useCallback\` → plain computation in \`renderVals()\`; \`useEffect\` → a \`DCLogic\` lifecycle method such as \`componentDidMount\`.

### Worked translations

From \`Button/Button.stories.tsx#Basic\` (the \`args\` spread and \`data-testid\` are Storybook-only):

\`\`\`tsx
<Button {...args} data-testid='button'>
  Button
</Button>
\`\`\`

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root">
  <x-import component-from-global-scope="WallarmDS.Button">Button</x-import>
</x-import>
\`\`\`

From \`Table/Table.stories.tsx#MasterCellWithDrawer\`: the first column's \`cell\` is a render prop, and \`activeRowId\` state moves to \`this.state\`. The excerpt is abridged, not verbatim: the story's sorting, \`className\` and \`Drawer\` are omitted.

\`\`\`tsx
const [activeRowId, setActiveRowId] = useState<string | null>(null);
// …
cell: ({ row }) => <Text size='xs'>{row.original.objectName}</Text>,
// …
<Table data={data} columns={columns} getRowId={row => row.id}
  onMasterCellClick={handleMasterCellClick} activeRowId={activeRowId} />
\`\`\`

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root">
  <x-import component-from-global-scope="WallarmDS.Table"
    data="{{data}}" columns="{{columns}}" get-row-id="{{getRowId}}"
    on-master-cell-click="{{onMasterCellClick}}" active-row-id="{{activeRowId}}"></x-import>
</x-import>
\`\`\`

\`\`\`js
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { activeRowId: null };
  }
  renderVals() {
    var h = React.createElement;
    var self = this;
    var columns = securityColumns.map(function (col, i) {
      return i === 0
        ? Object.assign({}, col, {
            cell: function (ctx) {
              return h(WallarmDS.Text, { size: 'xs' }, ctx.row.original.objectName);
            },
          })
        : col;
    });
    return {
      data: securityEvents, // constants copied from the story's mock
      columns: columns,
      getRowId: function (row) { return row.id; },
      activeRowId: this.state.activeRowId,
      onMasterCellClick: function (rowId) {
        self.setState({ activeRowId: self.state.activeRowId === rowId ? null : rowId });
      },
    };
  }
}
\`\`\`

The artifact exposes public component-subpath exports as canvas globals too, including Dialog, CodeEditor and CodeSnippet families that are absent from the npm root barrel. This does not add npm root exports. Root is a canvas-only helper. Product applications use the package's existing root or component subpath imports and compose their own providers.`;
