/**
 * DataProviderFactory - Factory for creating data providers
 *
 * Implements the Factory Pattern for IDataProvider instances.
 * Centralizes provider creation and configuration.
 *
 * Usage:
 *   const colorProvider = DataProviderFactory.create<string[]>('async-storage', { namespace: '@colors' });
 *   const authProvider = DataProviderFactory.create<AuthToken>('secure-store', { namespace: 'auth' });
 */

import type { IDataProvider, DataProviderType, DataProviderOptions } from "./IDataProvider";
import { AsyncStorageProvider } from "./AsyncStorageProvider";
import { MemoryProvider } from "./MemoryProvider";
import { SecureStorageProvider } from "./SecureStorageProvider";

/**
 * Singleton instances cache for reusing providers
 */
const providerCache = new Map<string, IDataProvider<unknown>>();

/**
 * DataProviderFactory - Creates and manages IDataProvider instances
 */
export class DataProviderFactory {
  /**
   * Create a new data provider instance
   *
   * @param type - The type of provider to create
   * @param options - Configuration options for the provider
   * @returns A new IDataProvider instance
   */
  static create<T>(
    type: DataProviderType,
    options: DataProviderOptions = {}
  ): IDataProvider<T> {
    switch (type) {
      case "async-storage":
        return new AsyncStorageProvider<T>(options);

      case "secure-store":
        return new SecureStorageProvider<T>(options);

      case "memory":
        return new MemoryProvider<T>(options);

      case "api":
        // API provider would be implemented for remote data
        throw new Error("API provider not yet implemented");

      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  /**
   * Get or create a singleton provider instance
   * Useful when you want to share a provider across the app
   *
   * @param key - Unique identifier for this singleton
   * @param type - The type of provider to create
   * @param options - Configuration options for the provider
   * @returns A cached or new IDataProvider instance
   */
  static getSingleton<T>(
    key: string,
    type: DataProviderType,
    options: DataProviderOptions = {}
  ): IDataProvider<T> {
    if (!providerCache.has(key)) {
      const provider = this.create<T>(type, options);
      providerCache.set(key, provider as IDataProvider<unknown>);
    }
    return providerCache.get(key) as IDataProvider<T>;
  }

  /**
   * Clear a singleton provider from cache
   */
  static clearSingleton(key: string): boolean {
    return providerCache.delete(key);
  }

  /**
   * Clear all singleton providers from cache
   */
  static clearAllSingletons(): void {
    providerCache.clear();
  }

  /**
   * Get all singleton keys (for debugging)
   */
  static getSingletonKeys(): string[] {
    return Array.from(providerCache.keys());
  }
}

/**
 * Pre-configured provider factories for common use cases
 */
export const Providers = {
  /**
   * Provider for recent colors (persisted)
   */
  recentColors: () =>
    DataProviderFactory.getSingleton<string[]>("recentColors", "async-storage", {
      namespace: "@quickcolor_recent",
    }),

  /**
   * Provider for color palettes (persisted)
   */
  palettes: () =>
    DataProviderFactory.getSingleton<Palette>("palettes", "async-storage", {
      namespace: "@quickcolor_palettes",
    }),

  /**
   * Provider for user settings (persisted)
   */
  settings: () =>
    DataProviderFactory.getSingleton<UserSettings>("settings", "async-storage", {
      namespace: "@quickcolor_settings",
    }),

  /**
   * Provider for authentication data (secure)
   */
  auth: () =>
    DataProviderFactory.getSingleton<AuthData>("auth", "secure-store", {
      namespace: "quickcolor_auth",
    }),

  /**
   * Provider for session/temporary data (memory only)
   */
  session: () =>
    DataProviderFactory.getSingleton<SessionData>("session", "memory", {
      namespace: "session",
    }),
};

// Type definitions for pre-configured providers
export interface Palette {
  id: string;
  name: string;
  colors: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  hapticEnabled: boolean;
  autoSave: boolean;
  defaultColorFormat: "hex" | "rgb" | "hsv";
  theme: "light" | "dark" | "system";
}

export interface AuthData {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface SessionData {
  currentColor: string | null;
  lastPickedColors: string[];
  clipboardColor: string | null;
}
