export type RibbonDialParams = {
  lineCount: number;
  thickWidth: number;
  thinWidth: number;
  widthPower: number;
  restBend: number;
  hoverBend: number;
  warpRadius: number;
  verticalSpread: number;
  warpStrength: number;
  curvePower: number;
  follow: number;
  grain: number;
};

/** Shipped defaults — subtle rightward lean at rest; one-directional Gaussian warp on hover */
export const ribbonDefaults: RibbonDialParams = {
  lineCount: 38,
  thickWidth: 4.8,
  thinWidth: 0.45,
  widthPower: 1.25,
  restBend: 9,
  hoverBend: 28,
  warpRadius: 0.45,
  verticalSpread: 0.38,
  warpStrength: 0.88,
  curvePower: 1.05,
  follow: 0.11,
  grain: 0.04,
};

/** DialKit — [default, min, max, step] */
export const ribbonDialConfig = {
  lineCount: [38, 20, 56, 1],
  thickWidth: [4.8, 2, 8, 0.1],
  thinWidth: [0.45, 0.1, 1.5, 0.05],
  widthPower: [1.25, 0.8, 2.2, 0.05],
  restBend: [9, 0, 36, 0.5],
  hoverBend: [28, 12, 56, 0.5],
  warpRadius: [0.45, 0.12, 0.75, 0.01],
  verticalSpread: [0.38, 0.15, 0.85, 0.01],
  warpStrength: [0.88, 0.3, 2.5, 0.05],
  curvePower: [1.05, 0.6, 2, 0.05],
  follow: [0.11, 0.03, 0.25, 0.01],
  grain: [0.04, 0, 0.12, 0.005],
} as const;
