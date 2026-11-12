import { CommonSchemas } from '@a2ui/web_core/v1_0';
import type { z } from 'zod';
import { z as z3 } from 'zod/v3';

/**
 * Rewrites a gen-ui zod 4 props schema into the zod 3 schema A2UI's binder walks.
 *
 * @a2ui/web_core pins zod 3 and recognises its schemas by `_def.typeName` and `REF:`
 * descriptions (not `instanceof`), so `zod/v3` from our zod 4 works next to its own copy.
 * - string / number / boolean leaves become `DynamicString` / `DynamicNumber` / `DynamicBoolean`:
 *   a literal, or `{ "@path": "/..." }` into the surface's data model.
 * - arrays and objects take a literal, or one binding for the whole value.
 * - enums stay literal.
 * Field descriptions carry over, except onto a dynamic leaf or any wrapper of one: the binder
 * finds `REF:DynamicString` and the like by the first description up the wrapper chain.
 */
export const toA2uiSchema = (
  schema: z.ZodType,
  dynamic = true,
  description = schema.description,
): z3.ZodTypeAny => {
  const def = schema._zod.def;
  const leaf = def.type === 'string' || def.type === 'number' || def.type === 'boolean';
  const out = convert(schema, dynamic, description);
  return description && !(dynamic && leaf) && def.type !== 'optional'
    ? out.describe(description)
    : out;
};

const convert = (schema: z.ZodType, dynamic: boolean, description?: string): z3.ZodTypeAny => {
  const def = schema._zod.def;
  switch (def.type) {
    case 'string':
      return dynamic ? common(CommonSchemas.DynamicString) : z3.string();
    case 'number':
      return dynamic ? common(CommonSchemas.DynamicNumber) : z3.number();
    case 'boolean':
      return dynamic ? common(CommonSchemas.DynamicBoolean) : z3.boolean();
    case 'enum': {
      const values = Object.values((def as z.core.$ZodEnumDef).entries).map(String);
      return z3.enum(values as [string, ...string[]]);
    }
    case 'optional':
      // The description moves onto the inner schema, so it never sits above a dynamic leaf.
      return toA2uiSchema(
        (def as z.core.$ZodOptionalDef).innerType as z.ZodType,
        dynamic,
        description ?? ((def as z.core.$ZodOptionalDef).innerType as z.ZodType).description,
      ).optional();
    case 'array': {
      const literal = z3.array(
        toA2uiSchema((def as z.core.$ZodArrayDef).element as z.ZodType, false),
      );
      return dynamic ? z3.union([literal, common(CommonSchemas.DataBinding)]) : literal;
    }
    case 'object': {
      const { shape, catchall } = def as z.core.$ZodObjectDef;
      const fixed = z3.object(
        Object.fromEntries(
          Object.entries(shape).map(([key, value]) => [
            key,
            toA2uiSchema(value as z.ZodType, false),
          ]),
        ),
      );
      // Open keys (a series value per key, a table row): kept, typed like the zod 4 catchall.
      const literal = catchall ? fixed.catchall(toA2uiSchema(catchall as z.ZodType, false)) : fixed;
      return dynamic ? z3.union([literal, common(CommonSchemas.DataBinding)]) : literal;
    }
    case 'nullable':
      return toA2uiSchema(
        (def as z.core.$ZodNullableDef).innerType as z.ZodType,
        dynamic,
        description,
      ).nullable();
    case 'unknown':
      return z3.unknown();
    default:
      throw new Error(`gen-ui: prop type '${def.type}' has no A2UI mapping`);
  }
};

/** The props object itself: its fields are bound one by one, not as a whole. */
export const toA2uiProps = (props: z.ZodObject): z3.AnyZodObject =>
  z3.object(
    Object.fromEntries(
      Object.entries(props.shape).map(([key, value]) => [key, toA2uiSchema(value as z.ZodType)]),
    ),
  );

/** web_core's zod 3 types and `zod/v3`'s are the same API from different packages. */
const common = (schema: unknown) => schema as z3.ZodTypeAny;

export const A2UI_ACTION = common(CommonSchemas.Action);
export const A2UI_CHILD_LIST = common(CommonSchemas.ChildList);
