/**
 * useColorService - React hook for color operations
 *
 * Provides access to color conversion, validation,
 * and clipboard operations from ColorService.
 */

import { useCallback } from "react";
import { ColorService } from "@/services";
import type { ColorFormats } from "@/lib/color-utils";

interface UseColorServiceResult {
  /** Get all color formats from a hex color */
  getFormats: (hex: string) => ColorFormats | null;
  /** Validate a hex color */
  isValidHex: (hex: string) => boolean;
  /** Normalize a hex color */
  normalizeHex: (hex: string) => string;
  /** Convert RGB to Hex */
  rgbToHex: (r: number, g: number, b: number) => string | null;
  /** Convert HSV to Hex */
  hsvToHex: (h: number, s: number, v: number) => string | null;
  /** Copy to clipboard */
  copyToClipboard: (text: string, withHaptic?: boolean) => Promise<boolean>;
  /** Read color from clipboard */
  readFromClipboard: () => Promise<string | null>;
}

export function useColorService(): UseColorServiceResult {
  const getFormats = useCallback((hex: string): ColorFormats | null => {
    const result = ColorService.getColorFormats(hex);
    return result.success ? result.data! : null;
  }, []);

  const isValidHex = useCallback((hex: string): boolean => {
    return ColorService.isValidHex(hex);
  }, []);

  const normalizeHex = useCallback((hex: string): string => {
    return ColorService.normalizeHex(hex);
  }, []);

  const rgbToHex = useCallback(
    (r: number, g: number, b: number): string | null => {
      const result = ColorService.rgbToHex(r, g, b);
      return result.success ? result.data! : null;
    },
    []
  );

  const hsvToHex = useCallback(
    (h: number, s: number, v: number): string | null => {
      const result = ColorService.hsvToHex(h, s, v);
      return result.success ? result.data! : null;
    },
    []
  );

  const copyToClipboard = useCallback(
    async (text: string, withHaptic = true): Promise<boolean> => {
      const result = await ColorService.copyToClipboard(text, withHaptic);
      return result.success;
    },
    []
  );

  const readFromClipboard = useCallback(async (): Promise<string | null> => {
    const result = await ColorService.readFromClipboard();
    return result.success ? result.data! : null;
  }, []);

  return {
    getFormats,
    isValidHex,
    normalizeHex,
    rgbToHex,
    hsvToHex,
    copyToClipboard,
    readFromClipboard,
  };
}
