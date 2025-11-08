# Railway Domain Intermittent Connection Fix

## Problem
Domain `eminaksu.tr` works initially but stops working after ~5 minutes.

## Root Causes & Solutions

### 1. **Port Configuration** ✅ FIXED
- Railway routes to port 10000 (as shown in Railway dashboard)
- Next.js now uses `PORT` environment variable (Railway sets this automatically)
- Updated `package.json` to use `${PORT:-3000}` fallback

### 2. **Cloudflare SSL/TLS Settings** (CHECK THIS)
Go to Cloudflare Dashboard → SSL/TLS:
- **SSL/TLS encryption mode**: Set to **"Full"** (not "Full Strict")
  - Full Strict requires Railway to have a valid SSL cert
  - Full allows Cloudflare to connect even if Railway cert is self-signed
- **Always Use HTTPS**: Enable this
- **Minimum TLS Version**: 1.2 (or higher)

### 3. **Cloudflare Proxy Timeout** (CHECK THIS)
Go to Cloudflare Dashboard → Speed → Optimization:
- **HTTP/2**: Enable
- **HTTP/3 (with QUIC)**: Can enable (optional)
- **Connection Timeout**: Should be at least 100 seconds

### 4. **Railway Service Configuration** (CHECK THIS)
In Railway Dashboard → Your Service → Settings:
- **Health Check**: Ensure it's configured correctly
- **Restart Policy**: Set to "Always Restart" if service crashes
- **Port**: Verify Railway is routing to the correct port (should be 10000 or PORT env var)

### 5. **Railway Environment Variables** (VERIFY)
Ensure these are set in Railway:
- `PORT` - Railway sets this automatically (usually 10000 or 3000)
- `NODE_ENV=production` - Should be set automatically

### 6. **Cloudflare DNS Settings** (VERIFY)
Current setup:
- CNAME: `eminaksu.tr` → `bs8k8dwb.up.railway.app`
- Proxy: **Proxied** (orange cloud) ✅
- TTL: Auto ✅

## Immediate Actions

1. **Update Cloudflare SSL/TLS Mode**:
   - Go to Cloudflare → SSL/TLS
   - Change from "Full Strict" to **"Full"**
   - Save and wait 2-3 minutes

2. **Verify Railway Port**:
   - Railway Dashboard → Networking
   - Check what port Railway expects (shown as "→ Port 10000")
   - Ensure `PORT` environment variable matches

3. **Test Connection**:
   ```bash
   curl -I https://eminaksu.tr
   ```
   Should return HTTP 200 OK

4. **Monitor Railway Logs**:
   - Railway Dashboard → Deployments → View Logs
   - Check for any errors or connection timeouts

## Why It Works Then Stops

Possible reasons:
1. **Cloudflare SSL handshake timeout** - Fixed by changing SSL mode to "Full"
2. **Railway service sleeping** - Railway keeps services awake, but check logs
3. **Connection pool exhaustion** - Cloudflare might be closing connections
4. **Railway port mismatch** - Fixed by using PORT env var

## Testing

After making changes:
1. Wait 2-3 minutes for DNS/SSL propagation
2. Test: `curl -I https://eminaksu.tr`
3. Wait 10 minutes
4. Test again: `curl -I https://eminaksu.tr`
5. If both work, the issue is resolved

## If Still Not Working

1. **Try DNS-only mode temporarily**:
   - Cloudflare → DNS → Edit CNAME
   - Change from Proxied (orange) to DNS only (gray)
   - Test if it works consistently
   - If yes, the issue is Cloudflare proxy settings

2. **Check Railway logs**:
   - Look for connection errors
   - Check if service is restarting

3. **Contact Railway Support**:
   - If port configuration is incorrect
   - If service is crashing

