#!/bin/bash

# Script to create branch following Git Flow, add files, commit with formatting fixes, and push
# Workflow: Create branch → Checkout → Add/Commit → Push → Return to main

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  npm run g-push [options] \"commit message\" [branch-name]"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  -f  Feature branch (default)"
    echo "  -h  Hotfix branch"
    echo "  -r  Release branch"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  npm run g-push \"Add user authentication\""
    echo "  npm run g-push -f \"Add user authentication\""
    echo "  npm run g-push -h \"Fix critical bug\""
    echo "  npm run g-push -r \"Prepare version 1.0.0\""
    echo "  npm run g-push -f \"Add auth\" custom-name"
    echo ""
    echo -e "${BLUE}Workflow:${NC}"
    echo "  1. Adds and commits all changes"
    echo "  2. Creates new branch from current branch"
    echo "  3. Switches to new branch"
    echo "  4. Pushes to remote"
    echo "  5. Returns to main branch"
    exit 1
}

# Set default branch type
BRANCH_TYPE="feature"
COMMIT_MESSAGE=""
CUSTOM_NAME=""

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--feature)
            BRANCH_TYPE="feature"
            shift
            ;;
        -h|--hotfix)
            BRANCH_TYPE="hotfix"
            shift
            ;;
        -r|--release)
            BRANCH_TYPE="release"
            shift
            ;;
        -*)
            echo -e "${RED}Error: Unknown option $1${NC}"
            usage
            ;;
        *)
            # First non-option argument is the commit message
            if [ -z "$COMMIT_MESSAGE" ]; then
                COMMIT_MESSAGE="$1"
            else
                # Second non-option argument is the custom branch name
                CUSTOM_NAME="$1"
            fi
            shift
            ;;
    esac
done

# Check if commit message is provided
if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${RED}Error: Please provide a commit message${NC}"
    usage
fi

# Generate branch name following GIT_FLOW.md conventions
if [ -z "$CUSTOM_NAME" ]; then
    # Auto-generate SHORT name from commit message (kebab-case, max 20 chars for brevity)
    SANITIZED_NAME=$(echo "$COMMIT_MESSAGE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-20)
    BRANCH_NAME="${BRANCH_TYPE}/${SANITIZED_NAME}"
else
    BRANCH_NAME="${BRANCH_TYPE}/${CUSTOM_NAME}"
fi

echo -e "${BLUE}Starting GitHub push workflow...${NC}"
echo -e "${BLUE}Branch type: ${BRANCH_TYPE}${NC}"
echo -e "${BLUE}Branch name: ${BRANCH_NAME}${NC}"

# Store the original branch to return to later
ORIGINAL_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: ${ORIGINAL_BRANCH}${NC}"

# Step 1: Add all files
echo -e "${GREEN}Adding all files...${NC}"
git add .

# Step 2: Commit with no-verify to bypass hooks initially
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE" --no-verify

# Step 3: Create new branch from current position
echo -e "${GREEN}Creating new branch: $BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

# If branch already exists, we need to handle it differently
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Branch already exists, checking out...${NC}"
    git checkout "$BRANCH_NAME"
fi

# Step 4: Run formatters and linters manually
echo -e "${GREEN}Running formatters...${NC}"
npm run format 2>/dev/null || true

# Check if formatters made any changes
if [[ -n $(git diff --name-only) ]]; then
    echo -e "${YELLOW}Formatting changes detected, committing...${NC}"
    git add .
    git commit -m "style: Auto-fix formatting issues" --no-verify
fi

# Step 5: Push to origin
echo -e "${GREEN}Pushing to origin...${NC}"
git push -u origin "$BRANCH_NAME"

# Step 6: Return to main branch
echo -e "${GREEN}Returning to main branch...${NC}"
git checkout main

# If main doesn't exist, try master
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Main branch not found, trying master...${NC}"
    git checkout master
fi

# Pull latest changes on main
echo -e "${GREEN}Pulling latest changes on main...${NC}"
git pull origin $(git branch --show-current)

# Get repository info for PR URL
REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')

# Show summary
echo -e "\n${GREEN}✅ GitHub push workflow completed!${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           WORKFLOW SUMMARY             ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} Branch created: ${GREEN}${BRANCH_NAME}${NC}"
echo -e "${BLUE}║${NC} Commits pushed: ${GREEN}✓${NC}"
echo -e "${BLUE}║${NC} Current branch: ${GREEN}$(git branch --show-current)${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📌 Create a pull request:${NC}"
echo -e "   ${GREEN}https://github.com/${REPO_URL}/pull/new/${BRANCH_NAME}${NC}"
echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  IMPORTANT REMINDER:${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Before making any new changes, ALWAYS pull the latest:${NC}"
echo -e "   ${GREEN}git pull origin main${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"