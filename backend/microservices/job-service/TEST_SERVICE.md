# Job-Service Testing Guide

## Services Started:

1. **Eureka Server** - Port 8761
2. **User-Service** - Port 8081
3. **Job-Service** - Port 8082

## Test Endpoints:

### 1. Health Check
```bash
# Job-Service Health
curl http://localhost:8082/actuator/health

# User-Service Health
curl http://localhost:8081/actuator/health

# Eureka Dashboard
http://localhost:8761
```

### 2. Test Feign Clients

#### Get Current Recruiter Profile (via User-Service)
```bash
# First, login to get JWT token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@example.com","password":"password"}'

# Then use token to get recruiter profile
curl http://localhost:8081/recruiters/profile/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Company (via Content-Service - if available)
```bash
curl http://localhost:8083/companies/{companyId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Job-Service Endpoints

#### Search Jobs (Public - No Auth Required)
```bash
curl "http://localhost:8082/api/jobs/search?keyword=developer&location=Hanoi&page=0&size=10"
```

#### Get Job by ID (Public - No Auth Required)
```bash
curl http://localhost:8082/api/jobs/{jobId}
```

#### Create Job (Requires RECRUITER role)
```bash
curl -X POST http://localhost:8082/api/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Java Developer",
    "description": "We are looking for...",
    "location": "Hanoi",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "minSalary": 20000000,
    "maxSalary": 40000000,
    "currency": "VND"
  }' \
  --data-urlencode "requiredSkills=Java,Spring Boot" \
  --data-urlencode "optionalSkills=Kubernetes,Docker"
```

#### Get My Jobs (Requires RECRUITER role)
```bash
curl "http://localhost:8082/api/jobs/my-jobs?page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Behavior:

1. **createJob()**: 
   - Should call `UserServiceClient.getCurrentRecruiterProfile()`
   - Should call `ContentServiceClient.getCompanyById()`
   - Should create job with recruiterId and companyId
   - Should send notification via `NotificationServiceClient`

2. **getMyJobs()**:
   - Should call `UserServiceClient.getCurrentRecruiterProfile()`
   - Should return jobs for current recruiter

3. **getJob()**:
   - Should check if job is hidden
   - Should verify ownership using `UserServiceClient` if needed

## Troubleshooting:

- Check Eureka Dashboard: http://localhost:8761
- Check service logs in their respective PowerShell windows
- Verify database connections
- Check Feign Client calls in logs
