/**
 * Data Access Layer (DAL)
 * IDataProvider Interface - Contract for all data providers
 *
 * This interface defines the contract that all data providers must implement.
 * Implementations can be AsyncStorage, SecureStore, API, SQLite, etc.
 */

export interface IDataProvider<T> {
  /**
   * Retrieve a single item by key
   */
  get(key: string): Promise<T | null>;

  /**
   * Retrieve all items (for collection-based providers)
   */
  getAll(): Promise<T[]>;

  /**
   * Save/update an item
   */
  set(key: string, value: T): Promise<void>;

  /**
   * Delete an item by key
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if an item exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Clear all data managed by this provider
   */
  clear(): Promise<void>;
}

/**
 * Extended interface for providers that support querying
 */
export interface IQueryableDataProvider<T> extends IDataProvider<T> {
  /**
   * Query items with a filter function
   */
  query(predicate: (item: T) => boolean): Promise<T[]>;

  /**
   * Get items with pagination
   */
  getPage(offset: number, limit: number): Promise<T[]>;

  /**
   * Get count of all items
   */
  count(): Promise<number>;
}

/**
 * Interface for providers that support batch operations
 */
export interface IBatchDataProvider<T> extends IDataProvider<T> {
  /**
   * Get multiple items by keys
   */
  getMany(keys: string[]): Promise<Map<string, T | null>>;

  /**
   * Set multiple items at once
   */
  setMany(items: Map<string, T>): Promise<void>;

  /**
   * Delete multiple items by keys
   */
  deleteMany(keys: string[]): Promise<number>;
}

/**
 * Data provider options for initialization
 */
export interface DataProviderOptions {
  /** Namespace/prefix for keys */
  namespace?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Cache TTL in milliseconds */
  cacheTtl?: number;
}

/**
 * Result wrapper for operations that can fail
 */
export interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Provider types supported by the factory
 */
export type DataProviderType =
  | "async-storage"
  | "secure-store"
  | "memory"
  | "api";
