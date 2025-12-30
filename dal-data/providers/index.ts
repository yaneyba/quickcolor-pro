/**
 * Data Access Layer (DAL) - Public API
 *
 * Export all providers and interfaces for use in the BLL
 */

// Interfaces
export type {
  IDataProvider,
  IQueryableDataProvider,
  IBatchDataProvider,
  DataProviderOptions,
  DataProviderType,
  DataResult,
} from "./IDataProvider";

// Implementations
export { AsyncStorageProvider } from "./AsyncStorageProvider";
export { MemoryProvider } from "./MemoryProvider";
export { SecureStorageProvider } from "./SecureStorageProvider";

// Factory
export {
  DataProviderFactory,
  Providers,
  type Palette,
  type UserSettings,
  type AuthData,
  type SessionData,
} from "./DataProviderFactory";
