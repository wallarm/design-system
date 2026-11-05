import type { FC } from 'react';
import { useState } from 'react';
import type { VersionInfo } from '@wallarm-org/rules-lib';
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../../Alert';
import { Button } from '../../Button';

export interface VersionWarningProps {
  /** Current SDK version */
  version: VersionInfo | null;
  /** Expected SDK version (from component build time) */
  expectedVersion?: string;
  /** Minimum required SDK version */
  minVersion?: string;
  /** Show version in dev mode (default: true) */
  showInDev?: boolean;
  /** Show migration notice when canonical version changed */
  showMigrationNotice?: boolean;
  /** Called when migration notice is dismissed */
  onDismissMigration?: () => void;
}

/**
 * Shows SDK version info and warns if version is incompatible.
 *
 * Displays:
 * - Migration notice when canonical version changed (info, dismissible)
 * - Blocking error if SDK too old (critical)
 * - Version mismatch warning (warning)
 * - SDK version info in dev mode (informational)
 */
export const VersionWarning: FC<VersionWarningProps> = ({
  version,
  expectedVersion,
  minVersion = '0.10.3', // Minimum required: ruleset format 0.10.3
  showInDev = true,
  showMigrationNotice = false,
  onDismissMigration,
}) => {
  const [migrationDismissed, setMigrationDismissed] = useState(false);

  if (!version) return null;

  const isDev = process.env.NODE_ENV === 'development';
  const versionMismatch = expectedVersion && version.ruleset_format !== expectedVersion;

  // Show migration notice (dismissible)
  if (showMigrationNotice && !migrationDismissed) {
    return (
      <Alert color='info' data-testid='sdk-migration-notice'>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Points Auto-Updated</AlertTitle>
          <AlertDescription>
            Point format updated to SDK version {version.canonical}. All points have been
            automatically re-canonicalized to the new format.
          </AlertDescription>
        </AlertContent>
        <Button
          variant='ghost'
          size='small'
          onClick={() => {
            setMigrationDismissed(true);
            onDismissMigration?.();
          }}
        >
          Dismiss
        </Button>
      </Alert>
    );
  }

  // Check if SDK is too old (blocking error)
  const isTooOld = minVersion && compareVersions(version.ruleset_format, minVersion) < 0;

  if (isTooOld) {
    return (
      <Alert color='destructive' data-testid='sdk-version-error'>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Incompatible SDK Version</AlertTitle>
          <AlertDescription>
            This component requires SDK version {minVersion} or higher, but got{' '}
            {version.ruleset_format}. Please update the Proton SDK.
          </AlertDescription>
        </AlertContent>
      </Alert>
    );
  }

  // Show warning if version mismatches (not blocking)
  if (versionMismatch) {
    return (
      <Alert color='warning' data-testid='sdk-version-warning'>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>SDK Version Mismatch</AlertTitle>
          <AlertDescription>
            Expected SDK version {expectedVersion}, but got {version.ruleset_format}. Some features
            may not work correctly.
          </AlertDescription>
        </AlertContent>
      </Alert>
    );
  }

  // Show version info in dev mode
  if (isDev && showInDev) {
    return (
      <Alert color='info' data-testid='sdk-version-info'>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>SDK Version</AlertTitle>
          <AlertDescription>
            Proton SDK {version.canonical} (ruleset format: {version.ruleset_format}, commit:{' '}
            {version.commit.slice(0, 7)})
          </AlertDescription>
        </AlertContent>
      </Alert>
    );
  }

  return null;
};

/**
 * Simple semver comparison (supports x.y.z format)
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;

    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

VersionWarning.displayName = 'VersionWarning';
