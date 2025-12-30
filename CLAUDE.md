# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

QuickColor Pro is a professional color picker mobile app for Android built with React Native and Expo. It's a freemium app with a $2.99 one-time Pro upgrade.

## Tech Stack

- **Framework**: React Native 0.81.5 + Expo SDK 54
- **Language**: TypeScript 5.9
- **Styling**: NativeWind 4 (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State**: React Query (@tanstack/react-query)
- **Storage**: AsyncStorage (local persistence)
- **Build**: EAS Build (Expo Application Services)
- **Package Manager**: pnpm

## Project Structure

```
app/                  # Screens (Expo Router file-based routing)
├── (tabs)/           # Tab navigation screens
│   ├── index.tsx     # Home screen
│   ├── palettes.tsx  # Palette management
│   └── settings.tsx  # Settings & Pro upgrade
├── photo-picker.tsx  # Photo color extraction
└── gradient-generator.tsx

components/           # Reusable UI components
lib/                  # Utilities and helpers
├── color-utils.ts    # Color conversion functions (HEX/RGB/HSV)
└── utils.ts          # General utilities

hooks/                # React hooks
constants/            # App constants and theme
play-store-assets/    # Google Play Store assets
```

## Common Commands

```bash
# Development
pnpm dev              # Start dev server + Metro bundler
pnpm android          # Run on Android
pnpm ios              # Run on iOS

# Build
eas build --platform android --profile preview    # APK for testing
eas build --platform android --profile production # AAB for Play Store

# Code Quality
pnpm check            # TypeScript type check
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Vitest tests
```

## Key Files

- `app.config.ts` - Expo configuration (bundle ID, permissions, etc.)
- `eas.json` - EAS Build configuration
- `tailwind.config.js` - Tailwind/NativeWind theme
- `theme.config.js` - App color tokens
- `lib/color-utils.ts` - Color conversion utilities

## Design System

```
Primary:     #FF6B35 (Coral Orange)
Background:  #0F0F0F (Deep Black)
Surface:     #1A1A1A (Elevated cards)
Foreground:  #FFFFFF (Text)
Muted:       #8A8A8A (Secondary text)
Border:      #2A2A2A (Dividers)
```

## Architecture Notes

- **File-based routing**: Screens in `app/` directory map to routes
- **Tab navigation**: `app/(tabs)/` contains the main tab screens
- **Color utilities**: All color conversions in `lib/color-utils.ts`
- **Local-first**: All data stored on-device via AsyncStorage
- **No backend required**: App works fully offline

## Current Status

MVP complete with:
- Photo color picker with draggable magnifier
- HEX/RGB/HSV format display
- Gradient generator
- Dark mode UI

Pending:
- Copy to clipboard
- Palette persistence
- AdMob integration
- Google Play Billing

See `ROADMAP.md` for full feature roadmap.

## Bundle ID

`space.manus.quickcolor.pro.t20251229203621`

## EAS Project

- Project ID: `a7aec25b-9c82-42fe-b54c-c092612f90e9`
- Owner: `eyane`

## GitHub

https://github.com/yaneyba/quickcolor-pro
