/**
 * Color utility functions for format conversions and color manipulation
 */

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface ColorFormats {
  hex: string;
  rgb: RGB;
  hsv: HSV;
  rgbString: string;
  hsvString: string;
}

/**
 * Convert HEX color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r = 0;
  let g = 0;
  let b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Get all color formats from HEX
 */
export function getColorFormats(hex: string): ColorFormats {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  return {
    hex: hex.toUpperCase(),
    rgb,
    hsv,
    rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsvString: `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`,
  };
}

/**
 * Extract color from pixel data at coordinates
 */
export function getColorAtPixel(
  imageData: Uint8ClampedArray,
  x: number,
  y: number,
  width: number
): string {
  const index = (y * width + x) * 4;
  const r = imageData[index];
  const g = imageData[index + 1];
  const b = imageData[index + 2];
  return rgbToHex(r, g, b);
}

/**
 * Generate a palette of dominant colors from image data
 */
export function extractPaletteFromImage(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  colorCount: number = 5
): string[] {
  const colors: Map<string, number> = new Map();
  const step = 10; // Sample every 10th pixel for performance

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const hex = getColorAtPixel(imageData, x, y, width);
      colors.set(hex, (colors.get(hex) || 0) + 1);
    }
  }

  // Sort by frequency and return top N colors
  return Array.from(colors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount)
    .map(([hex]) => hex);
}

/**
 * Calculate contrast ratio between two colors (for accessibility)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const srgb = val / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate a gradient between two colors
 */
export function generateGradient(
  startHex: string,
  endHex: string,
  steps: number
): string[] {
  const startRgb = hexToRgb(startHex);
  const endRgb = hexToRgb(endHex);
  const gradient: string[] = [];

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * ratio);
    const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * ratio);
    const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * ratio);
    gradient.push(rgbToHex(r, g, b));
  }

  return gradient;
}

/**
 * Color Harmony Types
 */
export type HarmonyType =
  | "complementary"
  | "triadic"
  | "analogous"
  | "split-complementary"
  | "tetradic";

/**
 * Get complementary color (opposite on color wheel)
 */
export function getComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const complementaryH = (hsv.h + 180) % 360;
  const complementaryRgb = hsvToRgb(complementaryH, hsv.s, hsv.v);
  return [hex, rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b)];
}

/**
 * Get triadic colors (3 colors equally spaced on color wheel)
 */
export function getTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const colors = [hex];
  for (const offset of [120, 240]) {
    const newH = (hsv.h + offset) % 360;
    const newRgb = hsvToRgb(newH, hsv.s, hsv.v);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return colors;
}

/**
 * Get analogous colors (adjacent colors on color wheel)
 */
export function getAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const colors = [];
  for (const offset of [-30, -15, 0, 15, 30]) {
    const newH = (hsv.h + offset + 360) % 360;
    const newRgb = hsvToRgb(newH, hsv.s, hsv.v);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return colors;
}

/**
 * Get split-complementary colors (complementary + adjacent)
 */
export function getSplitComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const colors = [hex];
  for (const offset of [150, 210]) {
    const newH = (hsv.h + offset) % 360;
    const newRgb = hsvToRgb(newH, hsv.s, hsv.v);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return colors;
}

/**
 * Get tetradic/square colors (4 colors equally spaced)
 */
export function getTetradic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const colors = [hex];
  for (const offset of [90, 180, 270]) {
    const newH = (hsv.h + offset) % 360;
    const newRgb = hsvToRgb(newH, hsv.s, hsv.v);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return colors;
}

/**
 * Get harmony colors by type
 */
export function getHarmonyColors(hex: string, type: HarmonyType): string[] {
  switch (type) {
    case "complementary":
      return getComplementary(hex);
    case "triadic":
      return getTriadic(hex);
    case "analogous":
      return getAnalogous(hex);
    case "split-complementary":
      return getSplitComplementary(hex);
    case "tetradic":
      return getTetradic(hex);
    default:
      return [hex];
  }
}

/**
 * Get WCAG accessibility level based on contrast ratio
 */
export function getWcagLevel(contrastRatio: number): {
  level: "AAA" | "AA" | "A" | "Fail";
  largeText: boolean;
  normalText: boolean;
} {
  return {
    level: contrastRatio >= 7 ? "AAA" : contrastRatio >= 4.5 ? "AA" : contrastRatio >= 3 ? "A" : "Fail",
    largeText: contrastRatio >= 3,
    normalText: contrastRatio >= 4.5,
  };
}

/**
 * Simulate color as seen by colorblind users
 */
export function simulateColorBlindness(
  hex: string,
  type: "protanopia" | "deuteranopia" | "tritanopia"
): string {
  const rgb = hexToRgb(hex);
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Transformation matrices for different types of color blindness
  const matrices = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  };

  const matrix = matrices[type];
  const newR = Math.min(255, Math.max(0, Math.round((matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255)));
  const newG = Math.min(255, Math.max(0, Math.round((matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255)));
  const newB = Math.min(255, Math.max(0, Math.round((matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255)));

  return rgbToHex(newR, newG, newB);
}

/**
 * Extract dominant colors from image using k-means-like clustering
 */
export function extractDominantColors(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  colorCount: number = 5
): string[] {
  const pixels: RGB[] = [];
  const step = Math.max(1, Math.floor((width * height) / 10000)); // Sample max 10000 pixels

  for (let i = 0; i < imageData.length; i += 4 * step) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Skip very dark or very light pixels
    const brightness = (r + g + b) / 3;
    if (brightness < 20 || brightness > 235) continue;

    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) {
    return ["#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4"];
  }

  // Simple clustering by quantizing colors
  const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (const pixel of pixels) {
    // Quantize to reduce color space (divide by 32 to get ~8 levels per channel)
    const qr = Math.floor(pixel.r / 32) * 32;
    const qg = Math.floor(pixel.g / 32) * 32;
    const qb = Math.floor(pixel.b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
      existing.r += pixel.r;
      existing.g += pixel.g;
      existing.b += pixel.b;
    } else {
      colorMap.set(key, { count: 1, r: pixel.r, g: pixel.g, b: pixel.b });
    }
  }

  // Sort by count and get top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, colorCount * 2); // Get more than needed to filter similar colors

  // Get average color for each cluster and filter similar colors
  const result: string[] = [];
  for (const [, data] of sortedColors) {
    const avgR = Math.round(data.r / data.count);
    const avgG = Math.round(data.g / data.count);
    const avgB = Math.round(data.b / data.count);
    const hex = rgbToHex(avgR, avgG, avgB);

    // Check if too similar to existing colors
    const isSimilar = result.some((existingHex) => {
      const existingRgb = hexToRgb(existingHex);
      const diff = Math.abs(existingRgb.r - avgR) + Math.abs(existingRgb.g - avgG) + Math.abs(existingRgb.b - avgB);
      return diff < 60; // Threshold for similarity
    });

    if (!isSimilar) {
      result.push(hex);
    }

    if (result.length >= colorCount) break;
  }

  // Fill with defaults if not enough colors
  const defaults = ["#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4"];
  while (result.length < colorCount) {
    result.push(defaults[result.length % defaults.length]);
  }

  return result;
}
