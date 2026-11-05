// Places in the product and how a character is drawn there (handoff 05 §2.1; D1, D2, D3, D9, D26).
// Size picks only the renderer: 16–32 px is the flat glyph, 40 px and up the 3D character.
// Liveness and the contact shadow are set per place; a new place gets them from design.

export type AgentGlyphSize = 16 | 20 | 24 | 32;
export type AgentAvatarSize = 40 | 48 | 56 | 72 | 120;

interface GlyphPlace {
  size: AgentGlyphSize;
  renderer: 'glyph';
  live: false;
  shadow: false;
}
interface AvatarPlace {
  size: AgentAvatarSize;
  renderer: '3d';
  live: boolean;
  shadow: boolean;
}

export const PLACES = {
  /** in text, chips, history and principal names, beside text-sm or larger (D3) */
  inline: { size: 20, renderer: 'glyph', live: false, shadow: false },
  /** in text beside text-xs (D3, D26: 16 px is the floor) */
  inlineXs: { size: 16, renderer: 'glyph', live: false, shadow: false },
  /** table rows: «Found by», «Agent», run rows */
  tableRow: { size: 20, renderer: 'glyph', live: false, shadow: false },
  /** Overview and Agent team rows of active agents, with the idle repertoire and the look-around (D2) */
  overviewRow: { size: 40, renderer: '3d', live: true, shadow: false },
  /** Overview: a Not set up or «Soon» row, static */
  overviewSetup: { size: 40, renderer: '3d', live: false, shadow: false },
  /** Approval policy full-screen header, toasts, run headers */
  header: { size: 48, renderer: '3d', live: false, shadow: false },
  /** a row beside people's avatars */
  peopleRow: { size: 56, renderer: '3d', live: false, shadow: false },
  /** Agent team card */
  teamCard: { size: 72, renderer: '3d', live: true, shadow: false },
  /** Agent drawer header */
  drawerHeader: { size: 72, renderer: '3d', live: true, shadow: true },
  /** Wally's empty chat (D9) */
  emptyChat: { size: 120, renderer: '3d', live: true, shadow: true },
} as const satisfies Record<string, GlyphPlace | AvatarPlace>;

export type AgentPlace = keyof typeof PLACES;

export const rendererFor = (size: number): 'glyph' | '3d' => (size <= 32 ? 'glyph' : '3d');
