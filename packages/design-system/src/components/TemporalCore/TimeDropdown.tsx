import {
  type FC,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Time } from '@internationalized/date';
import type { TimeValue } from '@react-aria/datepicker';
import { Check } from '../../icons';
import { cn } from '../../utils/cn';
import { dropdownMenuClassNames, dropdownMenuItemVariants } from '../DropdownMenu';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';

export interface TimeDropdownProps {
  /** Whether dropdown is visible */
  isOpen: boolean;
  /** Time step in minutes (default: 30) */
  timeStep?: number;
  /** Current selected time value */
  value?: TimeValue | null;
  /** Callback when time is selected */
  onSelect: (time: TimeValue) => void;
  /** Callback when dropdown should close */
  onClose: () => void;
}

/**
 * Generate time options for a 24-hour period based on step
 */
const generateTimeOptions = (stepMinutes: number): TimeValue[] => {
  const options: TimeValue[] = [];
  const totalMinutes = 24 * 60;

  for (let minutes = 0; minutes < totalMinutes; minutes += stepMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    // Create Time with all parameters explicitly to ensure proper initialization
    options.push(new Time(hour, minute, 0, 0));
  }

  return options;
};

/**
 * Format time value for display (HH:MM AM/PM)
 */
const formatTime = (time: TimeValue): string => {
  const hour = time.hour;
  const minute = time.minute.toString().padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour.toString().padStart(2, '0')}:${minute} ${period}`;
};

/**
 * Find index of closest time option to the current value
 */
const findClosestIndex = (options: TimeValue[], value: TimeValue | null | undefined): number => {
  if (!value) return -1;

  const targetMinutes = value.hour * 60 + value.minute;
  let closestIndex = 0;
  let closestDiff = Number.MAX_VALUE;

  options.forEach((option, index) => {
    const optionMinutes = option.hour * 60 + option.minute;
    const diff = Math.abs(targetMinutes - optionMinutes);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  });

  return closestIndex;
};

/**
 * Time dropdown component with keyboard navigation.
 * Stops event propagation to prevent interference with parent components.
 */
export const TimeDropdown: FC<TimeDropdownProps> = ({
  isOpen,
  timeStep = 30,
  value,
  onSelect,
  onClose,
}) => {
  const allOptions = useMemo(() => generateTimeOptions(timeStep), [timeStep]);

  // Determine current period (AM/PM) from value, default to AM if no value
  // Use useMemo to ensure options update reactively when value changes
  // Track hour explicitly to ensure filtering updates when AM/PM changes
  const currentHour = value?.hour;
  const options = useMemo(() => {
    const isAM = currentHour !== undefined ? currentHour < 12 : true;
    return allOptions.filter(option => {
      const optionIsAM = option.hour < 12;
      return optionIsAM === isAM;
    });
  }, [allOptions, currentHour]);

  const [selectedIndex, setSelectedIndex] = useState(() => findClosestIndex(options, value));
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Update selected index when value or options change
  useEffect(() => {
    setSelectedIndex(findClosestIndex(options, value));
  }, [value, options]);

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, selectedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Stop propagation to prevent calendar navigation
      e.stopPropagation();

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            if (prev <= 0) return options.length - 1;
            return prev - 1;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            if (prev < 0) return 0;
            if (prev >= options.length - 1) return 0;
            return prev + 1;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && options[selectedIndex]) {
            onSelect(options[selectedIndex]);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          // No action for other keys
          break;
      }
    },
    [options, selectedIndex, onSelect, onClose],
  );

  const handleSelect = useCallback(
    (time: TimeValue) => {
      onSelect(time);
      onClose();
    },
    [onSelect, onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        dropdownMenuClassNames,
        'absolute left-1/2 -translate-x-1/2 top-full mt-4 z-50',
        'h-240 min-w-full p-0',
      )}
      onMouseDown={e => e.preventDefault()}
      onKeyDown={handleKeyDown}
      role='listbox'
      aria-label='Time selection'
      ref={listRef}
    >
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent className='flex flex-col gap-1 p-8'>
            {options.map((option, index) => {
              const isKeyboardSelected = index === selectedIndex;
              const isCurrentValue = value
                ? option.hour === value.hour && option.minute === value.minute
                : false;
              return (
                <button
                  key={`${option.hour}:${option.minute}`}
                  ref={isKeyboardSelected ? selectedItemRef : undefined}
                  type='button'
                  className={cn(
                    dropdownMenuItemVariants({ variant: 'default' }),
                    'gap-4',
                    isCurrentValue && 'bg-states-primary-hover',
                  )}
                  onClick={() => handleSelect(option)}
                  onMouseDown={e => e.preventDefault()} // Prevent blur
                  role='option'
                  aria-selected={isCurrentValue}
                >
                  <span className='flex-1 text-left whitespace-nowrap'>{formatTime(option)}</span>
                  <div className='size-20 flex items-center justify-center shrink-0 text-icon-primary'>
                    {isCurrentValue && <Check className='size-16' />}
                  </div>
                </button>
              );
            })}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar />
        <ScrollAreaCorner />
      </ScrollArea>
    </div>
  );
};
