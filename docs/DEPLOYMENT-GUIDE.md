# QuickColor Pro Deployment Guide

## Quick Release (Automated)

```bash
pnpm release
```

That's it. The script handles everything and downloads the AAB to `builds/`.

Then upload to Play Console (see Step 2 below).

---

## Full Process

### Step 1: Build the Release

**Option A: Automated (recommended)**

```bash
pnpm release          # patch bump: 1.0.3 → 1.0.4
pnpm release:minor    # minor bump: 1.0.3 → 1.1.0
pnpm release:major    # major bump: 1.0.3 → 2.0.0
```

**Option B: Manual**

```bash
# 1. Edit version in app.config.ts
# 2. Commit and push
git add -A && git commit -m "Bump version to X.X.X" && git push
# 3. Build
eas build --platform android --profile production
# 4. Download AAB from the URL shown in terminal
```

---

### Step 2: Upload to Play Console

1. Go to https://play.google.com/console
2. Select **QuickColor Pro**
3. Go to **Testing** → **Closed testing**
4. Click **Create new release**
5. Upload the `.aab` file
6. Add release notes
7. Click **Review release** → **Start rollout**

---

### Step 3: Test on Device (First Time Only)

1. In Play Console, go to **Testers** tab
2. Add your email to a tester list
3. Copy the opt-in link
4. Open link on your Android device and accept
5. Install from Play Store

---

## Commands Reference

| Command | What it does |
|---------|--------------|
| `pnpm release` | Full automated release |
| `pnpm release --skip-build` | Just bump version, no build |
| `eas build:list` | List recent builds |
| `eas build:download --id ID` | Download a specific build |

---

## Troubleshooting

**Build fails?** Run `pnpm check` first.

**Script fails?** Check `eas whoami` to verify login.

**App not in Play Store?** Wait 15-30 min, clear Play Store cache.

---

## Links

- EAS Builds: https://expo.dev/accounts/eyane/projects/quickcolor-pro/builds
- Play Console: https://play.google.com/console
