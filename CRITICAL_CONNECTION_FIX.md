# 🚨 CRITICAL: Backend Connection Fix

## The Problem

**`NEXT_PUBLIC_*` environment variables are embedded at BUILD TIME, not runtime.**

If you set `NEXT_PUBLIC_SERVER_URL` after building your app, it won't work! You need to either:
1. Use `SERVER_URL` (works at runtime, no rebuild needed) ✅ **RECOMMENDED**
2. Set `NEXT_PUBLIC_SERVER_URL` and rebuild/redeploy

## ✅ IMMEDIATE FIX (No Rebuild Required)

### Step 1: Add Runtime Environment Variable

In **Vercel** (or your deployment platform):

1. Go to **Project Settings → Environment Variables**
2. **Add NEW variable:**
   - **Name:** `SERVER_URL`
   - **Value:** `https://your-backend-url.com` (no trailing slash, no `/api`)
   - **Environment:** Production (and Preview if needed)
3. **DO NOT delete** `NEXT_PUBLIC_SERVER_URL` if you have it (it's fine to have both)
4. **Redeploy** (this will pick up the new variable without a full rebuild)

### Step 2: Verify Backend is Accessible

Test your backend directly:
```bash
curl https://your-backend-url.com/api/health
```

If this fails, your backend is not accessible from the internet. Check:
- Backend is running
- Backend URL is correct
- Firewall/security groups allow inbound connections
- Backend CORS allows your frontend domain

### Step 3: Test Connection

Visit in your browser:
```
https://your-frontend.vercel.app/api/test-connection
```

This will show:
- ✅ Which environment variables are set
- ✅ What backend URL is being used
- ✅ Connection test results
- ✅ Specific error messages if connection fails

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"

**Check 1: Environment Variable**
- Visit `/api/test-connection` - it shows if `SERVER_URL` is set
- If "NOT SET", add `SERVER_URL` in Vercel and redeploy

**Check 2: Backend URL Format**
- ✅ Correct: `https://api.yourdomain.com`
- ✅ Correct: `https://your-backend.vercel.app`
- ❌ Wrong: `https://api.yourdomain.com/` (trailing slash)
- ❌ Wrong: `https://api.yourdomain.com/api` (don't include `/api`)

**Check 3: Network Connectivity**
- Test backend directly: `curl https://your-backend-url.com/api/health`
- If curl fails, backend is not accessible (firewall/network issue)
- Check Vercel Function Logs for connection errors

**Check 4: CORS Configuration**
- Backend must allow your frontend domain
- Check backend logs for CORS errors
- Backend should allow: `https://your-frontend.vercel.app`

**Check 5: Backend is Running**
- Verify backend is actually running
- Check backend logs for errors
- Test backend health endpoint directly

### Issue: "Request timed out"

- Backend may be slow or unreachable
- Check backend performance
- Verify backend is not blocked by firewall
- Check Vercel Function Logs for timeout errors

### Issue: "ECONNREFUSED" or "ENOTFOUND"

- Backend URL is incorrect (typo)
- Backend DNS is not resolving
- Backend is not accessible from Vercel's network
- Test backend URL with `curl` or browser

## 📋 What Changed

1. **Added `SERVER_URL` support** - Works at runtime (no rebuild needed)
2. **Added fetch timeouts** - Prevents hanging requests (30s default)
3. **Better error messages** - Shows exactly what's wrong
4. **Diagnostic endpoint** - `/api/test-connection` for troubleshooting
5. **Enhanced logging** - All API routes log connection attempts

## 🔧 Technical Details

### Environment Variables Priority

1. `SERVER_URL` (runtime) - ✅ Works without rebuild
2. `NEXT_PUBLIC_SERVER_URL` (build-time) - Requires rebuild
3. Development fallback: `http://localhost:3001`
4. Error if none set in production

### Fetch Timeouts

- Health checks: 10 seconds
- API requests: 30 seconds
- Prevents hanging in serverless environments

### Error Handling

All API routes now:
- Log connection attempts with backend URL
- Show specific error messages
- Include troubleshooting hints
- Timeout gracefully instead of hanging

## 🚀 Next Steps

1. **Add `SERVER_URL` in Vercel** (see Step 1 above)
2. **Redeploy** your frontend
3. **Test connection** at `/api/test-connection`
4. **Check Vercel Function Logs** if still failing
5. **Verify backend** is accessible and CORS is configured

## 📞 Still Not Working?

If connection still fails after following all steps:

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Your Project → Functions → Logs
   - Look for `[API Route]` messages
   - Check for specific error messages

2. **Check Backend Logs:**
   - Verify backend is receiving requests
   - Check for CORS errors
   - Verify backend health endpoint works

3. **Network Test:**
   - Test backend directly: `curl https://your-backend-url.com/api/health`
   - If this fails, backend is not accessible (not a frontend issue)

4. **Share Diagnostic Info:**
   - Visit `/api/test-connection` and share the output
   - Share relevant Vercel Function Logs
   - Share backend logs if available

