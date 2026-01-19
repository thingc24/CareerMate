# Job-Service Database Setup

## Overview

Job-Service uses a dedicated PostgreSQL database: `job_service_db` with schema `jobservice`.

## Quick Setup

Run the PowerShell script to automatically create the database and migrate data:

```powershell
cd backend\microservices\job-service\src\main\java\vn\careermate\jobservice\database
.\setup_database.ps1
```

## Manual Setup

### Step 1: Create Database

```sql
-- Run as PostgreSQL superuser
\i create_database.sql
```

Or manually:
```sql
CREATE DATABASE job_service_db;
\c job_service_db
CREATE SCHEMA jobservice;
```

### Step 2: Create Tables

```sql
\c job_service_db
\i schema.sql
```

### Step 3: Migrate Data (Optional)

If you have existing data in `careermate_db.jobservice`, you can migrate it:

```powershell
# Export data
pg_dump -U postgres -d careermate_db -t jobservice.jobs -t jobservice.applications -t jobservice.saved_jobs -t jobservice.job_skills -t jobservice.application_history --data-only --column-inserts > job_service_data.sql

# Import data
psql -U postgres -d job_service_db -f job_service_data.sql
```

## Database Structure

### Schema: `jobservice`

### Tables:
1. **jobs** - Job postings
2. **applications** - Job applications
3. **saved_jobs** - Saved jobs by students
4. **job_skills** - Skills required/optional for jobs
5. **application_history** - Application status history

## Configuration

Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/job_service_db
  jpa:
    properties:
      hibernate:
        default_schema: jobservice
```

## Verification

Check database:
```sql
\c job_service_db
\dt jobservice.*
```

Check data:
```sql
SELECT COUNT(*) FROM jobservice.jobs;
SELECT COUNT(*) FROM jobservice.applications;
```

## Troubleshooting

1. **Database already exists**: Drop and recreate:
   ```sql
   DROP DATABASE job_service_db;
   ```

2. **Permission errors**: Ensure PostgreSQL user has proper privileges

3. **Schema not found**: Run `schema.sql` again

4. **Data migration errors**: Check foreign key constraints and ensure related data exists in other service databases
