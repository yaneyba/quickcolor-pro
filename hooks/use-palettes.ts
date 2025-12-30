/**
 * usePalettes - React hook for palette management
 *
 * Provides reactive access to the PaletteService
 * with loading states and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import {
  PaletteService,
  type Palette,
  type CreatePaletteInput,
  type UpdatePaletteInput,
} from "@/services";

interface UsePalettesResult {
  /** Current list of palettes */
  palettes: Palette[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether user can create more palettes */
  canCreate: boolean;
  /** Current palette limit */
  limit: number;
  /** Create a new palette */
  createPalette: (input: CreatePaletteInput) => Promise<Palette | null>;
  /** Update an existing palette */
  updatePalette: (input: UpdatePaletteInput) => Promise<Palette | null>;
  /** Delete a palette */
  deletePalette: (id: string) => Promise<boolean>;
  /** Add a color to a palette */
  addColorToPalette: (paletteId: string, color: string) => Promise<boolean>;
  /** Remove a color from a palette */
  removeColorFromPalette: (paletteId: string, color: string) => Promise<boolean>;
  /** Search palettes by name */
  searchPalettes: (query: string) => Promise<Palette[]>;
  /** Get a single palette by ID */
  getPalette: (id: string) => Palette | undefined;
  /** Refresh palettes from storage */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

export function usePalettes(): UsePalettesResult {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to palette changes
  useEffect(() => {
    const unsubscribe = PaletteService.subscribe((newPalettes) => {
      setPalettes(newPalettes);
      setLoading(false);
    });

    // Initialize service if not already
    PaletteService.initialize().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to initialize");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createPalette = useCallback(
    async (input: CreatePaletteInput): Promise<Palette | null> => {
      setError(null);
      const result = await PaletteService.createPalette(input);
      if (!result.success) {
        setError(result.error ?? "Failed to create palette");
        return null;
      }
      return result.data!;
    },
    []
  );

  const updatePalette = useCallback(
    async (input: UpdatePaletteInput): Promise<Palette | null> => {
      setError(null);
      const result = await PaletteService.updatePalette(input);
      if (!result.success) {
        setError(result.error ?? "Failed to update palette");
        return null;
      }
      return result.data!;
    },
    []
  );

  const deletePalette = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    const result = await PaletteService.deletePalette(id);
    if (!result.success) {
      setError(result.error ?? "Failed to delete palette");
      return false;
    }
    return true;
  }, []);

  const addColorToPalette = useCallback(
    async (paletteId: string, color: string): Promise<boolean> => {
      setError(null);
      const result = await PaletteService.addColorToPalette(paletteId, color);
      if (!result.success) {
        setError(result.error ?? "Failed to add color");
        return false;
      }
      return true;
    },
    []
  );

  const removeColorFromPalette = useCallback(
    async (paletteId: string, color: string): Promise<boolean> => {
      setError(null);
      const result = await PaletteService.removeColorFromPalette(paletteId, color);
      if (!result.success) {
        setError(result.error ?? "Failed to remove color");
        return false;
      }
      return true;
    },
    []
  );

  const searchPalettes = useCallback(async (query: string): Promise<Palette[]> => {
    const result = await PaletteService.searchPalettes(query);
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  }, []);

  const getPalette = useCallback(
    (id: string): Palette | undefined => {
      return palettes.find((p) => p.id === id);
    },
    [palettes]
  );

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const result = await PaletteService.getAllPalettes();
    if (result.success && result.data) {
      setPalettes(result.data);
    } else {
      setError(result.error ?? "Failed to refresh palettes");
    }
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    palettes,
    loading,
    error,
    canCreate: PaletteService.canCreatePalette(),
    limit: PaletteService.getPaletteLimit(),
    createPalette,
    updatePalette,
    deletePalette,
    addColorToPalette,
    removeColorFromPalette,
    searchPalettes,
    getPalette,
    refresh,
    clearError,
  };
}

/**
 * usePalette - Hook for working with a single palette
 */
export function usePalette(id: string) {
  const { palettes, updatePalette, deletePalette, addColorToPalette, removeColorFromPalette } =
    usePalettes();

  const palette = palettes.find((p) => p.id === id);

  const update = useCallback(
    async (updates: Omit<UpdatePaletteInput, "id">) => {
      return updatePalette({ id, ...updates });
    },
    [id, updatePalette]
  );

  const remove = useCallback(async () => {
    return deletePalette(id);
  }, [id, deletePalette]);

  const addColor = useCallback(
    async (color: string) => {
      return addColorToPalette(id, color);
    },
    [id, addColorToPalette]
  );

  const removeColor = useCallback(
    async (color: string) => {
      return removeColorFromPalette(id, color);
    },
    [id, removeColorFromPalette]
  );

  return {
    palette,
    exists: !!palette,
    update,
    remove,
    addColor,
    removeColor,
  };
}
