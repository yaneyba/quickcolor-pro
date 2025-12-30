/**
 * Color Extraction Service (Web)
 *
 * Uses Canvas API to sample pixel data and extract dominant colors.
 */

export interface ExtractedColors {
  dominant: string;
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  muted: string;
  darkMuted: string;
  lightMuted: string;
}

export interface ColorExtractionOptions {
  fallbackColors?: ExtractedColors;
  quality?: "low" | "medium" | "high";
}

export const DEFAULT_COLORS: ExtractedColors = {
  dominant: "#FF6B35",
  vibrant: "#4ADE80",
  darkVibrant: "#F87171",
  lightVibrant: "#FBBF24",
  muted: "#0a7ea4",
  darkMuted: "#E879F9",
  lightMuted: "#38BDF8",
};

interface ColorData {
  r: number;
  g: number;
  b: number;
  count: number;
  saturation: number;
  lightness: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

function getQualitySettings(quality: "low" | "medium" | "high"): {
  maxSize: number;
  quantizationLevel: number;
} {
  switch (quality) {
    case "low":
      return { maxSize: 50, quantizationLevel: 32 };
    case "high":
      return { maxSize: 200, quantizationLevel: 16 };
    case "medium":
    default:
      return { maxSize: 100, quantizationLevel: 24 };
  }
}

// Proper RGB to HSL conversion
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h, s, l };
}

function extractColorsFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  quantizationLevel: number
): ColorData[] {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Quantize to reduce color space (use smaller buckets for better color detection)
    const qr = Math.floor(r / quantizationLevel) * quantizationLevel;
    const qg = Math.floor(g / quantizationLevel) * quantizationLevel;
    const qb = Math.floor(b / quantizationLevel) * quantizationLevel;
    const key = `${qr},${qg},${qb}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
      existing.r += r;
      existing.g += g;
      existing.b += b;
    } else {
      colorMap.set(key, { count: 1, r, g, b });
    }
  }

  // Convert to array, calculate averages, and add HSL values
  return Array.from(colorMap.entries())
    .map(([_, data]) => {
      const avgR = Math.round(data.r / data.count);
      const avgG = Math.round(data.g / data.count);
      const avgB = Math.round(data.b / data.count);
      const hsl = rgbToHsl(avgR, avgG, avgB);
      return {
        r: avgR,
        g: avgG,
        b: avgB,
        count: data.count,
        saturation: hsl.s,
        lightness: hsl.l,
      };
    })
    .sort((a, b) => b.count - a.count);
}

function findColorByType(
  colors: ColorData[],
  filter: (c: ColorData) => boolean,
  excludeHexes: string[] = []
): string | null {
  const found = colors.find((c) => {
    const hex = rgbToHex(c.r, c.g, c.b);
    return filter(c) && !excludeHexes.includes(hex);
  });
  return found ? rgbToHex(found.r, found.g, found.b) : null;
}

function categorizeColors(colors: ColorData[]): ExtractedColors {
  const dominant = colors[0]
    ? rgbToHex(colors[0].r, colors[0].g, colors[0].b)
    : DEFAULT_COLORS.dominant;

  // Sort by saturation * count to find the most prominent vibrant color
  // This helps catch accent colors that may not be the most frequent
  const sortedBySaturation = [...colors].sort(
    (a, b) => b.saturation * Math.sqrt(b.count) - a.saturation * Math.sqrt(a.count)
  );

  // Find vibrant: high saturation, medium lightness
  const vibrant =
    findColorByType(
      sortedBySaturation,
      (c) => c.saturation > 0.4 && c.lightness > 0.25 && c.lightness < 0.75,
      [dominant]
    ) ||
    findColorByType(
      colors,
      (c) => c.saturation > 0.3 && c.lightness > 0.2 && c.lightness < 0.8,
      [dominant]
    ) ||
    dominant;

  // Find dark vibrant: saturated and dark
  const darkVibrant =
    findColorByType(
      sortedBySaturation,
      (c) => c.saturation > 0.3 && c.lightness < 0.45,
      [dominant, vibrant]
    ) ||
    findColorByType(colors, (c) => c.lightness < 0.4, [dominant, vibrant]) ||
    dominant;

  // Find light vibrant: saturated and light
  const lightVibrant =
    findColorByType(
      sortedBySaturation,
      (c) => c.saturation > 0.3 && c.lightness > 0.55,
      [dominant, vibrant, darkVibrant]
    ) ||
    findColorByType(colors, (c) => c.lightness > 0.6, [
      dominant,
      vibrant,
      darkVibrant,
    ]) ||
    dominant;

  // Find muted: low saturation, medium lightness
  const muted =
    findColorByType(
      colors,
      (c) => c.saturation < 0.4 && c.lightness > 0.25 && c.lightness < 0.75,
      [dominant]
    ) || dominant;

  // Find dark muted: low saturation, dark
  const darkMuted =
    findColorByType(colors, (c) => c.saturation < 0.35 && c.lightness < 0.35, [
      dominant,
      muted,
    ]) || darkVibrant;

  // Find light muted: low saturation, light
  const lightMuted =
    findColorByType(colors, (c) => c.saturation < 0.35 && c.lightness > 0.65, [
      dominant,
      muted,
      darkMuted,
    ]) || lightVibrant;

  return {
    dominant,
    vibrant,
    darkVibrant,
    lightVibrant,
    muted,
    darkMuted,
    lightMuted,
  };
}

export async function extractColorsFromImage(
  imageUri: string,
  options?: ColorExtractionOptions
): Promise<ExtractedColors> {
  const fallback = options?.fallbackColors ?? DEFAULT_COLORS;
  const quality = options?.quality ?? "medium";
  const { maxSize, quantizationLevel } = getQualitySettings(quality);

  return new Promise((resolve) => {
    // Use the browser's native Image constructor
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(fallback);
          return;
        }

        // Scale down for performance while maintaining aspect ratio
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const colors = extractColorsFromCanvas(
          ctx,
          canvas.width,
          canvas.height,
          quantizationLevel
        );

        if (colors.length === 0) {
          resolve(fallback);
          return;
        }

        resolve(categorizeColors(colors));
      } catch (error) {
        console.error("Web color extraction failed:", error);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for color extraction");
      resolve(fallback);
    };

    img.src = imageUri;
  });
}
