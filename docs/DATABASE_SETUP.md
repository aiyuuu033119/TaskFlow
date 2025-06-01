# PostgreSQL Database Setup Guide

This guide provides detailed instructions for setting up PostgreSQL for the TaskFlow application.

## Prerequisites

- PostgreSQL 14.0 or higher
- Node.js 18.0 or higher
- npm or yarn package manager

## Installation

### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL and contrib package
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Windows

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user

## Database Setup

### 1. Create Database and User

#### Linux/macOS

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE taskflow;

# Create user with password
CREATE USER postgres WITH PASSWORD 'password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE taskflow TO postgres;

# Exit psql
\q
```

#### Windows

Open Command Prompt as Administrator:

```cmd
# Connect to PostgreSQL
psql -U postgres

# Then run the same SQL commands as above
```

### 2. Alternative: Using Connection String

If you prefer using a different username or have an existing PostgreSQL setup:

```bash
# Example connection strings:
# Local development
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow?schema=public"

# Remote database
DATABASE_URL="postgresql://username:password@your-host.com:5432/taskflow?schema=public&sslmode=require"
```

## Verify Connection

Test your database connection:

```bash
# Install dependencies if not already done
npm install

# Test the connection
npx prisma db push
```

If successful, you should see:
```
🚀 Your database is now in sync with your Prisma schema.
```

## Common Issues

### Port Already in Use

If PostgreSQL fails to start because port 5432 is in use:

```bash
# Find process using port 5432
sudo lsof -i :5432

# Stop the process or change PostgreSQL port in postgresql.conf
```

### Permission Denied

If you get permission errors:

```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Check pg_hba.conf settings
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure local connections are set to trust or md5
# local   all             all                                     md5
```

### Connection Refused

If you can't connect to the database:

1. Check if PostgreSQL is running:
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # macOS
   brew services list
   ```

2. Check PostgreSQL logs:
   ```bash
   # Linux
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   
   # macOS
   tail -f /usr/local/var/log/postgresql@14.log
   ```

3. Verify listen_addresses in postgresql.conf:
   ```bash
   # Should include 'localhost' or '*'
   listen_addresses = 'localhost'
   ```

## Docker Alternative

If you prefer using Docker:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: taskflow-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: taskflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL container
docker-compose up -d

# Your connection string will be:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow?schema=public"
```

## Production Considerations

For production deployments:

1. **Use strong passwords**: Generate secure passwords for database users
2. **Enable SSL**: Use `sslmode=require` in your connection string
3. **Regular backups**: Set up automated backup scripts
4. **Connection pooling**: Consider using PgBouncer for high-traffic applications
5. **Monitoring**: Set up monitoring for database performance

Example production connection string:
```
DATABASE_URL="postgresql://user:strong_password@db.example.com:5432/taskflow?schema=public&sslmode=require&connection_limit=10"
```

## Next Steps

Once PostgreSQL is set up:

1. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

2. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

For more information, see the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql).