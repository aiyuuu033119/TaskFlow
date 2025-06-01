# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration and deployment. The pipeline follows best practices with fast feedback, comprehensive quality checks, and automated deployment.

> 📖 **For detailed CI/CD guide, see [CI_CD_GUIDE.md](../../docs/CI_CD_GUIDE.md)**

The pipeline includes automated testing, code quality checks with lint-staged, security scanning, and deployment workflows.

## Workflows

### 1. CI Pipeline (`ci.yml`)
Runs on every push and pull request to main/develop branches.

**Jobs:**
- **Lint and Type Check**: ESLint, TypeScript, and Prettier formatting checks
- **Build**: Builds the Next.js application with Prisma client generation
- **Unit Tests**: Runs Vitest tests with coverage reporting to Codecov
- **Dependabot**: Auto-approves and merges dependency update PRs


## Required Secrets

Configure these in GitHub Settings → Secrets → Actions:

### Essential
- `CODECOV_TOKEN`: For test coverage reporting
- `DATABASE_URL`: Production database connection string (optional, defaults to file:./dev.db)
- `NEXT_PUBLIC_APP_URL`: Application URL (optional, defaults to http://localhost:3000)

### Optional
- `SNYK_TOKEN`: For security scanning (if using Snyk)

## Setting Up

1. **Install dependencies:**
   ```bash
   npm run scripts/setup-ci.sh
   ```

2. **Create Vercel Project:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Note the project ID and org ID

3. **Configure GitHub Secrets:**
   - Go to repository Settings → Secrets → Actions
   - Add all required secrets listed above

4. **Configure Vercel Environment Variables:**
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

### Automatic Deployments
- **Production**: Merges to `main` trigger production deployments
- **Preview**: PRs get automatic preview deployments

### Manual Deployment
Trigger a deployment manually:
1. Go to Actions tab
2. Select "Deploy to Production"
3. Click "Run workflow"

## Monitoring

### Build Status
Check workflow runs at: https://github.com/aiyuuu033119/TaskFlow/actions

### Deployment Status
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Deployments: https://github.com/aiyuuu033119/TaskFlow/deployments

### Code Quality
- CodeCov: https://codecov.io/gh/aiyuuu033119/TaskFlow
- SonarCloud: https://sonarcloud.io/project/overview?id=aiyuuu033119_TaskFlow

## Troubleshooting

### Build Failures
1. Check the Actions tab for error logs
2. Run `npm run validate` locally
3. Ensure all dependencies are installed

### Deployment Issues
1. Verify Vercel secrets are correct
2. Check Vercel dashboard for errors
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