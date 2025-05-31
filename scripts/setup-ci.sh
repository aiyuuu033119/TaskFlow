#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up CI/CD pipeline for TaskFlow...${NC}"

# Function to check if a secret is set
check_secret() {
    local secret_name=$1
    echo -e "${YELLOW}Please ensure you have set the GitHub secret: ${GREEN}$secret_name${NC}"
}

echo -e "\n${BLUE}Required GitHub Secrets:${NC}"
echo -e "${YELLOW}Navigate to: https://github.com/aiyuuu033119/TaskFlow/settings/secrets/actions${NC}"
echo -e "\nAdd the following secrets:"

# Vercel secrets
echo -e "\n${GREEN}Vercel Integration:${NC}"
check_secret "VERCEL_TOKEN"
check_secret "VERCEL_ORG_ID"
check_secret "VERCEL_PROJECT_ID"

# Optional secrets
echo -e "\n${GREEN}Optional Integrations:${NC}"
check_secret "CODECOV_TOKEN"
check_secret "SNYK_TOKEN"
check_secret "SONAR_TOKEN"
check_secret "SLACK_WEBHOOK_URL"

# Environment variables
echo -e "\n${GREEN}Environment Variables:${NC}"
echo -e "Add these in Vercel dashboard:"
echo -e "- DATABASE_URL (your production database URL)"
echo -e "- NEXT_PUBLIC_APP_URL (your production URL)"

# Install required dev dependencies
echo -e "\n${BLUE}Installing CI/CD dependencies...${NC}"
npm install --save-dev \
  @playwright/test \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitejs/plugin-react \
  vitest \
  @vitest/coverage-v8 \
  @vitest/ui \
  semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  madge \
  @next/bundle-analyzer

echo -e "\n${GREEN}✅ CI/CD setup complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Commit and push these changes"
echo -e "2. Set up the required secrets in GitHub"
echo -e "3. Create a Vercel project and link it"
echo -e "4. The CI/CD pipeline will run automatically on push/PR"

echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "npm test          - Run unit tests"
echo -e "npm run test:e2e  - Run E2E tests"
echo -e "npm run build     - Build the application"
echo -e "npm run analyze   - Analyze bundle size"