#!/bin/bash
set -e

# QuickColor Pro Release Script
# Automates: version bump → type check → commit → build → download AAB

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 QuickColor Pro Release Script${NC}\n"

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Parse arguments
SKIP_BUILD=false
VERSION_TYPE="patch"  # patch, minor, major

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build) SKIP_BUILD=true ;;
        --major) VERSION_TYPE="major" ;;
        --minor) VERSION_TYPE="minor" ;;
        --patch) VERSION_TYPE="patch" ;;
        -h|--help)
            echo "Usage: ./scripts/release.sh [options]"
            echo ""
            echo "Options:"
            echo "  --patch       Increment patch version (1.0.3 → 1.0.4) [default]"
            echo "  --minor       Increment minor version (1.0.3 → 1.1.0)"
            echo "  --major       Increment major version (1.0.3 → 2.0.0)"
            echo "  --skip-build  Skip EAS build (just bump version and commit)"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Get current version
echo -e "${BOLD}Step 1: Reading current version...${NC}"
CURRENT_VERSION=$(grep 'version:' app.config.ts | sed 's/.*version:[[:space:]]*"\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/')
echo "Current version: $CURRENT_VERSION"

# Step 2: Calculate new version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $VERSION_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo -e "New version: ${GREEN}$NEW_VERSION${NC}\n"

# Step 3: Update version in app.config.ts
echo -e "${BOLD}Step 2: Updating app.config.ts...${NC}"
sed -i.bak "s/version: \"$CURRENT_VERSION\"/version: \"$NEW_VERSION\"/" app.config.ts
rm -f app.config.ts.bak
echo -e "${GREEN}✓${NC} Version updated\n"

# Step 4: Run type check
echo -e "${BOLD}Step 3: Running type check...${NC}"
if pnpm check; then
    echo -e "${GREEN}✓${NC} Type check passed\n"
else
    echo -e "${RED}✗ Type check failed. Reverting version change.${NC}"
    sed -i.bak "s/version: \"$NEW_VERSION\"/version: \"$CURRENT_VERSION\"/" app.config.ts
    rm -f app.config.ts.bak
    exit 1
fi

# Step 5: Commit changes
echo -e "${BOLD}Step 4: Committing changes...${NC}"
git add -A
git commit -m "Bump version to $NEW_VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
echo -e "${GREEN}✓${NC} Changes committed\n"

# Step 6: Push to remote
echo -e "${BOLD}Step 5: Pushing to remote...${NC}"
git push
echo -e "${GREEN}✓${NC} Pushed to remote\n"

if [ "$SKIP_BUILD" = true ]; then
    echo -e "${YELLOW}Skipping build (--skip-build flag)${NC}\n"
    echo -e "${GREEN}✓ Release preparation complete!${NC}"
    echo -e "Version: $NEW_VERSION"
    echo -e "\nTo build manually, run:"
    echo -e "  eas build --platform android --profile production"
    exit 0
fi

# Step 7: Build with EAS
echo -e "${BOLD}Step 6: Starting EAS production build...${NC}"
echo -e "${YELLOW}This will take several minutes...${NC}\n"

BUILD_OUTPUT=$(eas build --platform android --profile production --non-interactive --json 2>&1)
BUILD_ID=$(echo "$BUILD_OUTPUT" | sed -n 's/.*"id":[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [ -z "$BUILD_ID" ]; then
    echo -e "${RED}✗ Failed to get build ID${NC}"
    echo "$BUILD_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build started: $BUILD_ID\n"

# Step 8: Wait for build and download
echo -e "${BOLD}Step 7: Waiting for build to complete...${NC}"
echo -e "${YELLOW}This typically takes 10-15 minutes...${NC}\n"

# Poll build status
while true; do
    STATUS=$(eas build:view "$BUILD_ID" --json 2>/dev/null | sed -n 's/.*"status":[[:space:]]*"\([^"]*\)".*/\1/p')

    case $STATUS in
        "finished"|"FINISHED")
            echo -e "\n${GREEN}✓${NC} Build completed!\n"
            break
            ;;
        "errored"|"canceled"|"ERRORED"|"CANCELED")
            echo -e "\n${RED}✗ Build failed with status: $STATUS${NC}"
            echo "View details: https://expo.dev/accounts/eyane/projects/quickcolor-pro/builds/$BUILD_ID"
            exit 1
            ;;
        *)
            echo -n "."
            sleep 30
            ;;
    esac
done

# Step 9: Download AAB
echo -e "${BOLD}Step 8: Downloading AAB...${NC}"
DOWNLOAD_DIR="$PROJECT_ROOT/builds"
mkdir -p "$DOWNLOAD_DIR"

AAB_PATH="$DOWNLOAD_DIR/quickcolor-pro-$NEW_VERSION.aab"
eas build:download --id "$BUILD_ID" --path "$AAB_PATH"

if [ -f "$AAB_PATH" ]; then
    echo -e "${GREEN}✓${NC} Downloaded: $AAB_PATH\n"
else
    echo -e "${YELLOW}⚠ Download may have failed. Check manually:${NC}"
    echo "  eas build:download --id $BUILD_ID"
fi

# Done!
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✓ Release $NEW_VERSION complete!${NC}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "AAB Location: ${BOLD}$AAB_PATH${NC}\n"

echo -e "${BOLD}Next steps:${NC}"
echo "1. Go to Google Play Console: https://play.google.com/console"
echo "2. Select QuickColor Pro → Testing → Closed testing"
echo "3. Create new release and upload: $AAB_PATH"
echo "4. Add release notes and submit for review"
echo ""
echo -e "Build URL: https://expo.dev/accounts/eyane/projects/quickcolor-pro/builds/$BUILD_ID"
