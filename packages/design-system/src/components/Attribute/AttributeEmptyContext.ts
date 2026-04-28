import { createContext, useContext } from 'react';

const AttributeEmptyContext = createContext<boolean>(false);

export const AttributeEmptyProvider = AttributeEmptyContext.Provider;

/**
 * Read whether the surrounding `Attribute` was rendered with `isEmpty`.
 * Consumed by `AttributeValue` (forces the em-dash placeholder) and
 * `AttributeEmptyDescription` (renders only when true).
 */
export const useAttributeEmpty = (): boolean => useContext(AttributeEmptyContext);
