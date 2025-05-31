# CI/CD Pipeline Setup Instructions

## Overview

A comprehensive CI/CD pipeline has been configured for TaskFlow using GitHub Actions. However, the workflow files need to be pushed with a token that has the `workflow` scope.

## Setup Steps

### 1. Create a GitHub Personal Access Token with Workflow Scope

1. Go to https://github.com/settings/tokens/new
2. Give it a name: "TaskFlow CI/CD Token"
3. Set expiration as needed
4. Select the following scopes:
   - ✅ repo (all)
   - ✅ workflow
   - ✅ write:packages (optional, for package publishing)
   - ✅ delete:packages (optional, for cleanup)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### 2. Update Git Remote with New Token

```bash
# Update the remote URL with your new token
git remote set-url origin https://YOUR_NEW_TOKEN@github.com/aiyuuu033119/TaskFlow.git

# Push the CI/CD configuration
git push origin main
```

### 3. Configure GitHub Secrets

Go to: https://github.com/aiyuuu033119/TaskFlow/settings/secrets/actions

Add these secrets:

#### Required for Vercel Deployment:
- `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: Get from Vercel project settings
- `VERCEL_PROJECT_ID`: Get from Vercel project settings

#### Optional Integrations:
- `CODECOV_TOKEN`: From https://codecov.io
- `SNYK_TOKEN`: From https://snyk.io
- `SONAR_TOKEN`: From https://sonarcloud.io
- `SLACK_WEBHOOK_URL`: From Slack incoming webhooks

### 4. Create Vercel Project

1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Configure environment variables:
   - `DATABASE_URL`: Your production database URL
   - `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., https://taskflow.vercel.app)
4. Note the project ID and org ID from settings

### 5. Install Dependencies Locally

```bash
# Run the setup script
bash scripts/setup-ci.sh

# Or manually install
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
```

## What's Included

### GitHub Actions Workflows

1. **CI Pipeline** (`ci.yml`)
   - Runs on every push and PR
   - Linting and type checking
   - Unit tests with coverage
   - E2E tests
   - Security audits
   - Build verification

2. **Deploy to Production** (`deploy.yml`)
   - Automatic deployment to Vercel on main branch
   - Production E2E tests
   - Deployment notifications

3. **Code Quality** (`code-quality.yml`)
   - Bundle size analysis
   - Circular dependency checks
   - SonarCloud integration
   - Automated PR comments

4. **Dependabot** (`dependabot.yml`)
   - Automated dependency updates
   - Security patches
   - Auto-merge for passing PRs

### Testing Setup

- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright for browser testing
- **Coverage**: CodeCov integration

### Additional Features

- Health check endpoint at `/api/health`
- Security headers configured
- Bundle analyzer for optimization
- Semantic versioning with automatic releases

## Running Tests Locally

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint

# All validations
npm run validate
```

## Monitoring

- **Build Status**: https://github.com/aiyuuu033119/TaskFlow/actions
- **Deployments**: https://github.com/aiyuuu033119/TaskFlow/deployments
- **Vercel Dashboard**: https://vercel.com/dashboard

## Troubleshooting

### Token Issues
- Ensure your token has the `workflow` scope
- Regenerate token if expired

### Build Failures
- Check Actions tab for detailed logs
- Run `npm run validate` locally
- Ensure all dependencies are installed

### Test Failures
- Database migrations: `npm run db:migrate`
- Clear test database: `rm -f test.db`
- Check environment variables

## Next Steps

1. Update git remote with new token (with workflow scope)
2. Push the CI/CD configuration
3. Set up Vercel project
4. Configure GitHub secrets
5. Create a PR to test the pipeline

The CI/CD pipeline will automatically run on your next push or PR!