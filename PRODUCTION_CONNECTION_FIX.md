# Production Connection Fix - Complete Guide

## Problem Summary

Frontend and backend are not communicating in production due to:
1. **Frontend**: Missing or incorrect `NEXT_PUBLIC_SERVER_URL` environment variable
2. **Backend**: CORS not configured for your frontend domain
3. **Both**: Hardcoded URLs and missing environment variables

## Frontend Fixes Applied

### ✅ Fixed Issues:
1. Removed hardcoded `localhost:3001` URLs
2. Created centralized API configuration (`lib/config/api-config.ts`)
3. Updated critical API routes to use centralized config
4. Added `/api/debug` endpoint for diagnostics

### Required Frontend Environment Variable:

**`NEXT_PUBLIC_SERVER_URL`** - Your backend server URL
- Format: `https://your-backend-url.com` (no trailing slash, no `/api`)
- Example: `https://usdp-backend.vercel.app` or `https://api.yourdomain.com`
- **Where to set**: Vercel → Project Settings → Environment Variables → Add for Production

## Backend Fixes Applied

### ✅ Fixed Issues:
1. Improved CORS configuration with better logging
2. Added support for multiple environment variable names (`CLIENT_URL`, `FRONTEND_URL`)
3. Made CORS stricter in production (blocks unknown origins)
4. Added `/api/health/debug` endpoint for diagnostics

### Required Backend Environment Variable:

**`CLIENT_URL`** - Your frontend URL
- Format: `https://your-frontend-url.com` (no trailing slash)
- Example: `https://usdp-frontend.vercel.app` or `https://yourdomain.com`
- **Where to set**: Your backend hosting platform (Render, etc.) → Environment Variables

## Step-by-Step Fix

### Step 1: Set Frontend Environment Variable

1. Go to your frontend deployment platform (Vercel)
2. Navigate to: **Project Settings → Environment Variables**
3. Add new variable:
   - **Name**: `NEXT_PUBLIC_SERVER_URL`
   - **Value**: Your backend URL (e.g., `https://usdp-backend.vercel.app`)
   - **Environment**: Production (and Preview if needed)
4. **Redeploy** your frontend

### Step 2: Set Backend Environment Variable

1. Go to your backend deployment platform (Render, etc.)
2. Navigate to: **Environment Variables** or **Config Vars**
3. Add new variable:
   - **Name**: `CLIENT_URL`
   - **Value**: Your frontend URL (e.g., `https://usdp-frontend.vercel.app`)
4. **Restart** your backend server

### Step 3: Verify Configuration

#### Test Frontend:
```bash
# Visit in browser or curl:
https://your-frontend.vercel.app/api/debug
```

Should show:
- `hasServerUrl: true`
- `serverUrl: "https://your-backend-url.com"`
- `connectionTest: { success: true }`

#### Test Backend:
```bash
# Visit in browser or curl:
https://your-backend-url.com/api/health/debug
```

Should show:
- `clientUrl: "https://your-frontend-url.com"`
- `allowedOrigins: [..., "https://your-frontend-url.com"]`
- `isOriginAllowed: true` (when accessed from frontend)

### Step 4: Test Connection

1. Open your frontend in browser
2. Open browser DevTools → Network tab
3. Try to make a request (e.g., sign in, check balance)
4. Check:
   - ✅ Request goes to `/api/*` (Next.js API route)
   - ✅ No CORS errors in console
   - ✅ Response received successfully

## Troubleshooting

### Frontend shows "Cannot connect to backend"

**Check:**
1. Is `NEXT_PUBLIC_SERVER_URL` set? → Visit `/api/debug`
2. Is backend URL correct? → Test with `curl https://your-backend-url.com/api/health`
3. Did you redeploy after setting env var? → Trigger new deployment

### Browser shows CORS errors

**Check:**
1. Is `CLIENT_URL` set in backend? → Visit `/api/health/debug`
2. Does `CLIENT_URL` match your frontend URL exactly?
3. Check backend logs for CORS warnings
4. Restart backend after setting `CLIENT_URL`

### API routes return 500 errors

**Check:**
1. Backend logs for specific errors
2. Is backend running and accessible?
3. Test backend directly: `curl https://your-backend-url.com/api/health`

## Quick Verification Checklist

### Frontend:
- [ ] `NEXT_PUBLIC_SERVER_URL` is set in production environment
- [ ] Frontend has been redeployed after setting env var
- [ ] `/api/debug` shows correct configuration
- [ ] Browser console has no connection errors

### Backend:
- [ ] `CLIENT_URL` is set in backend environment
- [ ] Backend has been restarted after setting env var
- [ ] `/api/health/debug` shows frontend URL in allowed origins
- [ ] Backend logs show no CORS blocking warnings

### Connection:
- [ ] Backend is accessible: `curl https://your-backend-url.com/api/health`
- [ ] Frontend can reach backend: Check `/api/debug` connection test
- [ ] No CORS errors in browser console
- [ ] API requests succeed in Network tab

## Environment Variables Summary

### Frontend (Vercel/Next.js):
```bash
NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com
```

### Backend (Render/etc.):
```bash
CLIENT_URL=https://your-frontend-url.com
# OR
FRONTEND_URL=https://your-frontend-url.com
```

## Still Not Working?

1. **Check both debug endpoints**:
   - Frontend: `/api/debug`
   - Backend: `/api/health/debug`

2. **Share the debug output** for further assistance

3. **Check logs**:
   - Frontend: Vercel Functions logs
   - Backend: Server logs

4. **Verify URLs are correct**:
   - No typos
   - No trailing slashes
   - Using `https://` (not `http://`)

