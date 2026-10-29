import { describe, expect, it } from '@rstest/core';

import { migration } from '../tree-base-removed';
import { apply } from './harness';

// Report-only: code never changes (fixture in __fixtures__/tree-base-removed); these assert reports.
describe('tree-base-removed', () => {
  it('reports each TreeBase subpath import once, leaves the code as is', () => {
    for (const code of [
      "import { TreeBaseRoot, TreeBaseTree } from '@wallarm-org/design-system/TreeBase';",
      "import { TreeBaseRoot as Root } from '@wallarm-org/design-system/TreeBase';",
      "import * as TB from '@wallarm-org/design-system/TreeBase';",
      "import type { TreeNode } from '@wallarm-org/design-system/TreeBase';",
    ]) {
      const r = apply(migration, code);
      expect(r.code).toBe(code);
      expect(r.reports).toHaveLength(1);
      expect(r.reports[0]).toMatch(/^1:TreeBase was removed/);
    }
  });

  it('ignores other design-system imports and local TreeBase', () => {
    for (const code of [
      "import { Tree, TreeView } from '@wallarm-org/design-system';",
      "import { TreeView } from '@wallarm-org/design-system/TreeView';",
      "import { TreeBaseRoot } from './TreeBase';",
    ]) {
      expect(apply(migration, code).reports).toEqual([]);
    }
  });
});
