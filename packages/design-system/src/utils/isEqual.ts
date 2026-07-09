type PlainValue = unknown;

/** Deep-equality for plain JSON-like values (objects, arrays, primitives). */
export function isEqual(a: PlainValue, b: PlainValue): boolean {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, index) => isEqual(value, b[index]));
  }

  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(
      key =>
        Object.hasOwn(b, key) &&
        isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    );
  }

  return false;
}
