/**
 * useRecentColors - React hook for recent colors
 *
 * Provides reactive access to the ColorService's recent colors
 * with loading states and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import { ColorService } from "@/bll-services";

interface UseRecentColorsResult {
  /** Current list of recent colors */
  colors: string[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Add a color to recent colors */
  addColor: (hex: string) => Promise<boolean>;
  /** Remove a color from recent colors */
  removeColor: (hex: string) => Promise<boolean>;
  /** Clear all recent colors */
  clearColors: () => Promise<boolean>;
  /** Reset to default colors */
  resetToDefaults: () => Promise<boolean>;
  /** Refresh colors from storage */
  refresh: () => Promise<void>;
}

export function useRecentColors(): UseRecentColorsResult {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to color changes
  useEffect(() => {
    const unsubscribe = ColorService.subscribe((newColors) => {
      setColors(newColors);
      setLoading(false);
    });

    // Initialize service if not already
    ColorService.initialize().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to initialize");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addColor = useCallback(async (hex: string): Promise<boolean> => {
    setError(null);
    const result = await ColorService.addRecentColor(hex);
    if (!result.success) {
      setError(result.error ?? "Failed to add color");
      return false;
    }
    return true;
  }, []);

  const removeColor = useCallback(async (hex: string): Promise<boolean> => {
    setError(null);
    const result = await ColorService.removeRecentColor(hex);
    if (!result.success) {
      setError(result.error ?? "Failed to remove color");
      return false;
    }
    return true;
  }, []);

  const clearColors = useCallback(async (): Promise<boolean> => {
    setError(null);
    const result = await ColorService.clearRecentColors();
    if (!result.success) {
      setError(result.error ?? "Failed to clear colors");
      return false;
    }
    return true;
  }, []);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setError(null);
    const result = await ColorService.resetToDefaults();
    if (!result.success) {
      setError(result.error ?? "Failed to reset colors");
      return false;
    }
    return true;
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const result = await ColorService.getRecentColors();
    if (result.success && result.data) {
      setColors(result.data);
    } else {
      setError(result.error ?? "Failed to refresh colors");
    }
    setLoading(false);
  }, []);

  return {
    colors,
    loading,
    error,
    addColor,
    removeColor,
    clearColors,
    resetToDefaults,
    refresh,
  };
}
