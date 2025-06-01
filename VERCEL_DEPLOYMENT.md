# Vercel Deployment Guide

This guide will help you deploy your TaskFlow application to Vercel.

## Prerequisites

- A GitHub account with your code pushed to a repository
- A Vercel account (free tier is sufficient)
- A production database (PostgreSQL recommended for Vercel)

## Database Setup

Since SQLite is file-based and not suitable for serverless environments, you'll need a PostgreSQL database for production. Here are some options:

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to the Storage tab
3. Create a new Postgres database
4. Copy the connection string

### Option 2: Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Option 3: Neon
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. **Connect Your Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the repository containing your TaskFlow app

2. **Configure Build Settings**
   - Framework Preset: Next.js (should auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm ci`

3. **Set Environment Variables**
   Add these environment variables in the Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N (for first time)
   - Project name: taskflow (or your preferred name)
   - Directory: ./ (current directory)
   - Override settings: N

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_APP_URL
   ```

## Post-Deployment Steps

### 1. Update Prisma Schema for PostgreSQL

If you're switching from SQLite to PostgreSQL, update your schema:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Run Database Migrations

After deployment, run migrations on your production database:

```bash
npx prisma migrate deploy
```

### 3. Update Your Environment Variables

Make sure your production database URL is set correctly in Vercel.

## Monitoring and Maintenance

### Check Deployment Status
- Visit your Vercel dashboard
- Check the deployment logs for any errors
- Monitor function execution times

### Database Maintenance
- Regularly backup your database
- Monitor database performance
- Set up alerts for errors

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check if all dependencies are in `package.json`
   - Ensure `postinstall` script runs `prisma generate`
   - Check for TypeScript errors with `npm run type-check`

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Check if database allows connections from Vercel IPs
   - Ensure SSL is enabled for production databases

3. **Function Timeouts**
   - API routes have timeout limits configured in vercel.json
   - Optimize database queries
   - Consider implementing caching

### Debug Commands

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Verify environment variables
vercel env ls

# Check deployment logs
vercel logs
```

## Performance Optimization

1. **Enable ISR (Incremental Static Regeneration)**
   - For pages with data that changes infrequently
   - Reduces database load

2. **Configure Caching Headers**
   - Already configured in vercel.json for API routes
   - Adjust as needed for your use case

3. **Monitor Performance**
   - Use Vercel Analytics
   - Set up monitoring with tools like Sentry

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's environment variable system
   - Rotate database credentials regularly

2. **API Security**
   - CORS headers are configured
   - Rate limiting can be added if needed
   - Input validation is implemented

3. **Database Security**
   - Use connection pooling
   - Enable SSL for database connections
   - Regular security updates

## Next Steps

After successful deployment:

1. Set up a custom domain
2. Enable Vercel Analytics
3. Configure preview deployments for PRs
4. Set up monitoring and alerts
5. Implement CI/CD pipeline

For more information, visit the [Vercel Documentation](https://vercel.com/docs).