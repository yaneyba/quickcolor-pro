# QuickColor Pro Deployment Guide

This guide walks you through deploying updates to Google Play Console for testing and production.

## Prerequisites

- EAS CLI installed (`npm install -g eas-cli`)
- Logged into EAS (`eas login`)
- Google Play Console access
- App already set up in Play Console with package: `space.manus.quickcolor.pro.t20251229203621`

---

## Part 1: Building a New Release

### Step 1: Update Version Number

Edit `app.config.ts` and increment the version:

```typescript
version: "1.0.4", // Increment this
```

> Note: `versionCode` (Android build number) auto-increments via EAS.

### Step 2: Commit Your Changes

```bash
git add -A
git commit -m "Bump version to 1.0.4"
git push
```

### Step 3: Build for Production

```bash
eas build --platform android --profile production
```

This builds an AAB (Android App Bundle) signed with your release keystore.

**Build Output:**
- AAB file is stored on EAS servers
- Build URL: `https://expo.dev/accounts/eyane/projects/quickcolor-pro/builds/[BUILD_ID]`

### Step 4: Download the AAB

1. Go to the build URL shown in terminal
2. Click **"Download"** button
3. Save the `.aab` file to your computer

---

## Part 2: Upload to Google Play Console

### Step 1: Open Play Console

Go to: https://play.google.com/console

### Step 2: Navigate to Your App

Select **QuickColor Pro** from your apps list.

### Step 3: Go to Testing Track

**For Closed Testing (Alpha):**
1. Left sidebar → **Testing** → **Closed testing**
2. Click on your track (e.g., "Alpha")

### Step 4: Create New Release

1. Click **"Create new release"**
2. Upload your `.aab` file
3. Add release notes (e.g., "Bug fixes and improvements")
4. Click **"Review release"**
5. Click **"Start rollout to Closed testing"**

---

## Part 3: Setting Up Testers

### Step 1: Add Yourself as Tester

1. In Closed testing, click **"Testers"** tab
2. Click **"Create email list"**
3. Name it (e.g., "Internal Testers")
4. Add your email address
5. Click **"Save changes"**

### Step 2: Get the Opt-in Link

1. In the Testers tab, find **"Copy link"** button
2. This is your opt-in URL

### Step 3: Accept Testing Invitation

**On your Android device:**
1. Open the opt-in link in a browser
2. Sign in with the same Google account you added as tester
3. Click **"Accept"** or **"Become a tester"**
4. Wait a few minutes for propagation

### Step 4: Install from Play Store

1. Open Google Play Store on your device
2. Search for **"QuickColor Pro"** (may need direct link)
3. Or use the Play Store link from the opt-in page
4. Install the app

---

## Quick Reference Commands

```bash
# Check current version
grep "version:" app.config.ts

# Build for testing (APK - sideload install)
eas build --platform android --profile preview

# Build for production (AAB - Play Store)
eas build --platform android --profile production

# List recent builds
eas build:list --platform android

# Download a specific build
eas build:download --id [BUILD_ID]
```

---

## Common Issues

### "App not available in your country"
- Make sure your tester email matches your Play Store account
- Re-accept the opt-in invitation

### "No update available"
- Clear Play Store cache (Settings → Apps → Play Store → Clear cache)
- Wait 15-30 minutes for propagation
- Try the direct Play Store link from opt-in page

### Build fails with path errors
- Check all import paths in `app.config.ts`
- Run `pnpm check` locally first

---

## Useful Links

- **EAS Build Dashboard:** https://expo.dev/accounts/eyane/projects/quickcolor-pro/builds
- **Google Play Console:** https://play.google.com/console
- **Your App on Play Store (after publish):** https://play.google.com/store/apps/details?id=space.manus.quickcolor.pro.t20251229203621
