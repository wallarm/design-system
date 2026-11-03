import { useContext } from 'react';

import { AdapterContext, type AdapterContextValue } from '../CodeSnippetContext';

export const useAdapter = <TLanguage extends string = string>() =>
  useContext(AdapterContext) as AdapterContextValue<TLanguage> | null;
