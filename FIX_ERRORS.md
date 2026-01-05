# 🔧 Fix Script for SpendWise

## Issue: Worklets Version Mismatch & Redux Provider

### Quick Fix Steps:

1. **Stop the Metro bundler** (Press Ctrl+C in the terminal where `npm start` is running)

2. **Clear all caches:**
```powershell
cd "c:\Users\HP\Desktop\Side Projects\spendwise"

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear Metro bundler cache
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force $env:LOCALAPPDATA\Expo

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

3. **Start fresh:**
```powershell
npm start -- --clear
```

4. **On your Android device/emulator:**
- Close the Expo Go app completely
- Clear the app cache (Settings > Apps > Expo Go > Clear Cache)
- Reopen and scan the QR code

### Alternative: Simpler Fix

If the above doesn't work, try this simpler approach:

```powershell
# Just clear Metro cache and restart
npm start -- --clear
```

Then press `r` to reload the app.

---

### What's Causing the Errors?

1. **Worklets Mismatch**: The native binary (0.5.1) doesn't match the JS (0.7.1). This is fixed by clearing node_modules and reinstalling.

2. **Redux Provider**: The Provider IS properly set up in `app/_layout.tsx`, but the app bundle might be cached with old code.

### Expected Result

After clearing cache and restarting, you should see:
- ✅ No worklets errors
- ✅ Redux Provider working
- ✅ App loads the Home screen
- ✅ Can add expenses
