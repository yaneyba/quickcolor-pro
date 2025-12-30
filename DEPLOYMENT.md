# QuickColor Pro - Deployment Guide

## Overview
This guide covers building the Android APK and deploying QuickColor Pro to Google Play Store.

## Prerequisites

### Development Environment
- Node.js 18+ installed
- pnpm package manager
- EAS CLI installed: `npm install -g eas-cli`
- Expo account (free): https://expo.dev/signup

### Google Play Console
- Google Play Developer account ($25 one-time fee)
- Access to Google Play Console: https://play.google.com/console

## Building the APK

### Option 1: EAS Build (Recommended)

EAS Build is Expo's cloud build service that handles Android builds without requiring local Android Studio setup.

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Configure EAS Build
```bash
cd quickcolor-pro
eas build:configure
```

#### Step 4: Build APK for Production
```bash
# Build APK (for testing and sideloading)
eas build --platform android --profile preview

# Build AAB (for Play Store submission)
eas build --platform android --profile production
```

The build will take 10-15 minutes. Once complete, download the APK/AAB from the provided link.

### Option 2: Local Build (Requires Android Studio)

If you prefer building locally:

#### Step 1: Install Android Studio
Download from: https://developer.android.com/studio

#### Step 2: Set up Android SDK
- Open Android Studio
- Go to Settings → Appearance & Behavior → System Settings → Android SDK
- Install Android 14 (API 34) and Android SDK Build-Tools

#### Step 3: Set Environment Variables
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Step 4: Generate Android Project
```bash
cd quickcolor-pro
npx expo prebuild --platform android
```

#### Step 5: Build APK
```bash
cd android
./gradlew assembleRelease
```

The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

## App Signing

### Generate Keystore (First Time Only)
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore quickcolor-pro.keystore -alias quickcolor-pro -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Store the keystore file and passwords securely. You'll need them for all future updates.

### Configure Signing in EAS
Create `eas.json` in project root:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json"
      }
    }
  }
}
```

## Google Play Store Submission

### Step 1: Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in basic information:
   - **App name:** QuickColor Pro
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - **Category:** Tools

### Step 2: Store Listing

#### App Details
- **Short description:** (Copy from `play-store-assets/app-description.md`)
- **Full description:** (Copy from `play-store-assets/app-description.md`)

#### Graphics
Upload from `play-store-assets/` folder:
- **App icon:** 512x512 PNG (use `icon.png`)
- **Feature graphic:** 1024x500 PNG (`feature-graphic.png`)
- **Phone screenshots:** Upload all 5 screenshots (minimum 2 required)
  - `screenshot-1-home.png`
  - `screenshot-2-photo-picker.png`
  - `screenshot-3-palettes.png`
  - `screenshot-4-gradient.png`
  - `screenshot-5-settings.png`

#### Categorization
- **App category:** Tools
- **Tags:** Design, Productivity, Utilities
- **Content rating:** Everyone

#### Contact Details
- **Email:** support@quickcolor.pro
- **Website:** (Your website URL)
- **Privacy policy:** (Host `privacy-policy.md` on your website and provide URL)

### Step 3: Content Rating

Complete the content rating questionnaire:
- Select "Tools" as app category
- Answer "No" to all content questions (app has no objectionable content)
- Submit for rating

### Step 4: App Content

#### Privacy Policy
- Upload privacy policy URL (host `privacy-policy.md` on your website)

#### Data Safety
Fill out data safety form:
- **Does your app collect or share user data?** No
- **Is all data encrypted in transit?** Yes
- **Can users request data deletion?** Yes (by uninstalling app)

#### Ads Declaration
- **Does your app contain ads?** Yes (for free version)
- **Ad provider:** Google AdMob

### Step 5: Upload APK/AAB

1. Go to "Production" → "Create new release"
2. Upload the AAB file built with EAS
3. Add release notes (copy from "What's New" section)
4. Review and roll out to production

### Step 6: Pricing & Distribution

- **Countries:** Select all countries
- **Pricing:** Free
- **In-app products:** Configure Pro upgrade ($2.99)

#### Configure In-App Purchase

1. Go to "Monetize" → "In-app products"
2. Click "Create product"
3. Fill in details:
   - **Product ID:** `pro_upgrade`
   - **Name:** QuickColor Pro Upgrade
   - **Description:** Unlock all Pro features: ad-free, unlimited palettes, SVG export, CSS code
   - **Price:** $2.99 USD
   - **Type:** One-time purchase (non-consumable)

## Testing Before Launch

### Internal Testing Track

1. Go to "Testing" → "Internal testing"
2. Create new release
3. Upload APK/AAB
4. Add testers (email addresses)
5. Share testing link with testers
6. Collect feedback and fix bugs

### Closed Beta Testing

1. Go to "Testing" → "Closed testing"
2. Create new release
3. Invite 20-100 beta testers
4. Run for 2 weeks minimum
5. Address feedback

### Pre-Launch Report

Google Play will automatically test your app on real devices and provide a report. Review and fix any issues.

## Launch Checklist

- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] At least 2 screenshots uploaded (5 recommended)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] APK/AAB uploaded and signed
- [ ] In-app purchase configured ($2.99 Pro upgrade)
- [ ] Pricing set to Free
- [ ] Countries selected
- [ ] Contact email verified
- [ ] Pre-launch report reviewed
- [ ] All policy violations resolved

## Post-Launch

### Monitor Performance

1. **Google Play Console Dashboard**
   - Track installs, ratings, reviews
   - Monitor crash reports
   - Check ANR (App Not Responding) rates

2. **User Feedback**
   - Respond to reviews within 24 hours
   - Address common issues in updates
   - Collect feature requests

3. **Analytics** (Optional)
   - Integrate Google Analytics for Firebase
   - Track user engagement
   - Monitor conversion rates (Free → Pro)

### Update Strategy

1. **Bug Fixes:** Release within 1-2 days
2. **Minor Updates:** Every 2-4 weeks
3. **Major Features:** Every 2-3 months

### ASO (App Store Optimization)

1. **Monitor Keywords**
   - Track rankings for target keywords
   - Adjust description based on performance
   - Test different screenshots

2. **A/B Testing**
   - Test different feature graphics
   - Experiment with screenshot order
   - Try variations of short description

3. **Localization**
   - Translate to top 5 languages (Spanish, French, German, Portuguese, Japanese)
   - Localize screenshots with text overlays

## Monetization Strategy

### Free Tier
- Display banner ads at bottom of screens
- Limit to 5 saved palettes
- Basic features fully functional

### Pro Upgrade ($2.99)
- Remove all ads
- Unlimited palettes
- SVG export
- CSS gradient code
- Priority support

### Expected Revenue
Based on 100M+ demand for color picker apps:
- **Target:** 10,000 installs/month
- **Conversion rate:** 2-5% (200-500 Pro upgrades)
- **Revenue:** $600-$1,500/month
- **Ad revenue:** $200-$400/month (from free users)
- **Total:** $800-$1,900/month

## Support & Maintenance

### User Support
- **Email:** support@quickcolor.pro
- **Response time:** Within 24 hours
- **Common issues:** Document in FAQ

### Bug Tracking
- Use GitHub Issues or Jira
- Prioritize crashes and ANRs
- Fix critical bugs within 48 hours

### Feature Requests
- Collect from reviews and support emails
- Vote on most requested features
- Implement in quarterly updates

## Legal Compliance

### Required Policies
- Privacy Policy (provided)
- Terms of Service
- Refund Policy (Google Play standard)

### GDPR Compliance
- No personal data collected
- Users can delete data by uninstalling
- Privacy policy clearly states data practices

### COPPA Compliance
- App is rated Everyone
- No data collection from children
- No targeted ads to children

## Troubleshooting

### Build Failures
- Check Node.js version (18+)
- Clear cache: `pnpm store prune`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Signing Issues
- Verify keystore path and passwords
- Check keystore validity: `keytool -list -v -keystore quickcolor-pro.keystore`

### Play Store Rejections
- Review Google Play policies
- Fix policy violations
- Resubmit with detailed explanation

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [In-App Billing Guide](https://developer.android.com/google/play/billing)

## Contact

For deployment assistance:
- **Email:** support@quickcolor.pro
- **Documentation:** See README.md
- **Issues:** GitHub Issues (if applicable)
