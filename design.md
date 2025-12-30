# QuickColor Pro - Mobile App Interface Design

## Design Philosophy
QuickColor Pro follows **Apple Human Interface Guidelines (HIG)** with a minimalist dark mode UI optimized for **mobile portrait orientation (9:16)** and **one-handed usage**. The app prioritizes quick access to color picking tools with a clean, professional aesthetic that appeals to designers and developers.

## Color Palette
- **Primary**: `#FF6B35` (Vibrant coral-orange for CTAs and accents)
- **Background**: `#0F0F0F` (Deep black for dark mode)
- **Surface**: `#1A1A1A` (Elevated cards/panels)
- **Foreground**: `#FFFFFF` (Primary text)
- **Muted**: `#8A8A8A` (Secondary text, disabled states)
- **Border**: `#2A2A2A` (Subtle dividers)
- **Success**: `#4ADE80` (Saved palettes, confirmations)
- **Error**: `#F87171` (Validation errors)

## Screen List

### 1. Home Screen (Color Picker Hub)
**Primary Content:**
- Large circular color preview at top (shows last picked color or default)
- HEX/RGB/HSV values displayed prominently below preview
- Three main action cards:
  - "Screen Picker" - Launch floating overlay
  - "Photo Picker" - Pick from gallery
  - "Gradient Generator" - Create gradients
- Quick access to recent colors (horizontal scroll)
- Bottom tab bar: Home | Palettes | Settings

**Functionality:**
- Tap color preview to copy HEX code
- Long press preview for color format options
- Swipe recent colors to delete
- Haptic feedback on all interactions

### 2. Screen Picker (Floating Overlay)
**Primary Content:**
- Circular magnifying glass overlay (150dp diameter)
- Zoomed pixel grid inside circle (5x magnification)
- Crosshair at center indicating target pixel
- Floating info card showing:
  - Live color preview (40dp square)
  - HEX/RGB/HSV values
  - Coordinates (x, y in dp)
- Floating action buttons:
  - Save color
  - Close overlay
  - Settings (zoom level, grid toggle)

**Functionality:**
- Drag circle anywhere on screen
- Pinch to adjust zoom (2x-10x)
- Tap outside circle to capture color
- Double tap to save to current palette
- Notification controls for quick access

### 3. Photo Picker
**Primary Content:**
- Full-screen photo display
- Draggable circular picker (same as screen picker)
- Bottom sheet with:
  - Color info (HEX/RGB/HSV)
  - Save to palette button
  - Extract palette button (generates 5-color palette)
- Gallery access button (bottom-left)

**Functionality:**
- Tap to select photo from gallery
- Drag picker to sample colors
- Pinch to zoom photo
- Auto-extract dominant colors
- Save individual colors or entire palette

### 4. Palettes Screen
**Primary Content:**
- Grid of saved palettes (2 columns)
- Each palette card shows:
  - Palette name (editable)
  - 5 color swatches (horizontal)
  - Date created
  - Export/delete icons
- Floating "+" button to create new palette
- Search bar at top (filter by name)

**Functionality:**
- Tap palette to view details
- Long press for quick actions (rename, delete, export)
- Swipe to delete
- Drag to reorder
- Free tier: max 5 palettes
- Pro tier: unlimited palettes

### 5. Palette Detail Screen
**Primary Content:**
- Palette name (editable, top)
- Large color swatches (vertical list)
- Each swatch shows:
  - Color preview (full width)
  - HEX/RGB/HSV values
  - Copy button
  - Delete button
- Bottom action bar:
  - Add color
  - Export as PNG
  - Export as SVG (Pro only)
  - Share

**Functionality:**
- Tap swatch to copy HEX
- Long press for format options
- Drag to reorder colors
- Add up to 10 colors per palette
- Export generates downloadable file

### 6. Gradient Generator
**Primary Content:**
- Large gradient preview (full width, 200dp height)
- Color stops editor:
  - Horizontal slider with draggable stops
  - Add/remove stop buttons
  - Each stop shows color picker
- Gradient controls:
  - Type: Linear / Radial / Angular
  - Angle slider (for linear)
  - Reverse direction toggle
- Bottom actions:
  - Save to palettes
  - Export as PNG
  - Copy CSS code (Pro only)

**Functionality:**
- Drag stops to adjust position
- Tap stop to change color
- Add up to 5 stops
- Real-time preview
- Export as 1080x1920 PNG

### 7. Settings Screen
**Primary Content:**
- Profile section (if Pro):
  - Pro badge
  - Purchase date
- App Settings:
  - Default color format (HEX/RGB/HSV)
  - Haptic feedback toggle
  - Auto-save colors toggle
  - Zoom sensitivity slider
- Monetization:
  - "Remove Ads" button (Free tier)
  - "Upgrade to Pro" card with benefits list
  - Restore purchases
- About:
  - App version
  - Rate app
  - Privacy policy
  - Terms of service

**Functionality:**
- Toggle settings with immediate effect
- IAP flow for Pro upgrade ($2.99)
- Ad banner at bottom (Free tier only)

## Key User Flows

### Flow 1: Quick Screen Color Pick
1. User opens app → Home screen
2. Tap "Screen Picker" card
3. Grant overlay permission (first time)
4. Floating circle appears
5. Drag to target color
6. Tap outside circle to capture
7. Color saved to recent colors
8. Notification shows "Color copied to clipboard"

### Flow 2: Create Palette from Photo
1. User opens app → Home screen
2. Tap "Photo Picker" card
3. Grant photo permission (first time)
4. Select photo from gallery
5. Drag picker to sample colors
6. Tap "Extract Palette" button
7. App generates 5-color palette
8. Tap "Save Palette"
9. Enter palette name
10. Palette saved to Palettes screen

### Flow 3: Generate and Export Gradient
1. User navigates to Gradient Generator
2. Tap gradient preview to add color stops
3. Drag stops to adjust positions
4. Select gradient type (Linear)
5. Adjust angle with slider
6. Tap "Export as PNG"
7. Gradient saved to device storage
8. Share sheet appears for quick sharing

### Flow 4: Upgrade to Pro
1. User taps "Upgrade to Pro" in Settings
2. Modal shows Pro benefits:
   - Ad-free experience
   - Unlimited palettes
   - SVG export
   - CSS code export
3. Tap "Upgrade for $2.99"
4. Google Play billing flow
5. Purchase confirmed
6. Ads removed immediately
7. Pro badge appears in Settings

## UI Patterns

### Navigation
- **Bottom Tab Bar** (3 tabs):
  - Home (house icon)
  - Palettes (grid icon)
  - Settings (gear icon)
- **Stack Navigation** for detail screens
- **Modal Sheets** for quick actions (export, share)

### Interactions
- **Tap**: Primary action (select, copy)
- **Long Press**: Secondary actions (format options, quick menu)
- **Swipe**: Delete, dismiss
- **Drag**: Reorder, move picker
- **Pinch**: Zoom (photo/screen picker)
- **Haptic Feedback**: Light impact on all taps

### Typography
- **Headings**: SF Pro Display, 24-32sp, Bold
- **Body**: SF Pro Text, 16sp, Regular
- **Captions**: SF Pro Text, 14sp, Medium
- **Monospace** (for color codes): SF Mono, 14sp

### Components
- **Cards**: Rounded 16dp, surface background, subtle shadow
- **Buttons**: 
  - Primary: Filled, primary color, 48dp height
  - Secondary: Outlined, border color, 48dp height
  - Icon: 40dp circle, tap area 48dp
- **Input Fields**: Rounded 12dp, border, 48dp height
- **Bottom Sheets**: Rounded top corners (24dp), drag handle

## Accessibility
- **Color Contrast**: All text meets WCAG AA standards (4.5:1)
- **Touch Targets**: Minimum 48dp for all interactive elements
- **Screen Reader**: All icons have content descriptions
- **Haptics**: Optional, can be disabled in Settings

## Free vs Pro Features

### Free Tier
✅ Live screen color picking
✅ Photo color picking
✅ HEX/RGB/HSV formats
✅ Save up to 5 palettes
✅ Gradient generator
✅ PNG export
✅ Recent colors (last 10)
❌ Ads displayed (banner at bottom)

### Pro Tier ($2.99 one-time)
✅ All Free features
✅ Ad-free experience
✅ Unlimited palettes
✅ SVG export
✅ CSS gradient code export
✅ Priority support

## Technical Considerations
- **Minimum Android Version**: Android 7.0 (API 24)
- **Target Android Version**: Android 14 (API 34)
- **Permissions Required**:
  - `SYSTEM_ALERT_WINDOW` (overlay for screen picker)
  - `READ_MEDIA_IMAGES` (photo access)
  - `WRITE_EXTERNAL_STORAGE` (export files)
  - `POST_NOTIFICATIONS` (color capture notifications)
- **Native Modules Needed**:
  - Screen capture (MediaProjection API)
  - Overlay service (WindowManager)
  - File system access
- **Performance Targets**:
  - 60fps for overlay dragging
  - <100ms color sampling latency
  - <500ms palette generation
