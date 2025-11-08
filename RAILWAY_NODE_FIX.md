# Railway Node.js 20 Configuration Fix

The `nixpacks.toml` file had incorrect syntax. I've simplified it.

## Current Setup
- ✅ `nixpacks.toml` - Now uses correct syntax: `[providers] node = "20"`
- ✅ `package.json` engines field - Requires Node.js >=20.9.0
- ✅ `.nvmrc` - Specifies Node.js 20.9.0

## If Build Still Fails

**Option 1: Set Environment Variable in Railway (Most Reliable)**
1. Go to Railway → Your Service → Settings → Variables
2. Add variable:
   - Name: `NIXPACKS_NODE_VERSION`
   - Value: `20`
3. Redeploy

**Option 2: Use Railway's Node.js Setting**
1. Go to Railway → Your Service → Settings
2. Look for "Node.js Version" or "Runtime Version"
3. Set it to `20` or `20.x`
4. Redeploy

**Option 3: Delete nixpacks.toml and use Railway Dashboard**
If the file causes issues, delete `nixpacks.toml` and configure Node.js version directly in Railway dashboard settings.

The simplified `nixpacks.toml` should work, but Railway's dashboard settings are the most reliable method.

