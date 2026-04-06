import type { FieldMetadata } from '../../types';
import type { Token } from './tokenizer';

export interface ParserState {
  tokens: Token[];
  pos: number;
  fields: FieldMetadata[];
}
