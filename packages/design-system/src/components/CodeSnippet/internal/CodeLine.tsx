import type { FC, ReactNode } from 'react';

import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';
import { getLineTextStyles } from '../lib/lineUtils';

export type CodeLineProps = {
    lineConfig: LineConfig | undefined;
    lineHeightClass: string;
    /** Show inline gutter elements (color stick, line number, prefix) - used when wrapLines is true */
    showInlineGutter?: boolean;
    /** Line number to display (only shown when showInlineGutter is true) */
    lineNumber?: number;
    children: ReactNode;
};

/** Renders a single line of code with styling */
export const CodeLine: FC<CodeLineProps> = ({
    lineConfig,
    lineHeightClass,
    showInlineGutter = false,
    lineNumber,
    children,
}) => {
    const {
        colorClass,
        textStyleClass,
        className: lineClassName,
        style,
    } = getLineTextStyles(lineConfig);

    const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

    return (
        <div
            className={cn(
                lineHeightClass,
                showInlineGutter && 'flex',
                // Apply background highlight when inline gutter is shown
                showInlineGutter && colorStyles?.bg,
            )}
            style={style}
        >
            {showInlineGutter && (
                <>
                    {/* Color stick */}
                    <span
                        className={cn(
                            'shrink-0 self-stretch border-l-2 pl-12',
                            colorStyles?.border ?? 'border-transparent',
                        )}
                    />
                    {/* Line number */}
                    {lineNumber !== undefined && (
                        <span
                            className={cn(
                                'shrink-0 select-none text-right text-text-secondary px-8',
                                colorStyles?.text,
                            )}
                        >
                            {lineNumber}
                        </span>
                    )}
                    {/* Prefix */}
                    {lineConfig?.prefix !== undefined && (
                        <span
                            className={cn(
                                'shrink-0 select-none px-8 text-center',
                                colorStyles?.text,
                            )}
                        >
                            {lineConfig.prefix}
                        </span>
                    )}
                </>
            )}
            <span className={cn('flex-1', colorClass, textStyleClass, lineClassName)}>
                {children}
            </span>
        </div>
    );
};

CodeLine.displayName = 'CodeLine';
