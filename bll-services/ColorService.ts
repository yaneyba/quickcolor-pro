/**
 * ColorService - Business Logic Layer for color operations
 *
 * Handles:
 * - Recent colors management
 * - Color format conversions
 * - Color validation
 * - Clipboard operations
 */

import * as Clipboard from "expo-clipboard";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

import { DataProviderFactory, type IDataProvider } from "@/dal-data/providers";
import {
  hexToRgb,
  rgbToHsv,
  rgbToHex,
  hsvToRgb,
  isValidHex,
  type RGB,
  type HSV,
  type ColorFormats,
} from "@/lib/color-utils";
import type { ServiceResult, IService, IObservableService, ServiceListener } from "./IService";

// Constants
const STORAGE_KEY = "colors";
const MAX_RECENT_COLORS = 20;
const DEFAULT_RECENT_COLORS = [
  "#FF6B35",
  "#4ADE80",
  "#F87171",
  "#FBBF24",
  "#0a7ea4",
];

/**
 * Color data structure for internal use
 */
export interface ColorData {
  hex: string;
  timestamp: number;
}

/**
 * ColorService - Manages color operations and recent colors
 */
class ColorServiceImpl implements IService, IObservableService<string[]> {
  private provider: IDataProvider<string[]>;
  private recentColors: string[] = DEFAULT_RECENT_COLORS;
  private listeners: Set<ServiceListener<string[]>> = new Set();
  private initialized = false;

  constructor() {
    this.provider = DataProviderFactory.create<string[]>("async-storage", {
      namespace: "@quickcolor",
    });
  }

  // IService implementation

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const stored = await this.provider.get(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      this.recentColors = stored;
    }
    this.initialized = true;
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
    this.initialized = false;
  }

  // IObservableService implementation

  subscribe(listener: ServiceListener<string[]>): () => void {
    this.listeners.add(listener);
    // Immediately call with current value
    listener(this.recentColors);
    return () => this.listeners.delete(listener);
  }

  getCurrentValue(): string[] {
    return [...this.recentColors];
  }

  private notifyListeners(): void {
    const colors = this.getCurrentValue();
    for (const listener of this.listeners) {
      listener(colors);
    }
  }

  // Business Logic Methods

  /**
   * Get all recent colors
   */
  async getRecentColors(): Promise<ServiceResult<string[]>> {
    try {
      await this.ensureInitialized();
      return { success: true, data: [...this.recentColors] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get recent colors",
      };
    }
  }

  /**
   * Add a color to recent colors
   * - Validates the color
   * - Removes duplicates
   * - Limits to MAX_RECENT_COLORS
   */
  async addRecentColor(hex: string): Promise<ServiceResult<string[]>> {
    try {
      await this.ensureInitialized();

      // Validate
      const normalizedHex = this.normalizeHex(hex);
      if (!isValidHex(normalizedHex)) {
        return { success: false, error: "Invalid hex color", code: "INVALID_COLOR" };
      }

      // Remove if exists (to move to front)
      const filtered = this.recentColors.filter(
        (c) => c.toLowerCase() !== normalizedHex.toLowerCase()
      );

      // Add to front
      const newColors = [normalizedHex, ...filtered].slice(0, MAX_RECENT_COLORS);

      // Persist
      await this.provider.set(STORAGE_KEY, newColors);
      this.recentColors = newColors;
      this.notifyListeners();

      return { success: true, data: newColors };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add color",
      };
    }
  }

  /**
   * Remove a color from recent colors
   */
  async removeRecentColor(hex: string): Promise<ServiceResult<string[]>> {
    try {
      await this.ensureInitialized();

      const normalizedHex = this.normalizeHex(hex);
      const newColors = this.recentColors.filter(
        (c) => c.toLowerCase() !== normalizedHex.toLowerCase()
      );

      await this.provider.set(STORAGE_KEY, newColors);
      this.recentColors = newColors;
      this.notifyListeners();

      return { success: true, data: newColors };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove color",
      };
    }
  }

  /**
   * Clear all recent colors
   */
  async clearRecentColors(): Promise<ServiceResult<void>> {
    try {
      await this.provider.delete(STORAGE_KEY);
      this.recentColors = [];
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear colors",
      };
    }
  }

  /**
   * Reset to default colors
   */
  async resetToDefaults(): Promise<ServiceResult<string[]>> {
    try {
      await this.provider.set(STORAGE_KEY, DEFAULT_RECENT_COLORS);
      this.recentColors = [...DEFAULT_RECENT_COLORS];
      this.notifyListeners();
      return { success: true, data: this.recentColors };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset colors",
      };
    }
  }

  // Color Conversion Methods (pure functions, no state)

  /**
   * Get all color formats from a hex color
   */
  getColorFormats(hex: string): ServiceResult<ColorFormats> {
    try {
      const normalizedHex = this.normalizeHex(hex);
      if (!isValidHex(normalizedHex)) {
        return { success: false, error: "Invalid hex color", code: "INVALID_COLOR" };
      }

      const rgb = hexToRgb(normalizedHex);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

      return {
        success: true,
        data: {
          hex: normalizedHex,
          rgb,
          hsv,
          rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          hsvString: `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to convert color",
      };
    }
  }

  /**
   * Convert RGB to Hex
   */
  rgbToHex(r: number, g: number, b: number): ServiceResult<string> {
    if (!this.isValidRgbValue(r) || !this.isValidRgbValue(g) || !this.isValidRgbValue(b)) {
      return { success: false, error: "Invalid RGB values (must be 0-255)" };
    }
    return { success: true, data: rgbToHex(r, g, b) };
  }

  /**
   * Convert HSV to Hex
   */
  hsvToHex(h: number, s: number, v: number): ServiceResult<string> {
    if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) {
      return { success: false, error: "Invalid HSV values" };
    }
    const rgb = hsvToRgb(h, s, v);
    return { success: true, data: rgbToHex(rgb.r, rgb.g, rgb.b) };
  }

  // Clipboard Operations

  /**
   * Copy color to clipboard
   */
  async copyToClipboard(
    text: string,
    withHaptic = true
  ): Promise<ServiceResult<void>> {
    try {
      await Clipboard.setStringAsync(text);

      if (withHaptic && Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to copy to clipboard",
      };
    }
  }

  /**
   * Read color from clipboard
   */
  async readFromClipboard(): Promise<ServiceResult<string | null>> {
    try {
      const text = await Clipboard.getStringAsync();

      // Try to parse as hex color
      if (text) {
        const normalizedHex = this.normalizeHex(text.trim());
        if (isValidHex(normalizedHex)) {
          return { success: true, data: normalizedHex };
        }
      }

      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to read clipboard",
      };
    }
  }

  // Validation Methods

  /**
   * Validate a hex color
   */
  isValidHex(hex: string): boolean {
    return isValidHex(this.normalizeHex(hex));
  }

  /**
   * Normalize hex color (ensure # prefix and uppercase)
   */
  normalizeHex(hex: string): string {
    let normalized = hex.trim();
    if (!normalized.startsWith("#")) {
      normalized = `#${normalized}`;
    }
    return normalized.toUpperCase();
  }

  // Private Helpers

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private isValidRgbValue(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 255;
  }
}

// Export singleton instance
export const ColorService = new ColorServiceImpl();
