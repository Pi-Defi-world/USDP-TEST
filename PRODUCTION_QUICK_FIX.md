# Quick Fix: Render + Vercel Production Setup

## The Problem
You're using Render (separate account) for backend and Vercel for frontend, but they can't communicate in production.

## The Solution (3 Steps)

### Step 1: Set Environment Variable in Vercel ✅

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `NEXT_PUBLIC_SERVER_URL`
   - **Value**: Your Render backend URL (e.g., `https://your-app.onrender.com`)
   - **Important**: 
     - ✅ Use `https://`
     - ✅ No trailing slash
     - ✅ No `/api` path
   - **Environment**: Select **Production** (and Preview if needed)
3. Click **Save**

### Step 2: Configure Backend CORS ✅

1. Go to **Render Dashboard** → Your Backend Service → **Environment**
2. Add environment variable:
   - **Key**: `CLIENT_URL` (or `FRONTEND_URL` or `CORS_ORIGIN`)
   - **Value**: Your Vercel frontend URL (e.g., `https://your-frontend.vercel.app`)
   - **Important**: No trailing slash!
3. Make sure your backend CORS configuration uses this variable
4. Restart your Render service

### Step 3: Redeploy ✅

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on latest deployment → **"Redeploy"**
3. Wait for deployment to complete

## Verify It Works

### Test 1: Check Config
Visit: `https://your-frontend.vercel.app/api/debug`

Should show your Render backend URL in `nextPublicServerUrl`

### Test 2: Test Connection
Visit: `https://your-frontend.vercel.app/api/test-connection`

Should show `success: true` with connection successful

## What Changed in Code

✅ Removed excessive logging from API client  
✅ Simplified error handling  
✅ Removed localhost:3001 references from production error messages  
✅ Code now uses clean proxy pattern: Browser → Next.js `/api` → Render backend

## How It Works

```
Browser Request → /api/auth/signin
       ↓
Next.js API Route (app/api/auth/signin/route.ts)
       ↓
Reads NEXT_PUBLIC_SERVER_URL from environment
       ↓
Proxies to: https://your-backend.onrender.com/api/auth/signin
       ↓
Response flows back
```

## Still Not Working?

1. **Check Render logs**: Render Dashboard → Your Service → Logs
   - Is backend running?
   - Any CORS errors?

2. **Check Vercel logs**: Vercel Dashboard → Your Project → Functions → Logs
   - Any connection errors?
   - Is NEXT_PUBLIC_SERVER_URL being read?

3. **Test Render backend directly**:
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   If this fails, your backend isn't accessible.

4. **Verify environment variable**:
   - Make sure it's set for the right environment (Production)
   - Make sure you redeployed after setting it
   - Check `/api/debug` endpoint to confirm it's being read

## Common Issues

**Issue**: CORS errors in browser console  
**Fix**: Make sure Render backend has `CLIENT_URL` set to your Vercel domain

**Issue**: "Cannot connect to backend"  
**Fix**: 
- Verify `NEXT_PUBLIC_SERVER_URL` is set correctly in Vercel
- Test Render backend directly with curl
- Redeploy Vercel after setting environment variable

**Issue**: 404 errors on API routes  
**Fix**: Make sure `NEXT_PUBLIC_SERVER_URL` doesn't include `/api` path

**Issue**: Environment variable not being read  
**Fix**: 
- Make sure it's set for Production environment
- Redeploy Vercel (required for NEXT_PUBLIC_* variables)

