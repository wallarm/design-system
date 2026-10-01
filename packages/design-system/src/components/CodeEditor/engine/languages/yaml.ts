import { yamlLanguage } from '@codemirror/lang-yaml';
import { foldNodeProp, LanguageSupport, type LRLanguage } from '@codemirror/language';

/** lang-yaml's YAML language with its syntax folds switched off (folds come only from the `folds` prop). */
export const yamlEditorLanguage: LRLanguage = yamlLanguage.configure({
  props: [foldNodeProp.add({ 'FlowMapping FlowSequence Item Pair BlockLiteral': () => null })],
});

export const yaml = (): LanguageSupport => new LanguageSupport(yamlEditorLanguage);
