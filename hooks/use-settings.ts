/**
 * useSettings - React hook for user settings
 *
 * Provides reactive access to the SettingsService
 * with loading states and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import {
  SettingsService,
  type UserSettings,
  type ColorFormat,
  type ThemeOption,
} from "@/services";

interface UseSettingsResult {
  /** Current settings */
  settings: UserSettings;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Update a single setting */
  updateSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => Promise<boolean>;
  /** Update multiple settings */
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>;
  /** Toggle haptic feedback */
  toggleHaptic: () => Promise<boolean>;
  /** Toggle auto-save */
  toggleAutoSave: () => Promise<boolean>;
  /** Set default color format */
  setColorFormat: (format: ColorFormat) => Promise<boolean>;
  /** Set theme */
  setTheme: (theme: ThemeOption) => Promise<boolean>;
  /** Reset to defaults */
  resetToDefaults: () => Promise<boolean>;
  /** Clear error */
  clearError: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  hapticEnabled: true,
  autoSave: true,
  defaultColorFormat: "hex",
  theme: "system",
};

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = SettingsService.subscribe((newSettings) => {
      setSettings(newSettings);
      setLoading(false);
    });

    // Initialize service if not already
    SettingsService.initialize().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to initialize");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof UserSettings>(
      key: K,
      value: UserSettings[K]
    ): Promise<boolean> => {
      setError(null);
      const result = await SettingsService.updateSetting(key, value);
      if (!result.success) {
        setError(result.error ?? "Failed to update setting");
        return false;
      }
      return true;
    },
    []
  );

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>): Promise<boolean> => {
      setError(null);
      const result = await SettingsService.updateSettings(updates);
      if (!result.success) {
        setError(result.error ?? "Failed to update settings");
        return false;
      }
      return true;
    },
    []
  );

  const toggleHaptic = useCallback(async (): Promise<boolean> => {
    setError(null);
    const result = await SettingsService.toggleHaptic();
    if (!result.success) {
      setError(result.error ?? "Failed to toggle haptic");
      return false;
    }
    return true;
  }, []);

  const toggleAutoSave = useCallback(async (): Promise<boolean> => {
    setError(null);
    const result = await SettingsService.toggleAutoSave();
    if (!result.success) {
      setError(result.error ?? "Failed to toggle auto-save");
      return false;
    }
    return true;
  }, []);

  const setColorFormat = useCallback(
    async (format: ColorFormat): Promise<boolean> => {
      setError(null);
      const result = await SettingsService.setDefaultColorFormat(format);
      if (!result.success) {
        setError(result.error ?? "Failed to set color format");
        return false;
      }
      return true;
    },
    []
  );

  const setTheme = useCallback(async (theme: ThemeOption): Promise<boolean> => {
    setError(null);
    const result = await SettingsService.setTheme(theme);
    if (!result.success) {
      setError(result.error ?? "Failed to set theme");
      return false;
    }
    return true;
  }, []);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setError(null);
    const result = await SettingsService.resetToDefaults();
    if (!result.success) {
      setError(result.error ?? "Failed to reset settings");
      return false;
    }
    return true;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateSettings,
    toggleHaptic,
    toggleAutoSave,
    setColorFormat,
    setTheme,
    resetToDefaults,
    clearError,
  };
}

/**
 * useHaptic - Convenience hook for haptic feedback setting
 */
export function useHaptic() {
  const { settings, toggleHaptic } = useSettings();
  return {
    enabled: settings.hapticEnabled,
    toggle: toggleHaptic,
  };
}

/**
 * useAutoSave - Convenience hook for auto-save setting
 */
export function useAutoSave() {
  const { settings, toggleAutoSave } = useSettings();
  return {
    enabled: settings.autoSave,
    toggle: toggleAutoSave,
  };
}

/**
 * useColorFormat - Convenience hook for color format setting
 */
export function useColorFormat() {
  const { settings, setColorFormat } = useSettings();
  return {
    format: settings.defaultColorFormat,
    setFormat: setColorFormat,
  };
}

/**
 * useThemeSetting - Convenience hook for theme setting
 */
export function useThemeSetting() {
  const { settings, setTheme } = useSettings();
  return {
    theme: settings.theme,
    setTheme,
  };
}
