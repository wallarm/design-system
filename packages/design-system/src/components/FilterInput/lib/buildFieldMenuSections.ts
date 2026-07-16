import type { FieldGroup, FieldMetadata } from '../types';
import { filterAndSort } from './filterSort';

/** A render-ready field-menu section. `label` undefined = headerless. */
export interface FieldMenuSection {
  label?: string;
  fields: FieldMetadata[];
}

const getText = (field: FieldMetadata): string[] => [field.label, field.name];

/**
 * Bucket `fields` into ordered, filtered menu sections. With no `fieldGroups`,
 * returns a single headerless section (today's flat list). With groups: fields
 * render under group headers in group/listed order, unclaimed fields fall into
 * a trailing headerless section, each section is filtered by `filterText`, and
 * sections with no surviving fields are dropped.
 */
export function buildFieldMenuSections(
  fields: FieldMetadata[],
  fieldGroups: FieldGroup[] | undefined,
  filterText: string,
): FieldMenuSection[] {
  if (!fieldGroups || fieldGroups.length === 0) {
    const flat = filterAndSort(fields, filterText, getText);
    return flat.length > 0 ? [{ fields: flat }] : [];
  }

  const byName = new Map(fields.map(field => [field.name, field]));
  const claimed = new Set<string>();
  const sections: FieldMenuSection[] = [];

  for (const group of fieldGroups) {
    const groupFields: FieldMetadata[] = [];
    for (const name of group.fields) {
      if (claimed.has(name)) continue;
      const field = byName.get(name);
      if (!field) continue;
      claimed.add(name);
      groupFields.push(field);
    }
    const filtered = filterAndSort(groupFields, filterText, getText);
    if (filtered.length > 0) sections.push({ label: group.label, fields: filtered });
  }

  const ungrouped = fields.filter(field => !claimed.has(field.name));
  const filteredUngrouped = filterAndSort(ungrouped, filterText, getText);
  if (filteredUngrouped.length > 0) sections.push({ fields: filteredUngrouped });

  return sections;
}
