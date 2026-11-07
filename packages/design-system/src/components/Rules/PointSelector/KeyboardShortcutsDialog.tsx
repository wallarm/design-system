import type { FC } from 'react';
import { useTestId } from '../../../utils/testId';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
} from '../../Dialog';
import { Kbd } from '../../Kbd';
import { Text } from '../../Text';

export interface KeyboardShortcutsDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUTS: ShortcutSection[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['↑', '↓'], description: 'Navigate menu items (focus stays in input)' },
      { keys: ['Tab'], description: 'Move to Next button (closes menu)' },
      { keys: ['↵'], description: 'Select highlighted item' },
      { keys: ['Esc'], description: 'Close menu (press again to blur input)' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      {
        keys: ['1', '2', '…'],
        description: 'Choose item by number (type 1-2 digits, e.g. "12" for option 12)',
      },
      { keys: ['Space'], description: 'Toggle checkbox (multi-select step only)' },
      { keys: ['↵'], description: 'Apply selected items (multi-select)' },
      { keys: ['Ctrl', '↵'], description: 'Jump to condition step' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['Backspace'], description: 'Remove last step (when input empty)' },
      { keys: ['⌥C'], description: 'Toggle ignore case (name/value input)' },
    ],
  },
  {
    title: 'Advanced',
    shortcuts: [
      { keys: ['?'], description: 'Show this keyboard shortcuts dialog' },
      { keys: ['Esc'], description: 'Close dialog' },
    ],
  },
];

/**
 * KeyboardShortcutsDialog Component
 *
 * Modal showing all available keyboard shortcuts.
 * Triggered by pressing '?' key.
 */
export const KeyboardShortcutsDialog: FC<KeyboardShortcutsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const testId = useTestId('keyboard-shortcuts');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPositioner>
        <DialogContent data-slot='keyboard-shortcuts-dialog' data-testid={testId}>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <div className='flex flex-col gap-24'>
              {SHORTCUTS.map(section => (
                <div key={section.title} className='flex flex-col gap-12'>
                  <Text size='sm' weight='bold' color='secondary'>
                    {section.title}
                  </Text>
                  <div className='flex flex-col gap-8'>
                    {section.shortcuts.map(shortcut => (
                      <div
                        key={shortcut.description}
                        className='flex items-center justify-between gap-16'
                      >
                        <div className='flex-1'>
                          <Text size='sm'>{shortcut.description}</Text>
                        </div>
                        <div className='flex items-center gap-4'>
                          {shortcut.keys.map((key, j) => (
                            <span key={`${shortcut.description}-${key}`} className='contents'>
                              <Kbd size='small'>{key}</Kbd>
                              {j < shortcut.keys.length - 1 && (
                                <Text size='xs' color='secondary'>
                                  +
                                </Text>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog>
  );
};

KeyboardShortcutsDialog.displayName = 'KeyboardShortcutsDialog';
