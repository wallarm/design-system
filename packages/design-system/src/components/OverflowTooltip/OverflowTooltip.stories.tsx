import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  type OverflowTooltipProps,
  OverflowTooltipTrigger,
} from './index';

const DESCRIPTION = [
  'Shows the full value only when it is actually truncated, so a reader who can already see the text is not given a tooltip that repeats it.',
  'It finds the truncating element itself, so wrap the content rather than pointing it at a node.',
].join(' ');

const meta = {
  title: 'Overlay/OverflowTooltip',
  component: OverflowTooltip,
  subcomponents: { OverflowTooltipTrigger, OverflowTooltipContent },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof OverflowTooltip>;

export default meta;

/**
 * A single truncated line. The tooltip appears only when the text is cut — resize the frame and
 * it stops offering one.
 */
export const AutoDetection: StoryFn<OverflowTooltipProps> = () => {
  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Automatic detection - short text (no tooltip)</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate'>Short text</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            This won't show because text isn't overflowing
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Automatic detection - long text (shows tooltip)</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate'>
              This is a very long text that will be truncated and automatically show a tooltip when
              hovered
            </div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            This is a very long text that will be truncated and automatically show a tooltip when
            hovered
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * The same with `line-clamp`, where truncation happens at the block rather than the line.
 */
export const MultiLineAutoDetection: StoryFn<OverflowTooltipProps> = () => {
  const longText =
    'This is a very long text that demonstrates multi-line truncation. It keeps going and going to show how the component handles text that exceeds multiple lines. The tooltip will appear when you hover over the truncated content. And it continues even more to ensure we have enough content for demonstration purposes.';

  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Auto-detect line-clamp-2</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='line-clamp-2'>{longText}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{longText}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Auto-detect line-clamp-3</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='line-clamp-3'>{longText}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{longText}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Auto-detect line-clamp-4</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='line-clamp-4'>{longText}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{longText}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * The truncating element is somewhere inside the children, which is the usual case — it is
 * found rather than declared.
 */
export const NestedElements: StoryFn<OverflowTooltipProps> = () => {
  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Nested truncate element - auto-detects overflow</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='border p-4'>
              <h3 className='font-bold mb-2'>Card Title</h3>
              <p className='truncate'>
                This is a nested element with truncate that will be automatically detected for
                overflow
              </p>
            </div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            This is a nested element with truncate that will be automatically detected for overflow
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Multiple nested elements with truncate</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='border p-4'>
              <h3 className='font-bold mb-2 truncate'>
                This is a very long title that might be truncated
              </h3>
              <p className='line-clamp-2'>
                And this is a description that can span multiple lines but will be clamped to just
                two lines. The component will detect if either of these elements overflow.
              </p>
            </div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            <div>
              <strong>Title:</strong> This is a very long title that might be truncated
              <br />
              <strong>Description:</strong> And this is a description that can span multiple lines
              but will be clamped to just two lines. The component will detect if either of these
              elements overflow.
            </div>
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * Overriding the content, for when the full value needs formatting the truncated one does not
 * have.
 */
export const CustomTooltipContent: StoryFn<OverflowTooltipProps> = () => {
  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Custom rich tooltip content</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate'>
              /api/v1/users/1234567890/sessions/abc-def-ghi-jkl-mno/tokens/refresh
            </div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            <div className='flex flex-col gap-2'>
              <div className='font-medium text-sm'>API Endpoint</div>
              <code className='text-xs bg-gray-100 px-2 py-1 rounded'>
                /api/v1/users/1234567890/sessions/abc-def-ghi-jkl-mno/tokens/refresh
              </code>
              <div className='text-xs text-text-secondary'>
                Method: POST
                <br />
                Auth: Bearer Token
              </div>
            </div>
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Table-like tooltip content</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate'>
              user@example.com - Administrator - Last login: 2024-01-15
            </div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <span className='font-medium'>Email:</span>
              <span>user@example.com</span>
              <span className='font-medium'>Role:</span>
              <span>Administrator</span>
              <span className='font-medium'>Last Login:</span>
              <span>2024-01-15</span>
            </div>
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * Forcing it on regardless of truncation. Reach for a plain `Tooltip` instead if the answer is
 * always yes — this prop exists for the case that switches.
 */
export const ForceTooltip: StoryFn<OverflowTooltipProps> = () => {
  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Force tooltip (even without overflow)</p>
        <OverflowTooltip forceTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate w-fit'>Short text</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            This tooltip is forced to show even though the text isn't truncated
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Force tooltip with additional info</p>
        <OverflowTooltip forceTooltip>
          <OverflowTooltipTrigger>
            <button className='px-4 py-2 bg-blue-500 text-white rounded'>Click for info</button>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>
            <div className='flex flex-col gap-2'>
              <strong>Additional Information</strong>
              <span className='text-sm'>
                This tooltip provides extra context even when the trigger element doesn't have
                overflow.
              </span>
            </div>
          </OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * Placement around the trigger. In a table, keep it off the side the reader is scanning.
 */
export const DifferentSides: StoryFn<OverflowTooltipProps> = () => {
  const text = 'This is a text that will be truncated and show tooltips on different sides';

  return (
    <div className='font-sans flex flex-col gap-32 w-300 py-32'>
      <div>
        <p className='sb-annotation mb-8'>Tooltip on top (default)</p>
        <OverflowTooltip positioning={{ placement: 'top' }}>
          <OverflowTooltipTrigger>
            <div className='truncate'>{text}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{text}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Tooltip on bottom</p>
        <OverflowTooltip positioning={{ placement: 'bottom' }}>
          <OverflowTooltipTrigger>
            <div className='truncate'>{text}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{text}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Tooltip on left</p>
        <OverflowTooltip positioning={{ placement: 'left' }}>
          <OverflowTooltipTrigger>
            <div className='truncate'>{text}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{text}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <div>
        <p className='sb-annotation mb-8'>Tooltip on right</p>
        <OverflowTooltip positioning={{ placement: 'right' }}>
          <OverflowTooltipTrigger>
            <div className='truncate'>{text}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{text}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>
    </div>
  );
};

/**
 * Content that changes after mount, checking the measurement is re-taken rather than cached
 * from first render.
 */
export const DynamicContent: StoryFn<OverflowTooltipProps> = () => {
  const [text, setText] = useState('Click the button to change this text');

  return (
    <div className='font-sans flex flex-col gap-16 w-300'>
      <div>
        <p className='sb-annotation mb-8'>Dynamic content with auto-detection</p>
        <OverflowTooltip>
          <OverflowTooltipTrigger>
            <div className='truncate'>{text}</div>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{text}</OverflowTooltipContent>
        </OverflowTooltip>
      </div>

      <button
        className='px-4 py-2 bg-blue-500 text-white rounded'
        onClick={() => {
          const texts = [
            'Short text',
            'This is a medium length text that might overflow',
            'This is a very long text that will definitely overflow and show a tooltip when you hover over it',
            'Another short one',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
          ];
          setText(texts[Math.floor(Math.random() * texts.length)] ?? 'Short text');
        }}
      >
        Change Text
      </button>
    </div>
  );
};
