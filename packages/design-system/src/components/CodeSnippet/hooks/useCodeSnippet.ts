import { useContext } from 'react';

import { CodeSnippetContext, type CodeSnippetContextValue } from '../CodeSnippetContext';

export const useCodeSnippet = <TLanguage extends string = string>() => {
    const context = useContext(CodeSnippetContext) as CodeSnippetContextValue<TLanguage> | null;
    if (!context) {
        throw new Error('useCodeSnippet must be used within CodeSnippetRoot');
    }
    return context;
};
