import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type DrawerKind = 'drawer' | 'dialog';

/**
 * DS-level nesting tracker for the Drawer/Dialog family.
 *
 * Both components run on the same Ark/zag dialog machine, so zag's own
 * `data-has-nested` / `--nested-layer-count` metadata cannot tell a nested
 * Drawer from a nested Dialog — a Drawer opened from a Dialog wrongly
 * triggered the Dialog's pushed-back animation (and vice versa). This
 * context re-counts nesting per `kind`, and the pushed-back CSS keys on the
 * DS-owned attribute instead of zag's.
 *
 * The registry (registration side) and the counter (render side) live in
 * separate contexts on purpose: the registry value must stay referentially
 * stable while counts change, otherwise a child's registration effect would
 * re-run on every count update and loop.
 */
interface DrawerNestingRegistry {
  kind: DrawerKind;
  /**
   * Registers an open descendant overlay of the given kind and forwards it
   * up the ancestor chain, so every same-kind ancestor counts it (matching
   * zag's transitive `countNestedLayersOfType` semantics, filtered by kind).
   * Returns the unregister cleanup.
   */
  registerNested: (kind: DrawerKind) => () => void;
}

const DrawerNestingRegistryContext = createContext<DrawerNestingRegistry | null>(null);
const NestedSameKindCountContext = createContext(0);

interface DrawerNestingProviderProps {
  kind: DrawerKind;
  /** The overlay's open state — the ancestor registration lasts while open */
  open: boolean;
  children: ReactNode;
}

export const DrawerNestingProvider: FC<DrawerNestingProviderProps> = ({ kind, open, children }) => {
  const parent = useContext(DrawerNestingRegistryContext);
  const [nestedSameKindCount, setNestedSameKindCount] = useState(0);

  const registerNested = useCallback(
    (childKind: DrawerKind) => {
      const unregisterFromParent = parent?.registerNested(childKind);
      const matches = childKind === kind;
      if (matches) setNestedSameKindCount(count => count + 1);

      return () => {
        if (matches) setNestedSameKindCount(count => count - 1);
        unregisterFromParent?.();
      };
    },
    [parent, kind],
  );

  // Announce this overlay to the ancestor chain while it is open.
  useEffect(() => {
    if (!open || !parent) return;
    return parent.registerNested(kind);
  }, [open, parent, kind]);

  const registry = useMemo(() => ({ kind, registerNested }), [kind, registerNested]);

  return (
    <DrawerNestingRegistryContext.Provider value={registry}>
      <NestedSameKindCountContext.Provider value={nestedSameKindCount}>
        {children}
      </NestedSameKindCountContext.Provider>
    </DrawerNestingRegistryContext.Provider>
  );
};

DrawerNestingProvider.displayName = 'DrawerNestingProvider';

/** Count of currently open same-kind overlays nested under this one. */
export const useNestedSameKindCount = () => useContext(NestedSameKindCountContext);
