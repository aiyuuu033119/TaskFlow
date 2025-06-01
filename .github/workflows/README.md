# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration. The pipeline includes automated testing, code quality checks, and security scanning.

## Workflows

### 1. CI Pipeline (`ci.yml`)
Runs on every push and pull request to main/develop branches.

**Jobs:**
- **Lint and Type Check**: ESLint, TypeScript, and Prettier checks
- **Build**: Builds the Next.js application
- **Unit Tests**: Runs Vitest tests with coverage
- **E2E Tests**: Runs Playwright tests
- **Security Audit**: npm audit and Snyk scanning
- **Lighthouse**: Performance testing
- **Release**: Automated semantic versioning and releases

### 2. Code Quality (`code-quality.yml`)
Runs on pull requests.

**Jobs:**
- Circular dependency checks
- Bundle size analysis
- SonarCloud code quality scan
- Automated PR comments with metrics

### 3. Dependabot Auto-Merge (`dependabot.yml`)
Automatically merges Dependabot PRs that pass tests.

## Required Secrets

Configure these in GitHub Settings → Secrets → Actions:

### Optional
- `CODECOV_TOKEN`: For coverage reports
- `SNYK_TOKEN`: For security scanning
- `SONAR_TOKEN`: For code quality analysis
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `NEXT_PUBLIC_APP_URL`: Production app URL

## Setting Up

1. **Install dependencies:**
   ```bash
   npm run scripts/setup-ci.sh
   ```

2. **Configure GitHub Secrets:**
   - Go to repository Settings → Secrets → Actions
   - Add all required secrets listed above

3. **Configure Environment Variables:**
   - `DATABASE_URL`: Your production database connection string
   - `NEXT_PUBLIC_APP_URL`: Your production URL

## Local Testing

Run CI checks locally:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Build
npm run build

# All checks
npm run validate
```

## Deployment Process

### Manual Deployment
To deploy your application, you'll need to set up your own deployment pipeline with your preferred hosting provider.

## Monitoring

### Build Status
Check workflow runs at: https://github.com/aiyuuu033119/TaskFlow/actions

### Deployment Status
- GitHub Actions: https://github.com/aiyuuu033119/TaskFlow/actions

### Code Quality
- CodeCov: https://codecov.io/gh/aiyuuu033119/TaskFlow
- SonarCloud: https://sonarcloud.io/project/overview?id=aiyuuu033119_TaskFlow

## Troubleshooting

### Build Failures
1. Check the Actions tab for error logs
2. Run `npm run validate` locally
3. Ensure all dependencies are installed

### Deployment Issues
1. Verify deployment secrets are correct
2. Check your hosting provider dashboard for errors
3. Ensure environment variables are set

### Test Failures
1. Run tests locally to reproduce
2. Check if database migrations are needed
3. Verify test environment setup

## Best Practices

1. **Commit Messages**: Use conventional commits for automatic versioning
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation
   - `chore:` Maintenance

2. **Branch Protection**: Enable these rules for `main`:
   - Require PR reviews
   - Require status checks to pass
   - Require branches to be up to date

3. **Security**: 
   - Keep dependencies updated
   - Review Dependabot PRs
   - Monitor security alerts

## Support

For issues with the CI/CD pipeline:
1. Check this documentation
2. Review workflow logs
3. Create an issue with the `ci/cd` label