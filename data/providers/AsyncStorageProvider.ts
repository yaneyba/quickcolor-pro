/**
 * AsyncStorageProvider - Implementation of IDataProvider using AsyncStorage
 *
 * Used for persisting non-sensitive app data like:
 * - Recent colors
 * - Palettes
 * - User preferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  IDataProvider,
  IBatchDataProvider,
  DataProviderOptions,
  DataResult,
} from "./IDataProvider";

export class AsyncStorageProvider<T>
  implements IDataProvider<T>, IBatchDataProvider<T>
{
  private namespace: string;
  private debug: boolean;

  constructor(options: DataProviderOptions = {}) {
    this.namespace = options.namespace ?? "@quickcolor";
    this.debug = options.debug ?? false;
  }

  private getFullKey(key: string): string {
    return `${this.namespace}_${key}`;
  }

  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[AsyncStorageProvider] ${message}`, ...args);
    }
  }

  async get(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await AsyncStorage.getItem(fullKey);
      if (value === null) {
        this.log(`GET ${key}: null`);
        return null;
      }
      const parsed = JSON.parse(value) as T;
      this.log(`GET ${key}:`, parsed);
      return parsed;
    } catch (error) {
      this.log(`GET ${key} ERROR:`, error);
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const namespaceKeys = allKeys.filter((key) =>
        key.startsWith(this.namespace)
      );
      const pairs = await AsyncStorage.multiGet(namespaceKeys);
      const items: T[] = [];

      for (const [, value] of pairs) {
        if (value !== null) {
          try {
            items.push(JSON.parse(value) as T);
          } catch {
            // Skip invalid JSON
          }
        }
      }

      this.log(`GET ALL: ${items.length} items`);
      return items;
    } catch (error) {
      this.log(`GET ALL ERROR:`, error);
      return [];
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(fullKey, serialized);
      this.log(`SET ${key}:`, value);
    } catch (error) {
      this.log(`SET ${key} ERROR:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const exists = (await AsyncStorage.getItem(fullKey)) !== null;
      if (exists) {
        await AsyncStorage.removeItem(fullKey);
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
    try {
      const fullKey = this.getFullKey(key);
      const value = await AsyncStorage.getItem(fullKey);
      return value !== null;
    } catch {
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const namespaceKeys = allKeys.filter((key) =>
        key.startsWith(this.namespace)
      );
      if (namespaceKeys.length > 0) {
        await AsyncStorage.multiRemove(namespaceKeys);
      }
      this.log(`CLEAR: removed ${namespaceKeys.length} keys`);
    } catch (error) {
      this.log(`CLEAR ERROR:`, error);
      throw error;
    }
  }

  // IBatchDataProvider implementation

  async getMany(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      const pairs = await AsyncStorage.multiGet(fullKeys);

      for (let i = 0; i < keys.length; i++) {
        const value = pairs[i]?.[1];
        if (value !== null && value !== undefined) {
          try {
            result.set(keys[i], JSON.parse(value) as T);
          } catch {
            result.set(keys[i], null);
          }
        } else {
          result.set(keys[i], null);
        }
      }

      this.log(`GET MANY: ${keys.length} keys`);
      return result;
    } catch (error) {
      this.log(`GET MANY ERROR:`, error);
      return result;
    }
  }

  async setMany(items: Map<string, T>): Promise<void> {
    try {
      const pairs: [string, string][] = [];
      for (const [key, value] of items) {
        pairs.push([this.getFullKey(key), JSON.stringify(value)]);
      }
      await AsyncStorage.multiSet(pairs);
      this.log(`SET MANY: ${items.size} items`);
    } catch (error) {
      this.log(`SET MANY ERROR:`, error);
      throw error;
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      await AsyncStorage.multiRemove(fullKeys);
      this.log(`DELETE MANY: ${keys.length} keys`);
      return keys.length;
    } catch (error) {
      this.log(`DELETE MANY ERROR:`, error);
      return 0;
    }
  }

  /**
   * Utility method for safe operations with result wrapper
   */
  async safeGet(key: string): Promise<DataResult<T>> {
    try {
      const data = await this.get(key);
      return { success: true, data: data ?? undefined };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async safeSet(key: string, value: T): Promise<DataResult<void>> {
    try {
      await this.set(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
