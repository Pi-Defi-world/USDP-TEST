# Production Connection Troubleshooting Guide

## Quick Diagnosis

Visit `/api/debug` in your production app to see:
- Whether `NEXT_PUBLIC_SERVER_URL` is set
- What backend URL is being resolved
- Connection test results

Example: `https://your-frontend.vercel.app/api/debug`

## Common Issues & Solutions

### Issue 1: `NEXT_PUBLIC_SERVER_URL` Not Set

**Symptoms:**
- API requests fail with "Cannot connect to backend"
- Browser console shows errors about undefined URLs
- `/api/debug` shows `serverUrl: "NOT SET"`

**Solution:**
1. Go to your deployment platform (Vercel, etc.)
2. Navigate to Project Settings → Environment Variables
3. Add: `NEXT_PUBLIC_SERVER_URL` = `https://your-backend-url.com`
4. **Important**: 
   - No trailing slash
   - No `/api` path
   - Use full URL with `https://`
5. Redeploy your frontend

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- Network tab shows preflight (OPTIONS) requests failing
- Requests return 403 or CORS-related errors

**Solution:**
1. Update your backend CORS configuration to allow your frontend domain
2. Example backend CORS config:
   ```javascript
   cors({
     origin: [
       'https://your-frontend.vercel.app',
       'https://yourdomain.com'
     ],
     credentials: true
   })
   ```

### Issue 3: Backend Not Accessible

**Symptoms:**
- Connection timeouts
- Network errors
- 502/503 errors

**Solution:**
1. Verify backend is running and accessible
2. Test backend directly: `curl https://your-backend-url.com/api/health`
3. Check backend logs for errors
4. Verify backend URL is correct (no typos)

### Issue 4: Environment Variable Not Applied

**Symptoms:**
- Variable is set but still shows as "NOT SET"
- Old behavior persists after redeploy

**Solution:**
1. **Vercel**: 
   - Make sure variable is set for correct environment (Production/Preview)
   - Variables starting with `NEXT_PUBLIC_` are exposed to browser
   - After adding, trigger a new deployment
2. **Other platforms**: Follow platform-specific instructions
3. Clear build cache and redeploy

### Issue 5: API Routes Returning Errors

**Symptoms:**
- API routes return 500 errors
- Server logs show "NEXT_PUBLIC_SERVER_URL is required"

**Solution:**
- This means the environment variable is missing
- Set `NEXT_PUBLIC_SERVER_URL` as described in Issue 1

## Step-by-Step Debugging

1. **Check Environment Variable**:
   ```bash
   # In your deployment platform, verify:
   NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com
   ```

2. **Test Backend Directly**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```
   Should return JSON response

3. **Test Frontend API Route**:
   ```bash
   curl https://your-frontend.vercel.app/api/debug
   ```
   Should show configuration and connection status

4. **Check Browser Console**:
   - Open browser DevTools
   - Check Network tab for failed requests
   - Look for CORS errors or connection errors

5. **Check Server Logs**:
   - Vercel: Functions → Logs
   - Look for errors in API route execution

## Expected Flow

1. **Client** makes request to `/api/auth/signin`
2. **Next.js API Route** (`app/api/auth/signin/route.ts`) receives request
3. **API Route** calls `getBackendUrl()` which returns `NEXT_PUBLIC_SERVER_URL`
4. **API Route** proxies request to `${NEXT_PUBLIC_SERVER_URL}/api/auth/signin`
5. **Backend** processes request and responds
6. **API Route** returns response to client

## Verification Checklist

- [ ] `NEXT_PUBLIC_SERVER_URL` is set in production environment
- [ ] Backend URL is accessible (test with curl)
- [ ] Backend CORS allows frontend domain
- [ ] Frontend has been redeployed after setting env var
- [ ] `/api/debug` shows correct configuration
- [ ] Browser console has no CORS errors
- [ ] Network tab shows successful API requests

## Still Not Working?

1. Check `/api/debug` endpoint output
2. Share the debug output for further assistance
3. Check both frontend and backend server logs
4. Verify backend is actually running and accessible

