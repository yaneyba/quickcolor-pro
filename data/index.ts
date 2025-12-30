/**
 * Data Access Layer (DAL) - Main Entry Point
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │                    DATA ACCESS LAYER                     │
 * │                                                          │
 * │  Responsibilities:                                       │
 * │  - Abstract storage implementations                      │
 * │  - Provide consistent data access interface              │
 * │  - Handle serialization/deserialization                  │
 * │  - Manage data persistence                               │
 * │                                                          │
 * │  Components:                                             │
 * │  ├── providers/                                          │
 * │  │   ├── IDataProvider.ts      (Interface)              │
 * │  │   ├── AsyncStorageProvider  (Local storage)          │
 * │  │   ├── SecureStorageProvider (Secure storage)         │
 * │  │   ├── MemoryProvider        (In-memory/cache)        │
 * │  │   └── DataProviderFactory   (Factory pattern)        │
 * │  └── index.ts                  (Public API)             │
 * │                                                          │
 * │  Usage:                                                  │
 * │  - Only BLL (services) should import from this layer    │
 * │  - UI layer should NEVER import directly                │
 * └─────────────────────────────────────────────────────────┘
 */

export * from "./providers";
