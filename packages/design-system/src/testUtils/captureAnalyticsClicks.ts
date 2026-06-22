import { onTestFinished, vi } from 'vitest';

/**
 * Mirrors how analytics SDKs (GTM, Amplitude, in-house) capture clicks: a
 * document-level listener walks up from `event.target` via `closest()` to find
 * the nearest `[data-analytics-id]` ancestor. Returns a spy that receives the
 * resolved id every time a user click registers under one. Auto-cleans up
 * after the current test via `onTestFinished`.
 */
export const captureAnalyticsClicks = (): ReturnType<typeof vi.fn<(id: string) => void>> => {
  const spy = vi.fn<(id: string) => void>();
  const listener: EventListener = e => {
    const id = (e.target as Element)
      .closest('[data-analytics-id]')
      ?.getAttribute('data-analytics-id');
    if (id) spy(id);
  };
  document.addEventListener('click', listener);
  onTestFinished(() => document.removeEventListener('click', listener));
  return spy;
};
