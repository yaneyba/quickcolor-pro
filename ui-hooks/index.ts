/**
 * Hooks Layer - React Hooks for UI Components
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │                      HOOKS LAYER                         │
 * │                                                          │
 * │  Purpose:                                                │
 * │  - Bridge between UI and BLL (services)                  │
 * │  - Provide reactive state management                     │
 * │  - Handle loading/error states                           │
 * │  - Abstract service complexity from components           │
 * │                                                          │
 * │  Categories:                                             │
 * │  ├── Service Hooks (consume BLL)                        │
 * │  │   ├── use-recent-colors.ts                           │
 * │  │   ├── use-palettes.ts                                │
 * │  │   ├── use-settings.ts                                │
 * │  │   └── use-color-service.ts                           │
 * │  │                                                       │
 * │  └── UI Hooks (React Native specific)                   │
 * │      ├── use-colors.ts         (Theme colors)           │
 * │      ├── use-color-scheme.ts   (Dark/Light mode)        │
 * │      └── use-auth.ts           (Authentication)         │
 * │                                                          │
 * │  Usage:                                                  │
 * │  - UI components import hooks from this index           │
 * │  - Hooks handle all service interactions                │
 * └─────────────────────────────────────────────────────────┘
 */

// Service Hooks (consume BLL services)
export { useRecentColors } from "./use-recent-colors";
export { usePalettes, usePalette } from "./use-palettes";
export {
  useSettings,
  useHaptic,
  useAutoSave,
  useColorFormat,
  useThemeSetting,
} from "./use-settings";
export { useColorService } from "./use-color-service";

// UI Hooks (React Native specific)
export { useColors } from "./use-colors";
export { useColorScheme } from "./use-color-scheme";
export { useAuth } from "./use-auth";
