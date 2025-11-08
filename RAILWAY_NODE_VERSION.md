# Railway Node.js Version Configuration

Railway is currently using Node.js 18.20.5, but Next.js 16 requires Node.js >=20.9.0.

## Solution: Update Node.js Version in Railway

### Option 1: Railway Dashboard (Recommended)
1. Go to your Railway project dashboard
2. Select your service
3. Go to **Settings** → **Variables**
4. Look for **NIXPACKS_NODE_VERSION** or **NODE_VERSION** variable
5. If it exists, change it to `20`
6. If it doesn't exist, add a new variable:
   - Name: `NIXPACKS_NODE_VERSION`
   - Value: `20`
7. Redeploy your service

### Option 2: Use nixpacks.toml (Already Created)
I've created a `nixpacks.toml` file that specifies Node.js 20. Railway should automatically detect this on the next deployment.

### Option 3: Manual Railway Settings
1. Go to Railway → Your Service → Settings
2. Find **Build Settings** or **Environment**
3. Set Node.js version to `20` or `20.x`

## Files Created
- ✅ `nixpacks.toml` - Specifies Node.js 20 for Railway
- ✅ `.nvmrc` - Specifies Node.js 20.9.0 for version managers
- ✅ `package.json` engines field - Requires Node.js >=20.9.0
- ✅ `runtime.txt` - Alternative Node.js version specification

After updating, Railway will redeploy with Node.js 20, and your build should succeed.

