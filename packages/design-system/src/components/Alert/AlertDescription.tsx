import type { FC, ReactNode, Ref } from 'react';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export interface AlertDescriptionProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  /** Maximum number of lines before truncation (default: 4). Set to 0 to disable truncation. */
  lineClamp?: number;
}

/**
 * Description component for Alert.
 *
 * Displays secondary description text with regular weight and secondary color.
 * Supports text truncation with configurable max lines.
 * Shows a tooltip with full text when content is truncated.
 */
export const AlertDescription: FC<AlertDescriptionProps> = ({ ref, children, lineClamp }) => (
  <OverflowTooltip>
    <OverflowTooltipTrigger>
      <Text ref={ref} size='sm' color='secondary' lineClamp={lineClamp}>
        {children}
      </Text>
    </OverflowTooltipTrigger>
    <OverflowTooltipContent>{children}</OverflowTooltipContent>
  </OverflowTooltip>
);

AlertDescription.displayName = 'AlertDescription';
