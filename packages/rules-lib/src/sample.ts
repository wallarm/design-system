import type { RuleContext, Segment } from './proton';

export type SampleTokenRole = '' | 'ph' | 'str' | 'key' | 'fn' | 'hname';

export interface SampleToken {
  text: string;
  role: SampleTokenRole;
  highlight: 0 | 1 | 2;
}

export interface SampleValue {
  text: string;
  placeholder?: boolean;
}

/**
 * Generate sample HTTP message lines showing where a point value appears
 *
 * Stub implementation - returns basic request/response structure
 */
export function sampleMessage(
  segments: readonly Segment[],
  context: RuleContext,
  value?: SampleValue,
): SampleToken[][] {
  // Stub implementation returns a basic HTTP structure
  const isResponse = context === 'http_response';

  if (isResponse) {
    return [
      [{ text: 'HTTP/1.1 200 OK', role: '', highlight: 0 }],
      [{ text: 'Content-Type: application/json', role: 'hname', highlight: 0 }],
      [{ text: '', role: '', highlight: 0 }],
      [
        { text: '{ "data": ', role: '', highlight: 0 },
        { text: value?.text || '‹value›', role: value?.placeholder ? 'ph' : 'str', highlight: 2 },
        { text: ' }', role: '', highlight: 0 },
      ],
    ];
  }

  return [
    [{ text: 'GET /api/endpoint HTTP/1.1', role: '', highlight: 0 }],
    [{ text: 'Host: example.com', role: 'hname', highlight: 0 }],
    [{ text: 'Content-Type: application/json', role: 'hname', highlight: 0 }],
    [{ text: '', role: '', highlight: 0 }],
    [
      { text: '{ "data": ', role: '', highlight: 0 },
      { text: value?.text || '‹value›', role: value?.placeholder ? 'ph' : 'str', highlight: 2 },
      { text: ' }', role: '', highlight: 0 },
    ],
  ];
}
