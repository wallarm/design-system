import type { Node, SourceFile } from 'ts-morph';

export interface ManualItem {
  file: string;
  line: number;
  migrationId: string;
  message: string;
}

export interface MigrationContext {
  report(node: Node, message: string): void;
}

export interface Migration {
  id: string;
  title: string;
  transform(file: SourceFile, ctx: MigrationContext): void;
}

export interface VersionsFile {
  latest: string;
  migrations: Record<string, string>;
}

export class UsageError extends Error {}
