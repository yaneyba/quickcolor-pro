/**
 * Business Logic Layer (BLL) - Public API
 *
 * Export all services for use in the UI layer
 */

// Base interfaces
export type {
  ServiceResult,
  PaginationParams,
  PaginatedResult,
  IService,
  IObservableService,
  ServiceListener,
} from "./IService";

// Services
export { ColorService, type ColorData } from "./ColorService";
export {
  PaletteService,
  type CreatePaletteInput,
  type UpdatePaletteInput,
} from "./PaletteService";
export {
  SettingsService,
  type ColorFormat,
  type ThemeOption,
} from "./SettingsService";

// Re-export common types from DAL that UI might need
export type { Palette, UserSettings } from "@/dal-data/providers";

/**
 * Initialize all services
 * Call this once at app startup
 */
export async function initializeServices(): Promise<void> {
  const { ColorService } = await import("./ColorService");
  const { PaletteService } = await import("./PaletteService");
  const { SettingsService } = await import("./SettingsService");

  await Promise.all([
    ColorService.initialize(),
    PaletteService.initialize(),
    SettingsService.initialize(),
  ]);
}

/**
 * Dispose all services
 * Call this on app shutdown
 */
export async function disposeServices(): Promise<void> {
  const { ColorService } = await import("./ColorService");
  const { PaletteService } = await import("./PaletteService");
  const { SettingsService } = await import("./SettingsService");

  await Promise.all([
    ColorService.dispose(),
    PaletteService.dispose(),
    SettingsService.dispose(),
  ]);
}
