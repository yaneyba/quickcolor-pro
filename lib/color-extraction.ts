/**
 * Color Extraction Service (Native - iOS/Android)
 *
 * Uses react-native-image-colors when available (production builds),
 * falls back to JS-based extraction for Expo Go compatibility.
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

// Type definitions for platform-specific results
interface IOSImageColors {
  background: string;
  primary: string;
  secondary: string;
  detail: string;
  platform: "ios";
}

interface AndroidImageColors {
  dominant: string;
  average: string;
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  darkMuted: string;
  lightMuted: string;
  muted: string;
  platform: "android";
}

// Try to dynamically import native module - will fail in Expo Go
let getColorsNative: ((uri: string, config: { fallback: string; cache: boolean; key: string }) => Promise<IOSImageColors | AndroidImageColors>) | null = null;

try {
  // Dynamic require to avoid crash if native module not available
  const imageColors = require("react-native-image-colors");
  getColorsNative = imageColors.getColors;
} catch {
  // Native module not available (Expo Go), will use JS fallback
  console.log("react-native-image-colors not available, using JS fallback");
}

// JS-based color extraction fallback using fetch + base64 parsing
async function extractColorsJS(
  imageUri: string,
  fallback: ExtractedColors
): Promise<ExtractedColors> {
  try {
    // Fetch the image and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Read blob as array buffer to analyze pixel data
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Simple color extraction from image bytes
    // This is a basic approach - samples colors from the image data
    const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

    // Sample every N bytes looking for RGB patterns
    // This works for uncompressed formats and provides rough color estimates
    const sampleRate = Math.max(1, Math.floor(bytes.length / 10000));

    for (let i = 0; i < bytes.length - 3; i += sampleRate * 3) {
      const r = bytes[i];
      const g = bytes[i + 1];
      const b = bytes[i + 2];

      // Skip very dark or very light (likely not meaningful colors)
      const brightness = (r + g + b) / 3;
      if (brightness < 20 || brightness > 235) continue;

      // Quantize to reduce color space
      const qr = Math.floor(r / 32) * 32;
      const qg = Math.floor(g / 32) * 32;
      const qb = Math.floor(b / 32) * 32;
      const key = `${qr},${qg},${qb}`;

      const existing = colorMap.get(key);
      if (existing) {
        existing.count++;
        existing.r = Math.round((existing.r * (existing.count - 1) + r) / existing.count);
        existing.g = Math.round((existing.g * (existing.count - 1) + g) / existing.count);
        existing.b = Math.round((existing.b * (existing.count - 1) + b) / existing.count);
      } else {
        colorMap.set(key, { r, g, b, count: 1 });
      }
    }

    // Sort by frequency
    const sortedColors = Array.from(colorMap.values())
      .filter(c => c.count > 5)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (sortedColors.length === 0) {
      return fallback;
    }

    const rgbToHex = (r: number, g: number, b: number) =>
      `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

    const dominant = sortedColors[0]
      ? rgbToHex(sortedColors[0].r, sortedColors[0].g, sortedColors[0].b)
      : fallback.dominant;

    // Find vibrant (high saturation, medium brightness)
    const findVibrant = () => {
      for (const c of sortedColors) {
        const max = Math.max(c.r, c.g, c.b);
        const min = Math.min(c.r, c.g, c.b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const brightness = (c.r + c.g + c.b) / 3 / 255;
        if (saturation > 0.4 && brightness > 0.3 && brightness < 0.7) {
          return rgbToHex(c.r, c.g, c.b);
        }
      }
      return dominant;
    };

    // Find dark variant
    const findDark = () => {
      for (const c of sortedColors) {
        const brightness = (c.r + c.g + c.b) / 3 / 255;
        if (brightness < 0.4) {
          return rgbToHex(c.r, c.g, c.b);
        }
      }
      return dominant;
    };

    // Find light variant
    const findLight = () => {
      for (const c of sortedColors) {
        const brightness = (c.r + c.g + c.b) / 3 / 255;
        if (brightness > 0.6) {
          return rgbToHex(c.r, c.g, c.b);
        }
      }
      return dominant;
    };

    // Find muted (low saturation)
    const findMuted = () => {
      for (const c of sortedColors) {
        const max = Math.max(c.r, c.g, c.b);
        const min = Math.min(c.r, c.g, c.b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation < 0.3) {
          return rgbToHex(c.r, c.g, c.b);
        }
      }
      return dominant;
    };

    return {
      dominant,
      vibrant: findVibrant(),
      darkVibrant: findDark(),
      lightVibrant: findLight(),
      muted: findMuted(),
      darkMuted: findDark(),
      lightMuted: findLight(),
    };
  } catch (error) {
    console.error("JS color extraction failed:", error);
    return fallback;
  }
}

export async function extractColorsFromImage(
  imageUri: string,
  options?: ColorExtractionOptions
): Promise<ExtractedColors> {
  const fallback = options?.fallbackColors ?? DEFAULT_COLORS;

  // If native module is available, use it
  if (getColorsNative) {
    try {
      const result = await getColorsNative(imageUri, {
        fallback: fallback.dominant,
        cache: true,
        key: imageUri,
      });

      if (result.platform === "ios") {
        const iosResult = result as IOSImageColors;
        return {
          dominant: iosResult.background || fallback.dominant,
          vibrant: iosResult.primary || fallback.vibrant,
          darkVibrant: iosResult.detail || fallback.darkVibrant,
          lightVibrant: iosResult.secondary || fallback.lightVibrant,
          muted: iosResult.background || fallback.muted,
          darkMuted: iosResult.detail || fallback.darkMuted,
          lightMuted: iosResult.secondary || fallback.lightMuted,
        };
      }

      // Android
      const androidResult = result as AndroidImageColors;
      return {
        dominant: androidResult.dominant || fallback.dominant,
        vibrant: androidResult.vibrant || fallback.vibrant,
        darkVibrant: androidResult.darkVibrant || fallback.darkVibrant,
        lightVibrant: androidResult.lightVibrant || fallback.lightVibrant,
        muted: androidResult.muted || fallback.muted,
        darkMuted: androidResult.darkMuted || fallback.darkMuted,
        lightMuted: androidResult.lightMuted || fallback.lightMuted,
      };
    } catch (error) {
      console.error("Native color extraction failed, using JS fallback:", error);
    }
  }

  // Fallback to JS-based extraction
  return extractColorsJS(imageUri, fallback);
}
