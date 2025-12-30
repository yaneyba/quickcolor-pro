/**
 * PaletteService - Business Logic Layer for palette management
 *
 * Handles:
 * - Palette CRUD operations
 * - Palette validation
 * - Palette limits (free vs pro)
 */

import { DataProviderFactory, type IDataProvider, type Palette } from "@/dal-data/providers";
import type {
  ServiceResult,
  IService,
  IObservableService,
  ServiceListener,
  PaginatedResult,
} from "./IService";

// Constants
const STORAGE_KEY = "palettes";
const MAX_FREE_PALETTES = 5;
const MAX_PRO_PALETTES = 100;
const MAX_COLORS_PER_PALETTE = 20;

/**
 * Create palette input
 */
export interface CreatePaletteInput {
  name: string;
  colors: string[];
}

/**
 * Update palette input
 */
export interface UpdatePaletteInput {
  id: string;
  name?: string;
  colors?: string[];
}

/**
 * PaletteService - Manages color palettes
 */
class PaletteServiceImpl implements IService, IObservableService<Palette[]> {
  private provider: IDataProvider<Palette[]>;
  private palettes: Palette[] = [];
  private listeners: Set<ServiceListener<Palette[]>> = new Set();
  private initialized = false;
  private isPro = false; // TODO: Connect to billing service

  constructor() {
    this.provider = DataProviderFactory.create<Palette[]>("async-storage", {
      namespace: "@quickcolor",
    });
  }

  // IService implementation

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const stored = await this.provider.get(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      this.palettes = stored;
    }
    this.initialized = true;
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
    this.initialized = false;
  }

  // IObservableService implementation

  subscribe(listener: ServiceListener<Palette[]>): () => void {
    this.listeners.add(listener);
    listener(this.palettes);
    return () => this.listeners.delete(listener);
  }

  getCurrentValue(): Palette[] {
    return [...this.palettes];
  }

  private notifyListeners(): void {
    const palettes = this.getCurrentValue();
    for (const listener of this.listeners) {
      listener(palettes);
    }
  }

  // Configuration

  /**
   * Set pro status (affects limits)
   */
  setProStatus(isPro: boolean): void {
    this.isPro = isPro;
  }

  /**
   * Get current palette limit
   */
  getPaletteLimit(): number {
    return this.isPro ? MAX_PRO_PALETTES : MAX_FREE_PALETTES;
  }

  /**
   * Check if user can create more palettes
   */
  canCreatePalette(): boolean {
    return this.palettes.length < this.getPaletteLimit();
  }

  // CRUD Operations

  /**
   * Get all palettes
   */
  async getAllPalettes(): Promise<ServiceResult<Palette[]>> {
    try {
      await this.ensureInitialized();
      return { success: true, data: [...this.palettes] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get palettes",
      };
    }
  }

  /**
   * Get a palette by ID
   */
  async getPaletteById(id: string): Promise<ServiceResult<Palette | null>> {
    try {
      await this.ensureInitialized();
      const palette = this.palettes.find((p) => p.id === id) ?? null;
      return { success: true, data: palette };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get palette",
      };
    }
  }

  /**
   * Create a new palette
   */
  async createPalette(input: CreatePaletteInput): Promise<ServiceResult<Palette>> {
    try {
      await this.ensureInitialized();

      // Validate limits
      if (!this.canCreatePalette()) {
        return {
          success: false,
          error: `Palette limit reached (${this.getPaletteLimit()}). Upgrade to Pro for more.`,
          code: "LIMIT_REACHED",
        };
      }

      // Validate input
      const validation = this.validatePaletteInput(input);
      if (!validation.success) {
        return validation as ServiceResult<Palette>;
      }

      // Create palette
      const now = Date.now();
      const palette: Palette = {
        id: this.generateId(),
        name: input.name.trim(),
        colors: input.colors.slice(0, MAX_COLORS_PER_PALETTE),
        createdAt: now,
        updatedAt: now,
      };

      // Persist
      const newPalettes = [...this.palettes, palette];
      await this.provider.set(STORAGE_KEY, newPalettes);
      this.palettes = newPalettes;
      this.notifyListeners();

      return { success: true, data: palette };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create palette",
      };
    }
  }

  /**
   * Update an existing palette
   */
  async updatePalette(input: UpdatePaletteInput): Promise<ServiceResult<Palette>> {
    try {
      await this.ensureInitialized();

      const index = this.palettes.findIndex((p) => p.id === input.id);
      if (index === -1) {
        return { success: false, error: "Palette not found", code: "NOT_FOUND" };
      }

      // Validate input if provided
      if (input.name !== undefined || input.colors !== undefined) {
        const validation = this.validatePaletteInput({
          name: input.name ?? this.palettes[index].name,
          colors: input.colors ?? this.palettes[index].colors,
        });
        if (!validation.success) {
          return validation as ServiceResult<Palette>;
        }
      }

      // Update palette
      const updatedPalette: Palette = {
        ...this.palettes[index],
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.colors !== undefined && {
          colors: input.colors.slice(0, MAX_COLORS_PER_PALETTE),
        }),
        updatedAt: Date.now(),
      };

      // Persist
      const newPalettes = [...this.palettes];
      newPalettes[index] = updatedPalette;
      await this.provider.set(STORAGE_KEY, newPalettes);
      this.palettes = newPalettes;
      this.notifyListeners();

      return { success: true, data: updatedPalette };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update palette",
      };
    }
  }

  /**
   * Add a color to an existing palette
   */
  async addColorToPalette(paletteId: string, color: string): Promise<ServiceResult<Palette>> {
    try {
      await this.ensureInitialized();

      const palette = this.palettes.find((p) => p.id === paletteId);
      if (!palette) {
        return { success: false, error: "Palette not found", code: "NOT_FOUND" };
      }

      if (palette.colors.length >= MAX_COLORS_PER_PALETTE) {
        return {
          success: false,
          error: `Maximum ${MAX_COLORS_PER_PALETTE} colors per palette`,
          code: "COLOR_LIMIT",
        };
      }

      // Check for duplicate
      if (palette.colors.includes(color.toUpperCase())) {
        return { success: false, error: "Color already in palette", code: "DUPLICATE" };
      }

      return this.updatePalette({
        id: paletteId,
        colors: [...palette.colors, color.toUpperCase()],
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add color",
      };
    }
  }

  /**
   * Remove a color from a palette
   */
  async removeColorFromPalette(
    paletteId: string,
    color: string
  ): Promise<ServiceResult<Palette>> {
    try {
      await this.ensureInitialized();

      const palette = this.palettes.find((p) => p.id === paletteId);
      if (!palette) {
        return { success: false, error: "Palette not found", code: "NOT_FOUND" };
      }

      const newColors = palette.colors.filter(
        (c) => c.toUpperCase() !== color.toUpperCase()
      );

      return this.updatePalette({
        id: paletteId,
        colors: newColors,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove color",
      };
    }
  }

  /**
   * Delete a palette
   */
  async deletePalette(id: string): Promise<ServiceResult<void>> {
    try {
      await this.ensureInitialized();

      const index = this.palettes.findIndex((p) => p.id === id);
      if (index === -1) {
        return { success: false, error: "Palette not found", code: "NOT_FOUND" };
      }

      // Persist
      const newPalettes = this.palettes.filter((p) => p.id !== id);
      await this.provider.set(STORAGE_KEY, newPalettes);
      this.palettes = newPalettes;
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete palette",
      };
    }
  }

  /**
   * Clear all palettes
   */
  async clearAllPalettes(): Promise<ServiceResult<void>> {
    try {
      await this.provider.delete(STORAGE_KEY);
      this.palettes = [];
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear palettes",
      };
    }
  }

  // Search and Filter

  /**
   * Search palettes by name
   */
  async searchPalettes(query: string): Promise<ServiceResult<Palette[]>> {
    try {
      await this.ensureInitialized();
      const lowerQuery = query.toLowerCase();
      const results = this.palettes.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery)
      );
      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search palettes",
      };
    }
  }

  /**
   * Get palettes containing a specific color
   */
  async getPalettesWithColor(color: string): Promise<ServiceResult<Palette[]>> {
    try {
      await this.ensureInitialized();
      const upperColor = color.toUpperCase();
      const results = this.palettes.filter((p) =>
        p.colors.some((c) => c.toUpperCase() === upperColor)
      );
      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find palettes",
      };
    }
  }

  // Private Helpers

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private generateId(): string {
    return `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validatePaletteInput(input: CreatePaletteInput): ServiceResult<void> {
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Palette name is required", code: "INVALID_NAME" };
    }

    if (input.name.trim().length > 50) {
      return { success: false, error: "Palette name too long (max 50 chars)", code: "INVALID_NAME" };
    }

    if (!Array.isArray(input.colors)) {
      return { success: false, error: "Colors must be an array", code: "INVALID_COLORS" };
    }

    if (input.colors.length === 0) {
      return { success: false, error: "At least one color is required", code: "INVALID_COLORS" };
    }

    return { success: true };
  }
}

// Export singleton instance
export const PaletteService = new PaletteServiceImpl();
