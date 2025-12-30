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
