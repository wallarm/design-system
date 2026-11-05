import type { Choice } from './signalChoices';

/**
 * Attack types offered by name. proton treats `attack_type` as an open label
 * (`rules-framework-actions.md` §3); these are the ones the managed ruleset
 * and the parsers use. Anything else can be typed.
 */
export const ATTACK_TYPES: Choice[] = [
  { value: 'sqli', label: 'SQL injection' },
  { value: 'xss', label: 'Cross-site scripting' },
  { value: 'rce', label: 'Remote code execution' },
  { value: 'ptrav', label: 'Path traversal' },
  { value: 'ssrf', label: 'Server-side request forgery' },
  { value: 'xxe', label: 'XML external entity' },
  { value: 'ssti', label: 'Server-side template injection' },
  { value: 'crlf', label: 'CRLF injection' },
  { value: 'auth_bypass', label: 'Authentication bypass' },
  { value: 'mass_assignment', label: 'Mass assignment' },
  { value: 'scanner', label: 'Vulnerability scanner' },
  { value: 'data_bomb', label: 'Decompression or entity bomb' },
  { value: 'invalid_xml', label: 'Malformed XML' },
];
