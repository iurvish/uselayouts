export const PIN_GAP = 18;

export type MasonrySlot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Same visual density as the old CSS column breakpoints, from the feed width. */
export function pinColumnCount(width: number) {
  if (width >= 1040) return 3;
  if (width >= 640) return 2;
  return 1;
}

/**
 * Pinterest packing: each pin goes on the shortest column so existing pins
 * never move when more are appended.
 */
export function packPinMasonry(
  count: number,
  columns: number,
  columnWidth: number,
  gap: number,
  heights: number[],
): { slots: MasonrySlot[]; height: number } {
  const cols = Math.max(1, columns);
  const colY = Array.from({ length: cols }, () => 0);
  const slots: MasonrySlot[] = [];

  for (let i = 0; i < count; i += 1) {
    let col = 0;
    for (let c = 1; c < cols; c += 1) {
      if (colY[c]! < colY[col]!) col = c;
    }
    const height = heights[i] ?? 0;
    slots.push({
      x: col * (columnWidth + gap),
      y: colY[col]!,
      width: columnWidth,
      height,
    });
    colY[col]! += height + gap;
  }

  const tallest = Math.max(0, ...colY);
  return {
    slots,
    height: count === 0 ? 0 : Math.max(0, tallest - gap),
  };
}
