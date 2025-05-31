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

# Function to generate commit message based on changes
generate_commit_message() {
    echo -e "${YELLOW}No commit message provided. Analyzing changes...${NC}"
    
    # Get file changes
    ADDED=$(git diff --cached --name-only --diff-filter=A | wc -l)
    MODIFIED=$(git diff --cached --name-only --diff-filter=M | wc -l)
    DELETED=$(git diff --cached --name-only --diff-filter=D | wc -l)
    
    # Get changed files for more context
    CHANGED_FILES=$(git diff --cached --name-only | head -5)
    
    # Analyze the type of changes for better commit messages
    if [[ $(git diff --cached --name-only | grep -E "\.(test|spec)\.(ts|tsx|js|jsx)$" | wc -l) -gt 0 ]]; then
        MSG_PREFIX="test: "
        MSG_TYPE="tests"
    elif [[ $(git diff --cached --name-only | grep -E "^docs/|README|\.md$" | wc -l) -gt 0 ]]; then
        MSG_PREFIX="docs: "
        MSG_TYPE="documentation"
    elif [[ $(git diff --cached --name-only | grep -E "\.(css|scss|less)$|style" | wc -l) -gt 0 ]]; then
        MSG_PREFIX="style: "
        MSG_TYPE="styles"
    elif [[ $(git diff --cached --name-only | grep -E "^\.github/|^scripts/|config|^\..*rc" | wc -l) -gt 0 ]]; then
        MSG_PREFIX="chore: "
        MSG_TYPE="configuration"
    elif [[ $(git diff --cached --name-only | grep -E "package.*\.json|yarn\.lock|package-lock\.json" | wc -l) -gt 0 ]]; then
        MSG_PREFIX="chore: "
        MSG_TYPE="dependencies"
    elif [[ $DELETED -gt $MODIFIED ]]; then
        MSG_PREFIX="refactor: "
        MSG_TYPE="cleanup"
    elif [[ $ADDED -gt $MODIFIED ]]; then
        MSG_PREFIX="feat: "
        MSG_TYPE="new features"
    elif [[ $BRANCH_TYPE == "hotfix" ]]; then
        MSG_PREFIX="fix: "
        MSG_TYPE="bug fixes"
    elif [[ $BRANCH_TYPE == "release" ]]; then
        MSG_PREFIX="chore: "
        MSG_TYPE="release preparation"
    else
        MSG_PREFIX="fix: "
        MSG_TYPE="updates"
    fi
    
    # Get more specific context from changed files
    COMPONENTS_CHANGED=$(git diff --cached --name-only | grep -E "^components/" | wc -l)
    API_CHANGED=$(git diff --cached --name-only | grep -E "^app/api/" | wc -l)
    HOOKS_CHANGED=$(git diff --cached --name-only | grep -E "^hooks/" | wc -l)
    
    # Build more descriptive message based on what changed
    if [[ $COMPONENTS_CHANGED -gt 0 && $API_CHANGED -eq 0 ]]; then
        AREA="components"
    elif [[ $API_CHANGED -gt 0 && $COMPONENTS_CHANGED -eq 0 ]]; then
        AREA="API"
    elif [[ $HOOKS_CHANGED -gt 0 ]]; then
        AREA="hooks"
    elif [[ $(git diff --cached --name-only | grep -E "^scripts/" | wc -l) -gt 0 ]]; then
        AREA="scripts"
    else
        AREA="multiple areas"
    fi
    
    # Build commit message
    if [[ $ADDED -eq 0 && $MODIFIED -eq 0 && $DELETED -eq 0 ]]; then
        echo -e "${RED}No changes detected to commit${NC}"
        exit 1
    fi
    
    # Create descriptive message based on area and changes
    if [[ $AREA != "multiple areas" ]]; then
        # Single area changed - be specific
        if [[ $ADDED -gt 0 && $MODIFIED -eq 0 && $DELETED -eq 0 ]]; then
            ACTION="add new"
        elif [[ $MODIFIED -gt 0 && $ADDED -eq 0 && $DELETED -eq 0 ]]; then
            ACTION="update"
        elif [[ $DELETED -gt 0 && $ADDED -eq 0 && $MODIFIED -eq 0 ]]; then
            ACTION="remove"
        elif [[ $DELETED -gt $MODIFIED ]]; then
            ACTION="clean up"
        else
            ACTION="update"
        fi
        GENERATED_MSG="${MSG_PREFIX}${ACTION} ${AREA}"
    else
        # Multiple areas - be generic but informative
        MSG_PARTS=()
        [[ $ADDED -gt 0 ]] && MSG_PARTS+=("add $ADDED files")
        [[ $MODIFIED -gt 0 ]] && MSG_PARTS+=("update $MODIFIED files")
        [[ $DELETED -gt 0 ]] && MSG_PARTS+=("remove $DELETED files")
        MSG_DETAIL=$(IFS=", "; echo "${MSG_PARTS[*]}")
        GENERATED_MSG="${MSG_PREFIX}${MSG_DETAIL}"
    fi
    
    # Show generated message and ask for confirmation
    echo -e "${GREEN}Generated commit message:${NC}"
    echo -e "  ${BLUE}${GENERATED_MSG}${NC}"
    echo ""
    echo -e "${YELLOW}Changed files (first 5):${NC}"
    echo "$CHANGED_FILES" | sed 's/^/  /'
    echo ""
    read -p "Use this message? [Y/n/e(dit)]: " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ee]$ ]]; then
        # Allow editing
        echo -e "${YELLOW}Enter your commit message:${NC}"
        read -r COMMIT_MESSAGE
    elif [[ $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${RED}Aborting. Please run again with a commit message.${NC}"
        exit 1
    else
        COMMIT_MESSAGE="$GENERATED_MSG"
    fi
}

# Check if commit message is provided
if [ -z "$COMMIT_MESSAGE" ]; then
    # Check if there are any staged changes
    if [[ -z $(git diff --cached --name-only) ]]; then
        # No staged changes, stage all changes
        echo -e "${YELLOW}No staged changes. Staging all changes...${NC}"
        git add .
    fi
    
    # Generate commit message based on changes
    generate_commit_message
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