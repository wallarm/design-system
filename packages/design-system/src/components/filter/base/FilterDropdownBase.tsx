import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { FilterDropdownBaseProps, FilterDropdownItem } from './types';
import { useKeyboardNav } from './useKeyboardNav';

/**
 * Base component for filter dropdown menus
 * Provides common functionality: keyboard navigation, styling, footer
 */
export const FilterDropdownBase: FC<FilterDropdownBaseProps> = ({
  sections,
  onSelect,
  open = false,
  onOpenChange,
  footerHint = '↑ ↓ to navigate    ↵ to select',
  className,
}) => {
  if (!open) {
    return null;
  }

  // Flatten all items for keyboard navigation
  const allItems: FilterDropdownItem[] = sections.flatMap(section => section.items);

  const { activeIndex, itemRefs, menuRef } = useKeyboardNav({
    items: allItems,
    open,
    onSelect: item => {
      onSelect(item);
      onOpenChange?.(false);
    },
    onClose: () => onOpenChange?.(false),
  });

  // Track item index across sections
  let globalItemIndex = 0;

  return (
    <div
      ref={menuRef}
      className={cn(
        'w-[300px]',
        'bg-white border border-border-primary-light rounded-xl',
        'shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]',
        'flex flex-col gap-px p-2',
        className,
      )}
      data-slot='filter-dropdown-base'
      role='menu'
      aria-expanded={open}
    >
      {/* Scrollable content */}
      <div className='flex flex-col gap-px max-h-80 overflow-y-auto'>
        {sections.map((section, sectionIdx) => (
          <div key={section.id}>
            {/* Section header */}
            {section.title && (
              <div className='flex items-center justify-center overflow-clip px-2 py-2 pb-0.5'>
                <div className='flex flex-1 gap-0.5 items-center'>
                  <div className='flex flex-1 flex-col justify-center leading-none text-xs font-medium text-text-secondary'>
                    <p className='leading-4 whitespace-pre-wrap'>{section.title}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section items */}
            {section.items.map(item => {
              const currentIndex = globalItemIndex++;
              const isActive = currentIndex === activeIndex;

              return (
                <button
                  key={item.id}
                  ref={el => {
                    itemRefs.current[currentIndex] = el;
                  }}
                  type='button'
                  onClick={() => !item.disabled && onSelect(item)}
                  disabled={item.disabled}
                  className={cn(
                    'flex items-start gap-1 px-2 py-1.5',
                    'rounded-md overflow-clip',
                    'text-left',
                    'transition-colors',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    !item.disabled && (isActive ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-50'),
                  )}
                  role='menuitem'
                  aria-selected={isActive}
                  aria-disabled={item.disabled}
                >
                  {/* Icon */}
                  {item.icon && (
                    <div className='flex items-center pt-0.5 w-4 shrink-0'>{item.icon}</div>
                  )}

                  {/* Content */}
                  <div className='flex flex-1 gap-2 items-start min-w-0'>
                    {item.renderContent ? (
                      item.renderContent(item)
                    ) : (
                      <div className='flex flex-1 flex-col items-start min-w-0'>
                        <div className='flex flex-col justify-center leading-none text-sm font-normal text-text-primary w-full'>
                          <p className='leading-5 whitespace-pre-wrap overflow-hidden text-ellipsis'>
                            {item.label}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <div
                      className='flex items-center justify-center px-1.5 py-0.5 rounded text-xs'
                      style={{ backgroundColor: item.badge.color }}
                    >
                      {item.badge.text}
                    </div>
                  )}

                  {/* Submenu arrow */}
                  {item.hasSubmenu && (
                    <div className='flex items-center text-text-secondary'>
                      <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                        <path
                          d='M6 4l4 4-4 4'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Separator after section */}
            {section.showSeparator && sectionIdx < sections.length - 1 && (
              <div className='flex flex-col gap-2 items-center justify-center overflow-clip px-2 py-1'>
                <div className='border-t border-border-primary h-px w-full' />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with keyboard hints */}
      <div className='relative h-8 w-full'>
        {/* Top border */}
        <div className='absolute h-px left-0 right-0 top-[5px] border-t border-border-primary' />

        {/* Hint text */}
        <div className='absolute flex gap-1 items-center left-0 top-[12px]'>
          <div className='flex flex-col justify-center leading-none text-xs font-medium text-text-secondary'>
            <p className='leading-4'>{footerHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

FilterDropdownBase.displayName = 'FilterDropdownBase';
