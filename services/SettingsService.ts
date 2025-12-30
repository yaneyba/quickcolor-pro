/**
 * SettingsService - Business Logic Layer for user settings
 *
 * Handles:
 * - User preferences
 * - App configuration
 * - Settings validation and persistence
 */

import { DataProviderFactory, type IDataProvider, type UserSettings } from "@/data/providers";
import type { ServiceResult, IService, IObservableService, ServiceListener } from "./IService";

// Constants
const STORAGE_KEY = "settings";

/**
 * Default settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  hapticEnabled: true,
  autoSave: true,
  defaultColorFormat: "hex",
  theme: "system",
};

/**
 * Color format options
 */
export type ColorFormat = "hex" | "rgb" | "hsv";

/**
 * Theme options
 */
export type ThemeOption = "light" | "dark" | "system";

/**
 * SettingsService - Manages user settings
 */
class SettingsServiceImpl implements IService, IObservableService<UserSettings> {
  private provider: IDataProvider<UserSettings>;
  private settings: UserSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<ServiceListener<UserSettings>> = new Set();
  private initialized = false;

  constructor() {
    this.provider = DataProviderFactory.create<UserSettings>("async-storage", {
      namespace: "@quickcolor",
    });
  }

  // IService implementation

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const stored = await this.provider.get(STORAGE_KEY);
    if (stored) {
      // Merge with defaults to handle new settings added in updates
      this.settings = { ...DEFAULT_SETTINGS, ...stored };
    }
    this.initialized = true;
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
    this.initialized = false;
  }

  // IObservableService implementation

  subscribe(listener: ServiceListener<UserSettings>): () => void {
    this.listeners.add(listener);
    listener(this.settings);
    return () => this.listeners.delete(listener);
  }

  getCurrentValue(): UserSettings {
    return { ...this.settings };
  }

  private notifyListeners(): void {
    const settings = this.getCurrentValue();
    for (const listener of this.listeners) {
      listener(settings);
    }
  }

  // Settings Operations

  /**
   * Get all settings
   */
  async getSettings(): Promise<ServiceResult<UserSettings>> {
    try {
      await this.ensureInitialized();
      return { success: true, data: { ...this.settings } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get settings",
      };
    }
  }

  /**
   * Get a specific setting value
   */
  async getSetting<K extends keyof UserSettings>(
    key: K
  ): Promise<ServiceResult<UserSettings[K]>> {
    try {
      await this.ensureInitialized();
      return { success: true, data: this.settings[key] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get setting",
      };
    }
  }

  /**
   * Update a single setting
   */
  async updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): Promise<ServiceResult<UserSettings>> {
    try {
      await this.ensureInitialized();

      // Validate
      const validation = this.validateSetting(key, value);
      if (!validation.success) {
        return validation as ServiceResult<UserSettings>;
      }

      // Update
      const newSettings = { ...this.settings, [key]: value };
      await this.provider.set(STORAGE_KEY, newSettings);
      this.settings = newSettings;
      this.notifyListeners();

      return { success: true, data: newSettings };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update setting",
      };
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(
    updates: Partial<UserSettings>
  ): Promise<ServiceResult<UserSettings>> {
    try {
      await this.ensureInitialized();

      // Validate all updates
      for (const [key, value] of Object.entries(updates)) {
        const validation = this.validateSetting(
          key as keyof UserSettings,
          value as UserSettings[keyof UserSettings]
        );
        if (!validation.success) {
          return validation as ServiceResult<UserSettings>;
        }
      }

      // Update
      const newSettings = { ...this.settings, ...updates };
      await this.provider.set(STORAGE_KEY, newSettings);
      this.settings = newSettings;
      this.notifyListeners();

      return { success: true, data: newSettings };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update settings",
      };
    }
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults(): Promise<ServiceResult<UserSettings>> {
    try {
      await this.provider.set(STORAGE_KEY, DEFAULT_SETTINGS);
      this.settings = { ...DEFAULT_SETTINGS };
      this.notifyListeners();
      return { success: true, data: this.settings };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset settings",
      };
    }
  }

  // Convenience Methods

  /**
   * Toggle haptic feedback
   */
  async toggleHaptic(): Promise<ServiceResult<boolean>> {
    const result = await this.updateSetting("hapticEnabled", !this.settings.hapticEnabled);
    if (result.success) {
      return { success: true, data: result.data!.hapticEnabled };
    }
    return { success: false, error: result.error };
  }

  /**
   * Toggle auto-save
   */
  async toggleAutoSave(): Promise<ServiceResult<boolean>> {
    const result = await this.updateSetting("autoSave", !this.settings.autoSave);
    if (result.success) {
      return { success: true, data: result.data!.autoSave };
    }
    return { success: false, error: result.error };
  }

  /**
   * Set default color format
   */
  async setDefaultColorFormat(format: ColorFormat): Promise<ServiceResult<UserSettings>> {
    return this.updateSetting("defaultColorFormat", format);
  }

  /**
   * Set theme preference
   */
  async setTheme(theme: ThemeOption): Promise<ServiceResult<UserSettings>> {
    return this.updateSetting("theme", theme);
  }

  /**
   * Check if haptic is enabled (sync access)
   */
  isHapticEnabled(): boolean {
    return this.settings.hapticEnabled;
  }

  /**
   * Check if auto-save is enabled (sync access)
   */
  isAutoSaveEnabled(): boolean {
    return this.settings.autoSave;
  }

  /**
   * Get default color format (sync access)
   */
  getDefaultColorFormat(): ColorFormat {
    return this.settings.defaultColorFormat;
  }

  /**
   * Get current theme setting (sync access)
   */
  getTheme(): ThemeOption {
    return this.settings.theme;
  }

  // Private Helpers

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private validateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): ServiceResult<void> {
    switch (key) {
      case "hapticEnabled":
      case "autoSave":
        if (typeof value !== "boolean") {
          return { success: false, error: `${key} must be a boolean` };
        }
        break;

      case "defaultColorFormat":
        if (!["hex", "rgb", "hsv"].includes(value as string)) {
          return { success: false, error: "Invalid color format" };
        }
        break;

      case "theme":
        if (!["light", "dark", "system"].includes(value as string)) {
          return { success: false, error: "Invalid theme option" };
        }
        break;

      default:
        return { success: false, error: `Unknown setting: ${key}` };
    }

    return { success: true };
  }
}

// Export singleton instance
export const SettingsService = new SettingsServiceImpl();
