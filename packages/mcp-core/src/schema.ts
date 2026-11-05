import { z } from 'zod';

export const propMetadataSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
});

export type PropMetadata = z.infer<typeof propMetadataSchema>;

export const variantMetadataSchema = z.object({
  name: z.string(),
  options: z.array(z.string()),
  defaultValue: z.string().optional(),
});

export type VariantMetadata = z.infer<typeof variantMetadataSchema>;

export const subComponentMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  props: z.array(propMetadataSchema),
});

export type SubComponentMetadata = z.infer<typeof subComponentMetadataSchema>;

export const exampleMetadataSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  /** Relative to packages/design-system/src/components, posix. */
  storyFile: z.string().optional(),
  /** `meta.title` of the story file. */
  storyTitle: z.string().optional(),
  /** Story-level Storybook tags, e.g. `!autodocs`. */
  tags: z.array(z.string()).optional(),
});

export type ExampleMetadata = z.infer<typeof exampleMetadataSchema>;

export const componentDocSchema = z.object({
  /** File name without `.md`, e.g. `LineChart` or `TABLE_DESIGN`. */
  name: z.string(),
  markdown: z.string(),
});

export type ComponentDoc = z.infer<typeof componentDocSchema>;

export const componentMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  importPath: z.string(),
  props: z.array(propMetadataSchema),
  variants: z.array(variantMetadataSchema),
  subComponents: z.array(subComponentMetadataSchema),
  examples: z.array(exampleMetadataSchema),
  /** Usage docs from the component folder (`docs/*.md`, `*_DESIGN.md`); optional — older DS versions lack it. */
  docs: z.array(componentDocSchema).optional(),
});

export type ComponentMetadata = z.infer<typeof componentMetadataSchema>;

export const tokenMetadataSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;

export const tokenCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  tokens: z.array(tokenMetadataSchema),
});

export type TokenCategory = z.infer<typeof tokenCategorySchema>;

export const designSystemMetadataSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  components: z.array(componentMetadataSchema),
  tokens: z.array(tokenCategorySchema),
});

export type DesignSystemMetadata = z.infer<typeof designSystemMetadataSchema>;

export const guidelineSectionSchema = z.object({
  /** Kebab-case of the H2 text, e.g. `layout-and-spacing`. */
  id: z.string(),
  heading: z.string(),
  markdown: z.string(),
});

export type GuidelineSection = z.infer<typeof guidelineSectionSchema>;

export const guidelineKindSchema = z.enum(['foundation', 'pattern']);

export type GuidelineKind = z.infer<typeof guidelineKindSchema>;

export const guidelineSchema = z.object({
  /** `foundations/spacing` | `patterns/entity-table`. */
  slug: z.string(),
  kind: guidelineKindSchema,
  title: z.string(),
  description: z.string(),
  components: z.array(z.string()),
  keywords: z.array(z.string()),
  order: z.number(),
  /** Body without frontmatter. */
  markdown: z.string(),
  sections: z.array(guidelineSectionSchema),
});

export type Guideline = z.infer<typeof guidelineSchema>;

export const guidelinesMetadataSchema = z.object({
  version: z.string(),
  /** Contents of `src/guidelines/rules.md` — the agent digest. */
  rules: z.string(),
  guidelines: z.array(guidelineSchema),
});

export type GuidelinesMetadata = z.infer<typeof guidelinesMetadataSchema>;
