# QuickColor Pro - Architecture

## 3-Tier Architecture (UI → BLL → DAL)

This application follows a strict 3-tier architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER (UI)                      │
│                                                                      │
│   app/                    components/              hooks/            │
│   ├── (tabs)/             ├── ui/                 ├── use-*         │
│   │   ├── index.tsx       │   └── icon-symbol    │                  │
│   │   ├── palettes.tsx    ├── screen-container   │                  │
│   │   └── settings.tsx    └── coming-soon-modal  │                  │
│   ├── photo-picker.tsx                                               │
│   └── gradient-generator.tsx                                         │
│                                                                      │
│   Responsibilities:                                                  │
│   • Render UI components                                             │
│   • Handle user interactions                                         │
│   • Use hooks for state/data access                                  │
│   • NO direct data access or business logic                          │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Uses Hooks
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER (BLL)                       │
│                                                                      │
│   services/                                                          │
│   ├── IService.ts           (Base interfaces)                       │
│   ├── ColorService.ts       (Color operations, recent colors)       │
│   ├── PaletteService.ts     (Palette CRUD, limits)                  │
│   ├── SettingsService.ts    (User preferences)                      │
│   └── index.ts              (Public API)                            │
│                                                                      │
│   Responsibilities:                                                  │
│   • Implement business rules                                         │
│   • Validate data                                                    │
│   • Orchestrate data operations                                      │
│   • Enforce limits (free vs pro)                                     │
│   • Provide observable state                                         │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Uses IDataProvider
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER (DAL)                         │
│                                                                      │
│   data/providers/                                                    │
│   ├── IDataProvider.ts         (Interface contract)                 │
│   ├── AsyncStorageProvider.ts  (Local persistence)                  │
│   ├── SecureStorageProvider.ts (Secure/encrypted storage)           │
│   ├── MemoryProvider.ts        (In-memory/session cache)            │
│   ├── DataProviderFactory.ts   (Factory pattern)                    │
│   └── index.ts                 (Public API)                         │
│                                                                      │
│   Responsibilities:                                                  │
│   • Abstract storage implementations                                 │
│   • Handle serialization/deserialization                             │
│   • Provide consistent CRUD interface                                │
│   • Enable swappable storage backends                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
quickcolor-pro/
├── app/                          # UI Layer - Screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home screen
│   │   ├── palettes.tsx          # Palettes screen
│   │   └── settings.tsx          # Settings screen
│   ├── _layout.tsx               # Root layout
│   ├── photo-picker.tsx
│   ├── gradient-generator.tsx
│   ├── color-harmony.tsx
│   └── privacy-policy.tsx
│
├── components/                   # UI Layer - Reusable components
│   ├── ui/                       # Base UI primitives
│   ├── screen-container.tsx
│   ├── themed-view.tsx
│   └── coming-soon-modal.tsx
│
├── hooks/                        # UI Layer - React hooks
│   ├── index.ts                  # Public API
│   ├── use-recent-colors.ts      # → ColorService
│   ├── use-palettes.ts           # → PaletteService
│   ├── use-settings.ts           # → SettingsService
│   ├── use-color-service.ts      # → ColorService utilities
│   ├── use-colors.ts             # Theme colors
│   ├── use-color-scheme.ts       # Dark/Light mode
│   └── use-auth.ts               # Authentication
│
├── services/                     # BLL - Business Logic Layer
│   ├── index.ts                  # Public API
│   ├── IService.ts               # Base interfaces
│   ├── ColorService.ts           # Color operations
│   ├── PaletteService.ts         # Palette management
│   └── SettingsService.ts        # User settings
│
├── data/                         # DAL - Data Access Layer
│   ├── index.ts                  # Public API
│   └── providers/
│       ├── index.ts              # Provider exports
│       ├── IDataProvider.ts      # Interface contract
│       ├── AsyncStorageProvider.ts
│       ├── SecureStorageProvider.ts
│       ├── MemoryProvider.ts
│       └── DataProviderFactory.ts
│
├── lib/                          # Utilities (shared)
│   ├── color-utils.ts            # Color conversion algorithms
│   ├── color-extraction.ts       # Image color extraction
│   ├── theme-provider.tsx        # Theme context
│   └── utils.ts                  # General utilities
│
└── constants/                    # App constants
    ├── const.ts
    ├── oauth.ts
    └── theme.ts
```

## Design Patterns

### 1. DataProviderFactory (Factory Pattern)

Creates appropriate data provider instances based on storage type.

```typescript
// Create a provider for specific data type
const colorProvider = DataProviderFactory.create<string[]>('async-storage', {
  namespace: '@quickcolor_colors'
});

// Get singleton instance (shared across app)
const authProvider = DataProviderFactory.getSingleton<AuthData>(
  'auth',
  'secure-store',
  { namespace: 'auth' }
);
```

### 2. IDataProvider (Interface Pattern)

All storage implementations conform to the same interface.

```typescript
interface IDataProvider<T> {
  get(key: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
```

### 3. Service Layer (Singleton Pattern)

Services are singleton instances with observable state.

```typescript
// Services are singletons
export const ColorService = new ColorServiceImpl();
export const PaletteService = new PaletteServiceImpl();
export const SettingsService = new SettingsServiceImpl();

// Subscribe to changes
ColorService.subscribe((colors) => {
  console.log('Colors updated:', colors);
});
```

### 4. React Hooks (Bridge Pattern)

Hooks bridge React components to services.

```typescript
function MyComponent() {
  const { colors, addColor, loading } = useRecentColors();
  const { settings, toggleHaptic } = useSettings();
  const { palettes, createPalette } = usePalettes();

  // Component only uses hooks, never services directly
}
```

## Data Flow

```
User Action → UI Component → Hook → Service → Provider → Storage
                                      ↓
                                 Validation
                                 Business Rules
                                 State Update
                                      ↓
                              Notify Subscribers
                                      ↓
                              Hook receives update
                                      ↓
                              Component re-renders
```

## Import Rules

### ✅ Allowed Imports

| From Layer | Can Import From |
|------------|-----------------|
| UI (app/, components/) | hooks/, lib/, constants/ |
| Hooks | services/, lib/ |
| Services (BLL) | data/, lib/ |
| Data (DAL) | (external packages only) |

### ❌ Forbidden Imports

| From Layer | Cannot Import From |
|------------|-------------------|
| UI | services/, data/ |
| Hooks | data/ |
| Services | app/, components/, hooks/ |
| Data | services/, hooks/, app/ |

## Adding New Features

### 1. Add New Data Type

```typescript
// 1. Define in DAL (data/providers/DataProviderFactory.ts)
export interface GradientData {
  id: string;
  colors: string[];
  angle: number;
}

// 2. Create service in BLL (services/GradientService.ts)
class GradientServiceImpl implements IService {
  private provider = DataProviderFactory.create<GradientData[]>('async-storage', {
    namespace: '@quickcolor_gradients'
  });
  // ... implement methods
}

// 3. Create hook (hooks/use-gradients.ts)
export function useGradients() {
  // ... consume GradientService
}

// 4. Use in UI
function GradientScreen() {
  const { gradients, createGradient } = useGradients();
}
```

### 2. Add New Storage Backend

```typescript
// 1. Create provider implementing IDataProvider
class FirebaseProvider<T> implements IDataProvider<T> {
  async get(key: string): Promise<T | null> { /* ... */ }
  async set(key: string, value: T): Promise<void> { /* ... */ }
  // ... implement all methods
}

// 2. Register in factory
case 'firebase':
  return new FirebaseProvider<T>(options);
```

## Benefits of This Architecture

1. **Testability**: Each layer can be tested in isolation
2. **Maintainability**: Changes in one layer don't affect others
3. **Flexibility**: Storage backends can be swapped without changing UI
4. **Scalability**: Easy to add new features following the pattern
5. **Type Safety**: Strong typing throughout all layers
6. **Reactive**: Observable services enable real-time UI updates
