import { Node, Project } from 'ts-morph';
import type { ComponentMetadata, PropMetadata } from '@wallarm-org/mcp-core';
import { toCanvasAdapter } from './canvas-adapter';
import { canvasRecipes } from './canvas-recipes';
import { tableExample } from './consuming';

const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const tableText = (value: string): string => value.replaceAll('|', '\\|').replace(/\s+/g, ' ');

/** Convert only closed, literal JSX trees; never invent missing data or execute story code. */
export const toCanvasExample = (code: string, supportCode = ''): string | undefined => {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile('example.tsx', code);
  const support = project.createSourceFile('support.tsx', supportCode);
  const components = new Map<string, string>();
  for (const declaration of source.getImportDeclarations()) {
    const module = declaration.getModuleSpecifierValue();
    if (!module.startsWith('@wallarm-org/design-system')) continue;
    for (const name of declaration.getNamedImports()) {
      if (!name.isTypeOnly()) {
        components.set(
          name.getAliasNode()?.getText() ?? name.getName(),
          `WallarmDS.${module.endsWith('/icons') ? 'Icons.' : ''}${name.getName()}`,
        );
      }
    }
  }
  const literal = (node: Node | undefined, seen = new Set<string>()): string | undefined => {
    if (!node) return undefined;
    if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node))
      return JSON.stringify(node.getLiteralText());
    if (
      Node.isNumericLiteral(node) ||
      Node.isTrueLiteral(node) ||
      Node.isFalseLiteral(node) ||
      Node.isNullLiteral(node)
    )
      return node.getText();
    if (Node.isPrefixUnaryExpression(node) && Node.isNumericLiteral(node.getOperand()))
      return node.getText();
    if (
      Node.isParenthesizedExpression(node) ||
      Node.isAsExpression(node) ||
      Node.isSatisfiesExpression(node)
    )
      return literal(node.getExpression(), seen);
    if (Node.isIdentifier(node)) {
      const name = node.getText();
      if (seen.has(name)) return undefined;
      const next = new Set(seen).add(name);
      return literal(
        source.getVariableDeclaration(name)?.getInitializer() ??
          support.getVariableDeclaration(name)?.getInitializer(),
        next,
      );
    }
    if (Node.isArrayLiteralExpression(node)) {
      const values = node.getElements().map(item => literal(item, seen));
      return values.includes(undefined) ? undefined : `[${values.join(', ')}]`;
    }
    if (Node.isObjectLiteralExpression(node)) {
      const entries: string[] = [];
      for (const property of node.getProperties()) {
        if (!Node.isPropertyAssignment(property)) return undefined;
        const value = literal(property.getInitializer(), seen);
        if (value === undefined || Node.isComputedPropertyName(property.getNameNode()))
          return undefined;
        entries.push(`${JSON.stringify(property.getName().replace(/^['"]|['"]$/g, ''))}: ${value}`);
      }
      return `{ ${entries.join(', ')} }`;
    }
    return undefined;
  };
  const holes: string[] = [];
  const hole = (value: string): string => {
    holes.push(`value${holes.length + 1}: ${value}`);
    return `{{value${holes.length}}}`;
  };
  const render = (node: Node): string | undefined => {
    if (Node.isParenthesizedExpression(node)) return render(node.getExpression());
    if (Node.isJsxText(node)) return node.getText().replace(/\s+/g, ' ');
    if (Node.isJsxExpression(node)) {
      if (!node.getExpression()) return ''; // JSX comments.
      const value = literal(node.getExpression());
      return value === undefined ? undefined : hole(value);
    }
    if (Node.isJsxFragment(node)) {
      const children = node.getJsxChildren().map(render);
      return children.includes(undefined) ? undefined : children.join('');
    }
    if (!Node.isJsxElement(node) && !Node.isJsxSelfClosingElement(node)) return undefined;
    const opening = Node.isJsxElement(node) ? node.getOpeningElement() : node;
    const tag = opening.getTagNameNode().getText();
    const globalName = components.get(tag);
    if (!globalName && !/^[a-z][a-z0-9-]*$/.test(tag)) return undefined;
    if (['script', 'style', 'iframe'].includes(tag)) return undefined;
    const attributes: string[] = [];
    for (const attr of opening.getAttributes()) {
      if (!Node.isJsxAttribute(attr)) return undefined;
      const name = attr.getNameNode().getText();
      if (name === 'key') continue;
      if (name === 'style' || name === 'ref') return undefined;
      const init = attr.getInitializer();
      const attribute = globalName ? kebab(name) : name === 'className' ? 'class' : name;
      if (init && Node.isStringLiteral(init)) {
        attributes.push(`${attribute}="${escapeHtml(init.getLiteralText())}"`);
      } else {
        const value = !init
          ? 'true'
          : Node.isJsxExpression(init)
            ? literal(init.getExpression())
            : undefined;
        if (value === undefined) return undefined;
        attributes.push(`${attribute}="${hole(value)}"`);
      }
    }
    const children = Node.isJsxElement(node) ? node.getJsxChildren().map(render) : [];
    if (children.includes(undefined)) return undefined;
    const outputTag = globalName ? 'x-import' : tag;
    const prefix = globalName ? ` component-from-global-scope="${globalName}"` : '';
    return `<${outputTag}${prefix}${attributes.length ? ` ${attributes.join(' ')}` : ''}>${children.join('').trim()}</${outputTag}>`;
  };
  const declaration = source.getVariableDeclarations().find(item => item.isExported());
  const initializer = declaration?.getInitializer();
  const fn =
    initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))
      ? initializer
      : undefined;
  if (!fn) return undefined;
  const body = fn.getBody();
  const expression = Node.isBlock(body)
    ? body.getStatements().find(Node.isReturnStatement)?.getExpression()
    : body;
  if (!expression) return undefined;
  const markup = render(expression);
  if (!markup || !markup.includes('<x-import')) return undefined;
  return (
    `\`\`\`html\n${markup}\n\`\`\`` +
    (holes.length
      ? `\n\n\`\`\`js\nfunction renderVals() {\n  return { ${holes.join(', ')} };\n}\n\`\`\``
      : '')
  );
};

const normalizedType = (prop: PropMetadata, component: ComponentMetadata): string => {
  const variant = component.variants.find(item => item.name === prop.name);
  const cvaOptions = /^\{[\s\S]*\}$/.test(prop.type.trim())
    ? [...prop.type.matchAll(/(?:^\{|;)\s*(['"]?[\w-]+['"]?)\s*:\s*string/g)].map(
        match => match[1]?.replace(/^['"]|['"]$/g, '') ?? '',
      )
    : [];
  const options = variant?.options.length ? variant.options : cvaOptions;
  if (options.length && options.every(option => option === 'true' || option === 'false'))
    return 'boolean';
  return options.length ? options.map(option => JSON.stringify(option)).join(' | ') : prop.type;
};

const collections = (name: string): string => {
  const isFilter = name === 'FilterDropdown';
  const trigger = isFilter ? 'FilterDropdownTrigger' : 'SelectButton';
  const options = isFilter
    ? `<x-import component-from-global-scope="WallarmDS.FilterDropdownContent"><x-import component-from-global-scope="WallarmDS.FilterDropdownAllOption"></x-import><x-import component-from-global-scope="WallarmDS.FilterDropdownOption" item="{{production}}"></x-import><x-import component-from-global-scope="WallarmDS.FilterDropdownOption" item="{{staging}}"></x-import></x-import>`
    : `<x-import component-from-global-scope="WallarmDS.SelectPositioner"><x-import component-from-global-scope="WallarmDS.SelectContent"><x-import component-from-global-scope="WallarmDS.SelectOption" item="{{production}}"><x-import component-from-global-scope="WallarmDS.SelectOptionText">Production</x-import></x-import><x-import component-from-global-scope="WallarmDS.SelectOption" item="{{staging}}"><x-import component-from-global-scope="WallarmDS.SelectOptionText">Staging</x-import></x-import></x-import></x-import>`;
  return `## Collections

Create a real ListCollection with \`WallarmDS.createListCollection\`; a JSON array is not a collection. Keep each option's item object from that collection. Values are arrays of item values even for single selection. The following is a complete uncontrolled single-selection recipe, inside your artboard's Root.

\`\`\`js
function renderVals() {
  var production = { label: 'Production', value: 'production' };
  var staging = { label: 'Staging', value: 'staging' };
  return {
    production: production,
    staging: staging,
    collection: WallarmDS.createListCollection({ items: [production, staging] }),
    selected: ['production']
  };
}
\`\`\`

\`\`\`html
<x-import component-from-global-scope="WallarmDS.${name}" collection="{{collection}}" default-value="{{selected}}"${isFilter ? ' label="Environment"' : ''}>
  <x-import component-from-global-scope="WallarmDS.${trigger}"${isFilter ? '' : ' aria-label="Environment"'}></x-import>
  ${options}
</x-import>
\`\`\`

For an open-state composition add \`default-open="{{shown}}"\` and return \`shown: true\` from renderVals. For multiple selection add \`multiple="{{multiple}}"\` and return \`multiple: true\`; use the corresponding multi-select parts from the source stories.`;
};

const toastRecipe = `## Canvas lifecycle

Toast is not mountable via x-import directly: it requires the toaster's runtime record. Mount Toaster inside Root and create the toast after React mounts. This classic-JavaScript adapter keeps the side effect out of renderVals and cleans up its own toast.

\`\`\`js
window.WallarmToastExample = class extends React.Component {
  componentDidMount() {
    this.toastId = WallarmDS.toaster.create({
      title: 'Rule saved', type: 'success', duration: 60000
    });
  }
  componentWillUnmount() { WallarmDS.toaster.dismiss(this.toastId); }
  render() { return React.createElement(WallarmDS.Toaster); }
};
\`\`\`

\`\`\`html
<x-import component-from-global-scope="WallarmDS.Root" theme="light">
  <x-import component-from-global-scope="WallarmToastExample"></x-import>
</x-import>
\`\`\``;

export const componentReadme = (
  component: ComponentMetadata,
  defaults: Record<string, Record<string, string>>,
  storySources: ReadonlyMap<string, string> = new Map(),
  publicNames: ReadonlyMap<string, string> = new Map(),
): string => {
  const summary =
    component.description ??
    component.examples.find(example => example.description)?.description ??
    `${component.name} is a Wallarm design-system component; use its documented composition and source stories for the intended behavior.`;
  const lines = [
    summary,
    '',
    '## When to use',
    '',
    `Use the library's ${component.name} when the screen needs this interaction or presentation. Preserve the part hierarchy and accessible labels from the examples. Mount canvas examples inside \`WallarmDS.Root\`.`,
    '',
    '## Props as canvas attributes',
    '',
    'Use kebab-case attribute names. Pass non-string values through renderVals holes, including booleans. The full emitted API is in `components/index.d.ts`.',
    '',
    '| Attribute | Type | Required | Default | Description |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const prop of component.props) {
    const defaultValue =
      defaults[component.name]?.[prop.name] ??
      prop.defaultValue ??
      component.variants.find(variant => variant.name === prop.name)?.defaultValue;
    lines.push(
      `| \`${kebab(prop.name)}\` | \`${tableText(normalizedType(prop, component))}\` | ${prop.required ? 'yes' : 'no'} | ${defaultValue === undefined ? '—' : `\`${tableText(defaultValue)}\``} | ${tableText(prop.description ?? '')} |`,
    );
  }
  if (!component.props.length)
    lines.push('| — | See emitted declarations and the composition below. | | | |');
  if (component.subComponents.length) {
    lines.push(
      '',
      '## Sub-components',
      '',
      ...component.subComponents.map(
        part => `- \`WallarmDS.${part.name}\` — \`${part.name}Props\` in the declaration bundle.`,
      ),
    );
  }
  if (component.name === 'Tour') {
    lines.push(
      '',
      '## Canvas support',
      '',
      'Tour is not mountable via x-import in phase 1. It needs useTour, target refs and a controller; use the Storybook preview to inspect it. A prop-driven canvas adapter is deferred.',
    );
  } else if (component.name === 'Toast') {
    lines.push('', toastRecipe);
  } else if (component.name === 'Select' || component.name === 'FilterDropdown') {
    lines.push('', collections(component.name));
  } else if (component.name === 'Table') {
    lines.push('', '## Table with canvas cells', '', tableExample);
  } else {
    const examples = component.examples
      .map(example => ({
        example,
        canvas: toCanvasExample(example.code, storySources.get(example.storyFile ?? '')),
      }))
      .filter(
        (entry): entry is { example: typeof entry.example; canvas: string } =>
          entry.canvas !== undefined,
      )
      .slice(0, 3);
    if (examples.length < 2) {
      for (const example of component.examples) {
        if (examples.some(entry => entry.example === example)) continue;
        const canvas = toCanvasAdapter(
          example.code,
          `${component.name}${example.name}`,
          storySources.get(example.storyFile ?? ''),
          publicNames,
        );
        if (canvas) examples.push({ example, canvas });
        if (examples.length >= 2) break;
      }
    }
    if (examples.length < 2) {
      for (const example of canvasRecipes[component.name] ?? []) {
        const canvas =
          toCanvasExample(example.code) ??
          toCanvasAdapter(example.code, `${component.name}${example.name}`);
        if (!canvas)
          throw new Error(`Canvas recipe is not self-contained: ${component.name}/${example.name}`);
        examples.push({ example, canvas });
        if (examples.length >= 2) break;
      }
    }
    for (const { example, canvas } of examples) {
      lines.push(
        '',
        `## ${example.name}`,
        '',
        ...(example.description ? [example.description, ''] : []),
        canvas,
      );
    }
    if (examples.length < 2) {
      lines.push(
        '',
        '## Source examples',
        '',
        'Additional stories require runtime data, context or callbacks and are not emitted as incomplete canvas snippets. Start from the live component preview and preserve the complete source composition:',
        '',
        ...[...new Set(component.examples.map(example => example.storyFile).filter(Boolean))].map(
          file => `- \`src/components/${file}\``,
        ),
      );
    }
  }
  return `${lines.join('\n')}\n`;
};
