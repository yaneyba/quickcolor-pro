/**
 * SecureStorageProvider - Implementation of IDataProvider using SecureStore
 *
 * Used for sensitive data like:
 * - Authentication tokens
 * - API keys
 * - User credentials
 *
 * Note: SecureStore has platform-specific behaviors:
 * - iOS: Uses Keychain
 * - Android: Uses SharedPreferences with encryption
 * - Web: Falls back to localStorage (less secure)
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { IDataProvider, DataProviderOptions } from "./IDataProvider";

export class SecureStorageProvider<T> implements IDataProvider<T> {
  private namespace: string;
  private debug: boolean;
  private keys: Set<string> = new Set(); // Track keys for getAll/clear

  constructor(options: DataProviderOptions = {}) {
    this.namespace = options.namespace ?? "secure";
    this.debug = options.debug ?? false;
  }

  private getFullKey(key: string): string {
    return `${this.namespace}_${key}`;
  }

  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      // Don't log sensitive values, only keys and operations
      console.log(`[SecureStorageProvider] ${message}`, ...args);
    }
  }

  private isSecureStoreAvailable(): boolean {
    // SecureStore is not available on web
    return Platform.OS !== "web";
  }

  async get(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);

      if (!this.isSecureStoreAvailable()) {
        // Fallback to localStorage on web
        const value = localStorage.getItem(fullKey);
        if (value === null) return null;
        return JSON.parse(value) as T;
      }

      const value = await SecureStore.getItemAsync(fullKey);
      if (value === null) {
        this.log(`GET ${key}: null`);
        return null;
      }

      const parsed = JSON.parse(value) as T;
      this.log(`GET ${key}: [secure value]`);
      return parsed;
    } catch (error) {
      this.log(`GET ${key} ERROR:`, error);
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    // SecureStore doesn't support listing keys, so we use tracked keys
    const items: T[] = [];
    for (const key of this.keys) {
      const value = await this.get(key);
      if (value !== null) {
        items.push(value);
      }
    }
    this.log(`GET ALL: ${items.length} items`);
    return items;
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);

      if (!this.isSecureStoreAvailable()) {
        // Fallback to localStorage on web
        localStorage.setItem(fullKey, serialized);
        this.keys.add(key);
        this.log(`SET ${key}: [secure value] (localStorage fallback)`);
        return;
      }

      await SecureStore.setItemAsync(fullKey, serialized);
      this.keys.add(key);
      this.log(`SET ${key}: [secure value]`);
    } catch (error) {
      this.log(`SET ${key} ERROR:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);

      if (!this.isSecureStoreAvailable()) {
        const existed = localStorage.getItem(fullKey) !== null;
        localStorage.removeItem(fullKey);
        this.keys.delete(key);
        return existed;
      }

      const existed = (await SecureStore.getItemAsync(fullKey)) !== null;
      if (existed) {
        await SecureStore.deleteItemAsync(fullKey);
        this.keys.delete(key);
        this.log(`DELETE ${key}: success`);
        return true;
      }

      this.log(`DELETE ${key}: not found`);
      return false;
    } catch (error) {
      this.log(`DELETE ${key} ERROR:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    try {
      for (const key of this.keys) {
        await this.delete(key);
      }
      this.keys.clear();
      this.log(`CLEAR: complete`);
    } catch (error) {
      this.log(`CLEAR ERROR:`, error);
      throw error;
    }
  }

  /**
   * Check if secure storage is available on this platform
   */
  isAvailable(): boolean {
    return this.isSecureStoreAvailable();
  }
}
