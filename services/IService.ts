/**
 * Business Logic Layer (BLL)
 * Base interfaces for all services
 */

/**
 * Base result type for service operations
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  offset: number;
  limit: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Base service interface with lifecycle methods
 */
export interface IService {
  /**
   * Initialize the service (called once on app start)
   */
  initialize(): Promise<void>;

  /**
   * Clean up resources (called on app shutdown)
   */
  dispose(): Promise<void>;
}

/**
 * Observable service for reactive updates
 */
export type ServiceListener<T> = (data: T) => void;

export interface IObservableService<T> {
  /**
   * Subscribe to data changes
   */
  subscribe(listener: ServiceListener<T>): () => void;

  /**
   * Get current value synchronously
   */
  getCurrentValue(): T;
}
