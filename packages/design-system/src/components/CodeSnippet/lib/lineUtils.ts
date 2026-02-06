import type { CSSProperties } from 'react';

import type { LineConfig } from '../CodeSnippetContext';

import { LINE_COLOR_STYLES, LINE_TEXT_STYLE_CLASSES } from './lineStyles';

export type LineTextStyles = {
    colorClass?: string;
    textStyleClass?: string;
    className?: string;
    style?: CSSProperties;
};

/**
 * Build text styles for a line based on its configuration.
 */
export const getLineTextStyles = (lineConfig: LineConfig | undefined): LineTextStyles => {
    if (!lineConfig) {
        return {};
    }

    const colorStyles = lineConfig.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;
    const textStyleClass = lineConfig?.textStyle
        ? LINE_TEXT_STYLE_CLASSES[lineConfig.textStyle]
        : undefined;

    return {
        colorClass: colorStyles?.text,
        textStyleClass,
        className: lineConfig.className,
        style: lineConfig.style,
    };
};
