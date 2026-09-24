import type { FC } from 'react';
import { useTestId } from '../../utils/testId';

/**
 * The Frame's ambient layer. The Frame is the shell's gray zone — the header
 * bar plus the rail, everything around the canvas — and Ambient is the life in
 * it: slow-drifting blooms, grain and a dot cluster pooled bottom-left of the
 * rail. Purely decorative, painted under every region (see
 * `theme/components/app-shell.css`). Internal to `AppShell`; toggled with its
 * `ambient` prop.
 */
export const AppShellAmbient: FC = () => {
  const testId = useTestId('ambient');

  return (
    <div
      aria-hidden='true'
      data-slot='app-shell-ambient'
      data-testid={testId}
      className='app-shell-ambient'
    >
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-1' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-2' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-3' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-4' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-5' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-6' />
      <div className='app-shell-ambient-bloom app-shell-ambient-bloom-7' />
      <div className='app-shell-ambient-grain' />
      <div className='app-shell-ambient-dots' />
    </div>
  );
};

AppShellAmbient.displayName = 'AppShellAmbient';
