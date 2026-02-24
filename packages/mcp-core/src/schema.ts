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
});

export type ExampleMetadata = z.infer<typeof exampleMetadataSchema>;

export const componentMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  importPath: z.string(),
  props: z.array(propMetadataSchema),
  variants: z.array(variantMetadataSchema),
  subComponents: z.array(subComponentMetadataSchema),
  examples: z.array(exampleMetadataSchema),
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
