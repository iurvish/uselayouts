export type RibbonDialParams = {
  lineCount: number;
  thickWidth: number;
  thinWidth: number;
  widthPower: number;
  restBend: number;
  hoverBend: number;
  restFocusX: number;
  lensWidth: number;
  arcSharpness: number;
  arcFalloff: number;
  arcGain: number;
  curvePower: number;
  follow: number;
  grain: number;
};

/** Shipped defaults — subtle outward bulge at restFocusX; cursor-tracking cylindrical warp on hover */
export const ribbonDefaults: RibbonDialParams = {
  lineCount: 38,
  thickWidth: 4.8,
  thinWidth: 0.45,
  widthPower: 1.25,
  restBend: 12,
  hoverBend: 34,
  restFocusX: 0.62,
  lensWidth: 0.68,
  arcSharpness: 1.2,
  arcFalloff: 0.8,
  arcGain: 0.95,
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
  restBend: [12, 0, 36, 0.5],
  hoverBend: [34, 16, 64, 0.5],
  restFocusX: [0.62, 0.2, 0.85, 0.01],
  lensWidth: [0.68, 0.18, 0.85, 0.01],
  arcSharpness: [1.2, 0.5, 4, 0.1],
  arcFalloff: [0.8, 0.15, 1.2, 0.02],
  arcGain: [0.95, 0.5, 2, 0.05],
  curvePower: [1.05, 0.6, 2, 0.05],
  follow: [0.11, 0.03, 0.25, 0.01],
  grain: [0.04, 0, 0.12, 0.005],
} as const;
