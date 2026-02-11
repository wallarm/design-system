import { useContext } from 'react';
import { AdapterContext, type AdapterContextValue } from '../CodeSnippetContext';

export const useAdapter = <TLanguage extends string = string>() => {
  return useContext(AdapterContext) as AdapterContextValue<TLanguage> | null;
};
