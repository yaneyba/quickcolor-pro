/**
 * MemoryProvider - In-memory implementation of IDataProvider
 *
 * Used for:
 * - Session-only data that doesn't persist
 * - Caching layer
 * - Testing/mocking
 */

import type {
  IDataProvider,
  IBatchDataProvider,
  IQueryableDataProvider,
  DataProviderOptions,
} from "./IDataProvider";

export class MemoryProvider<T>
  implements IDataProvider<T>, IBatchDataProvider<T>, IQueryableDataProvider<T>
{
  private store: Map<string, T> = new Map();
  private namespace: string;
  private debug: boolean;

  constructor(options: DataProviderOptions = {}) {
    this.namespace = options.namespace ?? "memory";
    this.debug = options.debug ?? false;
  }

  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[MemoryProvider:${this.namespace}] ${message}`, ...args);
    }
  }

  async get(key: string): Promise<T | null> {
    const value = this.store.get(key) ?? null;
    this.log(`GET ${key}:`, value);
    return value;
  }

  async getAll(): Promise<T[]> {
    const items = Array.from(this.store.values());
    this.log(`GET ALL: ${items.length} items`);
    return items;
  }

  async set(key: string, value: T): Promise<void> {
    this.store.set(key, value);
    this.log(`SET ${key}:`, value);
  }

  async delete(key: string): Promise<boolean> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.log(`DELETE ${key}: ${existed ? "success" : "not found"}`);
    return existed;
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async clear(): Promise<void> {
    const count = this.store.size;
    this.store.clear();
    this.log(`CLEAR: removed ${count} items`);
  }

  // IBatchDataProvider implementation

  async getMany(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    for (const key of keys) {
      result.set(key, this.store.get(key) ?? null);
    }
    this.log(`GET MANY: ${keys.length} keys`);
    return result;
  }

  async setMany(items: Map<string, T>): Promise<void> {
    for (const [key, value] of items) {
      this.store.set(key, value);
    }
    this.log(`SET MANY: ${items.size} items`);
  }

  async deleteMany(keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        count++;
      }
    }
    this.log(`DELETE MANY: ${count} of ${keys.length} keys`);
    return count;
  }

  // IQueryableDataProvider implementation

  async query(predicate: (item: T) => boolean): Promise<T[]> {
    const items = Array.from(this.store.values()).filter(predicate);
    this.log(`QUERY: found ${items.length} matches`);
    return items;
  }

  async getPage(offset: number, limit: number): Promise<T[]> {
    const items = Array.from(this.store.values()).slice(offset, offset + limit);
    this.log(`GET PAGE: offset=${offset}, limit=${limit}, returned=${items.length}`);
    return items;
  }

  async count(): Promise<number> {
    return this.store.size;
  }

  /**
   * Get a snapshot of all keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.store.keys());
  }
}
