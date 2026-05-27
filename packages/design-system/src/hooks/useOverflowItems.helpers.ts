export interface CalculateVisibleCountParams {
  /** Ширина каждого элемента в порядке источника (px). */
  itemWidths: number[];
  /** Gap между flex-детьми контейнера (px). */
  gap: number;
  /** Доступная ширина контейнера (px). */
  availableWidth: number;
  /** Измеренная ширина индикатора "+N" (px); fallback — reserveSpace. */
  indicatorWidth: number;
}

/**
 * Чистая арифметика: сколько ведущих элементов помещается до того, как
 * потребуется индикатор переполнения. Не трогает DOM — безопасно вызывать
 * на каждый кадр ресайза.
 */
export function calculateVisibleCount({
  itemWidths,
  gap,
  availableWidth,
  indicatorWidth,
}: CalculateVisibleCountParams): number {
  if (itemWidths.length === 0) return 0;
  if (availableWidth <= 0) return itemWidths.length;

  // Первый проход: помещается ли всё без индикатора?
  let total = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    total += itemWidths[i] + (i > 0 ? gap : 0);
  }
  if (total <= availableWidth) return itemWidths.length;

  // Второй проход: резервируем место под индикатор, считаем что влезает.
  const maxWidth = availableWidth - indicatorWidth - gap;
  let accumulated = 0;
  let count = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    const widthWithGap = itemWidths[i] + (i > 0 ? gap : 0);
    if (accumulated + widthWithGap <= maxWidth || i === 0) {
      accumulated += widthWithGap;
      count++;
    } else {
      break;
    }
  }
  return Math.max(count, 1); // всегда показываем минимум один
}
