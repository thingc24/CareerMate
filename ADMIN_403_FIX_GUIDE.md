# Admin 403 Error - Quick Fix Guide

## Problem
All admin pages return 403 Forbidden errors.

## Root Cause Investigation

### Already Verified ✓
1. ✅ JWT tokens include `role` claim (verified in AuthService.java line 123)
2. ✅ Admin-service has JWT filter with role extraction  
3. ✅ Notification-service has JWT filter with role extraction
4. ✅ Content-service has JWT filter with role extraction
5. ✅ API Gateway CORS allows Authorization headers

### Most Likely Causes

#### Cause 1: Services Not Restarted (MOST LIKELY)
The running backend services might be OLD versions without proper JWT role extraction.

**Fix**: Restart all backend services
```powershell
# Stop all services and restart with CHAY_BACKEND.ps1
```

#### Cause 2: Admin User Doesn't Have ADMIN Role
The user trying to access admin pages might not have ADMIN role in database.

**Check**: Run the SQL script `CHECK_ADMIN_USERS.sql`
```sql
SELECT id, email, role FROM users WHERE role = 'ADMIN';
```

**Fix**: Update user role to ADMIN
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

#### Cause 3: Frontend Not Sending Token
Frontend might not be including Authorization header in requests.

**Check**: Browser DevTools → Network tab → Check request headers
- Should see: `Authorization: Bearer <token>`

## Quick Fix Steps

1. **Check Database for Admin Users**
   ```bash
   mysql -u root careermate < backend/CHECK_ADMIN_USERS.sql
   ```

2. **Verify JWT Token in Browser**
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Check if `token` or `accessToken` exists
   - Copy token and decode at jwt.io to verify role claim

3. **Restart Backend Services**
   - Stop all CHAY_BACKEND.ps1 processes
   - Run `.\CHAY_BACKEND.ps1` again
   - Wait for all services to start (check eureka)

4. **Test Access**
   - Login as admin user
   - Try accessing admin dashboard
   - Check browser console for errors

## Debug Logging Added

Added comprehensive logging to `admin-service/JwtAuthenticationFilter.java`:
- Logs every request path
- Logs Authorization header presence
- Logs extracted username and role  
- Logs created authorities
- Logs validation results

To see logs:
- Check admin-service console output or logs
- Look for lines starting with "=== JWT Filter"
