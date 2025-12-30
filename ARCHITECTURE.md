# QuickColor Pro - Architecture

## Complete Project Structure

```
QUICKCOLOR-PRO/
│
├── 📁 .claude/                   # Claude Code configuration
├── 📁 .expo/                     # Expo cache & config
│
├── 📁 app/                       # 🎨 UI LAYER - Screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home screen
│   │   ├── palettes.tsx          # Palette management
│   │   └── settings.tsx          # Settings & preferences
│   ├── dev/                      # Development screens
│   ├── oauth/                    # OAuth callback handlers
│   ├── _layout.tsx               # Root layout with providers
│   ├── color-harmony.tsx         # Color harmony generator
│   ├── gradient-generator.tsx    # Gradient creator
│   ├── photo-picker.tsx          # Photo color extraction
│   └── privacy-policy.tsx        # Privacy policy page
│
├── 📁 assets/                    # Static assets (images, fonts)
│
├── 📁 components/                # 🎨 UI LAYER - Reusable components
│   ├── ui/                       # Base UI primitives
│   │   ├── icon-symbol.tsx
│   │   └── collapsible.tsx
│   ├── screen-container.tsx      # SafeArea wrapper
│   ├── themed-view.tsx           # Theme-aware view
│   ├── coming-soon-modal.tsx     # Feature placeholder
│   └── ...
│
├── 📁 constants/                 # App-wide constants
│   ├── const.ts                  # Global constants
│   ├── oauth.ts                  # OAuth configuration
│   └── theme.ts                  # Theme tokens
│
├── 📁 data/                      # 💾 DAL - Data Access Layer
│   ├── index.ts                  # Public API exports
│   └── providers/
│       ├── index.ts              # Provider exports
│       ├── IDataProvider.ts      # Interface contract
│       ├── AsyncStorageProvider.ts   # Local persistence
│       ├── SecureStorageProvider.ts  # Encrypted storage
│       ├── MemoryProvider.ts         # In-memory cache
│       └── DataProviderFactory.ts    # Factory pattern
│
├── 📁 dist/                      # Build output
├── 📁 drizzle/                   # Database migrations
│
├── 📁 hooks/                     # 🔗 HOOKS - Bridge UI ↔ BLL
│   ├── index.ts                  # Public API exports
│   ├── use-recent-colors.ts      # → ColorService
│   ├── use-palettes.ts           # → PaletteService
│   ├── use-settings.ts           # → SettingsService
│   ├── use-color-service.ts      # → Color utilities
│   ├── use-colors.ts             # Theme colors
│   ├── use-color-scheme.ts       # Dark/Light mode
│   └── use-auth.ts               # Authentication state
│
├── 📁 lib/                       # 🔧 Shared utilities
│   ├── _core/                    # Core platform utilities
│   ├── color-utils.ts            # Color conversion functions
│   ├── color-extraction.ts       # Image color extraction
│   ├── theme-provider.tsx        # Theme context provider
│   └── utils.ts                  # General utilities
│
├── 📁 node_modules/              # Dependencies
├── 📁 play-store-assets/         # Google Play Store assets
├── 📁 scripts/                   # Build & utility scripts
│
├── 📁 server/                    # Backend (Express + tRPC)
│   └── _core/                    # Core server utilities
│
├── 📁 services/                  # ⚙️ BLL - Business Logic Layer
│   ├── index.ts                  # Public API exports
│   ├── IService.ts               # Base service interfaces
│   ├── ColorService.ts           # Color operations & recent colors
│   ├── PaletteService.ts         # Palette CRUD & limits
│   └── SettingsService.ts        # User preferences
│
├── 📁 shared/                    # Shared types between client/server
├── 📁 tests/                     # Test files
│
├── 📄 .gitignore
├── 📄 .gitkeep
├── 📄 .npmrc
├── 📄 .watchmanconfig
├── 📄 app.config.ts              # Expo configuration
├── 📄 ARCHITECTURE.md            # This file
├── 📄 babel.config.js
├── 📄 CLAUDE.md                  # Claude Code instructions
├── 📄 DELIVERY-SUMMARY.md
├── 📄 DEPLOYMENT.md
├── 📄 ...
└── 📄 tsconfig.json
```

## 3-Tier Architecture (UI → BLL → DAL)

This application follows a strict 3-tier architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (UI)                          │
│                                                                     │
│   📁 app/          📁 components/         📁 hooks/                 │
│   (Screens)        (UI Components)        (State Bridge)            │
│                                                                     │
│   • Renders UI                                                      │
│   • Handles user interactions                                       │
│   • Uses hooks for data access                                      │
│   • NO direct data access                                           │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ imports hooks
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER (BLL)                        │
│                                                                     │
│   📁 services/                                                      │
│   ├── ColorService      (Color operations)                         │
│   ├── PaletteService    (Palette management)                       │
│   └── SettingsService   (User preferences)                         │
│                                                                     │
│   • Business rules & validation                                     │
│   • Orchestrates data operations                                    │
│   • Enforces limits (free vs pro)                                   │
│   • Observable state for reactivity                                 │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ imports providers
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER (DAL)                          │
│                                                                     │
│   📁 data/providers/                                                │
│   ├── IDataProvider           (Interface contract)                 │
│   ├── AsyncStorageProvider    (Local storage)                      │
│   ├── SecureStorageProvider   (Encrypted storage)                  │
│   ├── MemoryProvider          (Session cache)                      │
│   └── DataProviderFactory     (Creates providers)                  │
│                                                                     │
│   • Abstracts storage implementations                               │
│   • Handles serialization                                           │
│   • Provides consistent CRUD interface                              │
└─────────────────────────────────────────────────────────────────────┘
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
