import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';

import { useCodeSnippet } from './hooks';
import { LINE_COLOR_STYLES, SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';

export type CodeSnippetLineNumbersProps = HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<HTMLDivElement>;
};

export const CodeSnippetLineNumbers: FC<CodeSnippetLineNumbersProps> = ({
    className,
    ...props
}) => {
    const { tokens, startingLineNumber, lines, size } = useCodeSnippet();

    const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

    if (!tokens) {
        return null;
    }

    return (
        <div
            data-slot='code-snippet-line-numbers'
            className={cn('flex flex-col text-text-secondary select-none text-right', className)}
            {...props}
        >
            {tokens.map((_, index) => {
                const lineNumber = startingLineNumber + index;
                const lineConfig = lines.get(lineNumber);
                const colorStyles = lineConfig?.color
                    ? LINE_COLOR_STYLES[lineConfig.color]
                    : undefined;

                return (
                    <span
                        key={lineNumber}
                        className={cn(
                            lineHeightClass,
                            'px-8 bg-bg-primary',
                            colorStyles?.text,
                            colorStyles?.bg,
                        )}
                    >
                        {lineNumber}
                    </span>
                );
            })}
        </div>
    );
};

CodeSnippetLineNumbers.displayName = 'CodeSnippetLineNumbers';
