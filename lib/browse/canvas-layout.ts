function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

/**
 * Unique block size for the infinite canvas. Wide enough that a typical
 * viewport (~3–4 cards across, ~2 tall) never wraps onto a copy.
 */
export function canvasGridPeriod(count: number) {
  if (count <= 0) return { cols: 1, rows: 1 };
  const cols = Math.min(count, Math.max(5, Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

/** Item at world (col, row), or null for leftover cells in the last row. */
export function canvasTileIndex(
  col: number,
  row: number,
  count: number,
): number | null {
  if (count <= 0) return null;
  const { cols, rows } = canvasGridPeriod(count);
  const i = mod(row, rows) * cols + mod(col, cols);
  return i < count ? i : null;
}

export function packCanvasColumn(
  col: number,
  count: number,
  gap: number,
  heights: number[],
  fallbackHeight: number,
) {
  const { cols, rows } = canvasGridPeriod(count);
  const prefix = Array<number>(rows + 1);
  prefix[0] = 0;
  for (let row = 0; row < rows; row += 1) {
    const index = canvasTileIndex(col, row, count);
    if (index == null) {
      prefix[row + 1] = prefix[row];
      continue;
    }
    prefix[row + 1] =
      prefix[row] + (heights[index] ?? fallbackHeight) + gap;
  }
  return { prefix, periodH: Math.max(prefix[rows] ?? 1, 1), cols, rows };
}
